const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT || 4000);
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'study-room-local-development-secret';
const db = new DatabaseSync(path.join(__dirname, 'studyroom.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    student_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    notifications_enabled INTEGER NOT NULL DEFAULT 1,
    theme TEXT NOT NULL DEFAULT 'light',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    building TEXT NOT NULL,
    floor INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    size TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    facilities TEXT NOT NULL,
    description TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    purpose TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'confirmed',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_booking_conflict
  ON bookings(room_id, date, status, start_time, end_time);

  CREATE TABLE IF NOT EXISTS push_tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const rooms = [
  ['R001', 'Room A101', 'Building A - Floor 1', 'Building A', 1, 20, 'Medium', 'active', ['Projector', 'WiFi', 'Air Conditioner', 'Whiteboard'], 'A bright study room for group discussion, presentations, and project work.'],
  ['R002', 'Room A204', 'Building A - Floor 2', 'Building A', 2, 8, 'Small', 'active', ['WiFi', 'Whiteboard'], 'Compact room suitable for small study groups and tutoring sessions.'],
  ['R003', 'Room B205', 'Building B - Floor 2', 'Building B', 2, 40, 'Large', 'active', ['Projector', 'WiFi', 'Smart TV', 'Air Conditioner'], 'Large classroom designed for presentations, workshops, and collaborative learning.'],
  ['R004', 'Library G02', 'Central Library - Ground Floor', 'Central Library', 0, 12, 'Medium', 'active', ['WiFi', 'Whiteboard', 'Air Conditioner'], 'Quiet room close to library resources, ideal for focused team study.'],
  ['R005', 'Innovation Lab 301', 'Innovation Center - Floor 3', 'Innovation Center', 3, 30, 'Large', 'maintenance', ['Projector', 'WiFi', 'Smart TV', 'Computer'], 'Technology-enabled collaborative room. Temporarily unavailable for maintenance.'],
  ['R006', 'Room C103', 'Building C - Floor 1', 'Building C', 1, 16, 'Medium', 'active', ['Projector', 'WiFi', 'Whiteboard'], 'Comfortable classroom for medium-sized project teams and meetings.']
];

const insertRoom = db.prepare(`
  INSERT OR IGNORE INTO rooms
  (id, name, location, building, floor, capacity, size, status, facilities, description)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
for (const room of rooms) insertRoom.run(...room.slice(0, 8), JSON.stringify(room[8]), room[9]);

function passwordHash(password, salt = crypto.randomBytes(16).toString('hex')) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const actual = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

const seedUser = db.prepare('INSERT OR IGNORE INTO users (name, student_id, email, password_hash) VALUES (?, ?, ?, ?)');
seedUser.run('Nguyen Van Hoang', '23IT.B065', 'student@example.com', passwordHash('123456'));
seedUser.run('Tran Minh Anh', '23IT.B066', 'student2@example.com', passwordHash('123456'));

function signToken(user) {
  const payload = Buffer.from(JSON.stringify({ id: user.id, exp: Date.now() + 7 * 86400000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

function readToken(req) {
  const value = req.headers.authorization || '';
  return verifyToken(value.startsWith('Bearer ') ? value.slice(7) : '');
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    studentId: user.student_id,
    email: user.email,
    role: user.role,
    notificationsEnabled: Boolean(user.notifications_enabled),
    theme: user.theme
  };
}

function send(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

async function body(req) {
  const chunks = [];
  let length = 0;
  for await (const chunk of req) {
    length += chunk.length;
    if (length > 100000) throw new Error('Request body is too large.');
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function roomDto(row, slot) {
  let available = row.status === 'active';
  if (available && slot.date && slot.startTime && slot.endTime) {
    available = !db.prepare(`
      SELECT 1 FROM bookings
      WHERE room_id = ? AND date = ? AND status = 'confirmed'
        AND start_time < ? AND end_time > ? LIMIT 1
    `).get(row.id, slot.date, slot.endTime, slot.startTime);
  }
  return {
    ...row,
    facilities: JSON.parse(row.facilities),
    available,
    availabilityStatus: row.status !== 'active' ? 'maintenance' : available ? 'available' : 'booked'
  };
}

function bookingDto(row) {
  return {
    id: row.id,
    roomId: row.room_id,
    roomName: row.room_name,
    location: row.location,
    userId: row.user_id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    purpose: row.purpose,
    note: row.note,
    status: row.status,
    createdAt: row.created_at
  };
}

const bookingSelect = `
  SELECT b.*, r.name AS room_name, r.location
  FROM bookings b JOIN rooms r ON r.id = b.room_id
`;

let broadcastEvent = () => {};

async function sendExpoPush(userId, title, message, data = {}) {
  const tokens = db.prepare(`SELECT p.token FROM push_tokens p JOIN users u ON u.id = p.user_id
    WHERE p.user_id = ? AND u.notifications_enabled = 1`).all(userId).map(row => row.token);
  if (!tokens.length) return;
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Accept:'application/json', 'Accept-Encoding':'gzip, deflate' },
      body:JSON.stringify(tokens.map(to => ({ to,title,body:message,data,sound:'default',channelId:'bookings' })))
    });
  } catch (error) {
    console.warn('Could not send Expo push notification:', error.message);
  }
}

function releaseExpiredBookings() {
  const expired = db.prepare(`
    UPDATE bookings
    SET status = 'completed'
    WHERE status = 'confirmed'
      AND datetime(date || ' ' || end_time) <= datetime('now', 'localtime')
    RETURNING id, user_id, room_id, date, end_time
  `).all();
  if (expired.length) {
    broadcastEvent({ type:'rooms_updated', reason:'booking_completed' });
    for (const item of expired) {
      const event = { type:'booking_completed', userId:item.user_id, bookingId:item.id, title:'Booking đã hoàn thành', message:`Booking ${item.id} đã kết thúc và phòng đã được giải phóng.` };
      broadcastEvent(event, item.user_id);
      sendExpoPush(item.user_id, event.title, event.message, { bookingId:item.id, type:event.type });
    }
  }
  return expired.length;
}

releaseExpiredBookings();
const expiryTimer = setInterval(releaseExpiredBookings, 30000);
expiryTimer.unref();

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, { ok: true, database: 'sqlite', time: new Date().toISOString() });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/login') {
      const input = await body(req);
      const user = db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(String(input.email || '').trim());
      if (!user || !verifyPassword(String(input.password || ''), user.password_hash)) {
        return send(res, 401, { message: 'Email hoặc mật khẩu không đúng.' });
      }
      return send(res, 200, { token: signToken(user), user: publicUser(user) });
    }

    if (req.method === 'POST' && url.pathname === '/api/auth/register') {
      const input = await body(req);
      const name = String(input.name || '').trim();
      const studentId = String(input.studentId || '').trim();
      const email = String(input.email || '').trim().toLowerCase();
      const password = String(input.password || '');
      if (!name || !studentId || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) {
        return send(res, 400, { message: 'Vui lòng nhập đủ thông tin; mật khẩu tối thiểu 6 ký tự.' });
      }
      try {
        const result = db.prepare('INSERT INTO users (name, student_id, email, password_hash) VALUES (?, ?, ?, ?)')
          .run(name, studentId, email, passwordHash(password));
        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
        return send(res, 201, { token: signToken(user), user: publicUser(user) });
      } catch (error) {
        if (String(error.message).includes('UNIQUE')) return send(res, 409, { message: 'Email hoặc mã sinh viên đã được sử dụng.' });
        throw error;
      }
    }

    const session = readToken(req);
    if (!session) return send(res, 401, { message: 'Phiên đăng nhập đã hết hạn.' });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(session.id);
    if (!user) return send(res, 401, { message: 'Tài khoản không tồn tại.' });
    releaseExpiredBookings();

    if (req.method === 'GET' && url.pathname === '/api/me') return send(res, 200, { user: publicUser(user) });

    if (req.method === 'PATCH' && url.pathname === '/api/me/preferences') {
      const input = await body(req);
      const enabled = input.notificationsEnabled == null ? user.notifications_enabled : Number(Boolean(input.notificationsEnabled));
      const theme = ['light', 'dark', 'system'].includes(input.theme) ? input.theme : user.theme;
      db.prepare('UPDATE users SET notifications_enabled = ?, theme = ? WHERE id = ?').run(enabled, theme, user.id);
      return send(res, 200, { user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(user.id)) });
    }

    if (req.method === 'POST' && url.pathname === '/api/push-tokens') {
      const input = await body(req);
      const pushToken = String(input.token || '').trim();
      if (!/^ExponentPushToken\[.+\]$|^ExpoPushToken\[.+\]$/.test(pushToken)) return send(res, 400, { message:'Push token không hợp lệ.' });
      db.prepare(`INSERT INTO push_tokens (token,user_id,platform,updated_at) VALUES (?,?,?,CURRENT_TIMESTAMP)
        ON CONFLICT(token) DO UPDATE SET user_id=excluded.user_id,platform=excluded.platform,updated_at=CURRENT_TIMESTAMP`)
        .run(pushToken,user.id,String(input.platform || 'unknown'));
      return send(res, 201, { ok:true });
    }

    if (req.method === 'GET' && url.pathname === '/api/rooms') {
      const slot = {
        date: url.searchParams.get('date') || '',
        startTime: url.searchParams.get('startTime') || '',
        endTime: url.searchParams.get('endTime') || ''
      };
      if (slot.startTime && slot.endTime && slot.startTime >= slot.endTime) {
        return send(res, 400, { message: 'Giờ kết thúc phải sau giờ bắt đầu.' });
      }
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const size = url.searchParams.get('size') || 'All';
      const building = url.searchParams.get('building') || 'All';
      const status = url.searchParams.get('status') || 'All';
      const facility = url.searchParams.get('facility') || 'All';
      const minCapacity = Number(url.searchParams.get('minCapacity') || 0);
      const result = db.prepare('SELECT * FROM rooms ORDER BY name').all()
        .map((row) => roomDto(row, slot))
        .filter((room) => !q || `${room.name} ${room.location}`.toLowerCase().includes(q))
        .filter((room) => size === 'All' || room.size === size)
        .filter((room) => building === 'All' || room.building === building)
        .filter((room) => status === 'All' || room.availabilityStatus === status)
        .filter((room) => facility === 'All' || room.facilities.includes(facility))
        .filter((room) => room.capacity >= minCapacity);
      return send(res, 200, { rooms: result });
    }

    if (req.method === 'GET' && url.pathname === '/api/bookings') {
      const rows = db.prepare(`${bookingSelect} WHERE b.user_id = ? ORDER BY b.date DESC, b.start_time DESC`).all(user.id);
      return send(res, 200, { bookings: rows.map(bookingDto) });
    }

    if (req.method === 'POST' && url.pathname === '/api/bookings') {
      const input = await body(req);
      const roomId = String(input.roomId || '');
      const date = String(input.date || '');
      const startTime = String(input.startTime || '');
      const endTime = String(input.endTime || '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime) || startTime >= endTime) {
        return send(res, 400, { message: 'Ngày hoặc khoảng thời gian không hợp lệ.' });
      }
      if (new Date(`${date}T${startTime}:00`).getTime() <= Date.now()) {
        return send(res, 400, { message: 'Không thể đặt một khung giờ đã bắt đầu hoặc đã kết thúc.' });
      }

      db.exec('BEGIN IMMEDIATE');
      try {
        const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(roomId);
        if (!room || room.status !== 'active') {
          db.exec('ROLLBACK');
          return send(res, 409, { message: 'Phòng hiện không hoạt động.' });
        }
        const conflict = db.prepare(`
          SELECT id FROM bookings
          WHERE room_id = ? AND date = ? AND status = 'confirmed'
            AND start_time < ? AND end_time > ? LIMIT 1
        `).get(roomId, date, endTime, startTime);
        if (conflict) {
          db.exec('ROLLBACK');
          return send(res, 409, { code: 'BOOKING_CONFLICT', message: 'Phòng vừa được người khác đặt trong khung giờ này. Vui lòng chọn giờ hoặc phòng khác.' });
        }
        const id = `BK-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
        db.prepare(`
          INSERT INTO bookings (id, room_id, user_id, date, start_time, end_time, purpose, note)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, roomId, user.id, date, startTime, endTime, String(input.purpose || 'Study').trim(), String(input.note || '').trim());
        db.exec('COMMIT');
        const created = db.prepare(`${bookingSelect} WHERE b.id = ?`).get(id);
        const event = { type:'booking_created', userId:user.id, bookingId:id, roomId, title:'Đặt phòng thành công', message:`${room.name} · ${date} · ${startTime}-${endTime}` };
        broadcastEvent({ type:'rooms_updated', reason:'booking_created', roomId });
        broadcastEvent(event, user.id);
        sendExpoPush(user.id, event.title, event.message, { bookingId:id, type:event.type });
        return send(res, 201, { booking: bookingDto(created) });
      } catch (error) {
        try { db.exec('ROLLBACK'); } catch {}
        throw error;
      }
    }

    const cancelMatch = url.pathname.match(/^\/api\/bookings\/([^/]+)\/cancel$/);
    if (req.method === 'PATCH' && cancelMatch) {
      const result = db.prepare(`
        UPDATE bookings SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ? AND status = 'confirmed'
      `).run(decodeURIComponent(cancelMatch[1]), user.id);
      if (!result.changes) return send(res, 404, { message: 'Không tìm thấy booking đang hoạt động.' });
      const event = { type:'booking_cancelled', userId:user.id, bookingId:decodeURIComponent(cancelMatch[1]), title:'Booking đã hủy', message:'Booking của bạn đã được hủy và phòng đã được giải phóng.' };
      broadcastEvent({ type:'rooms_updated', reason:'booking_cancelled' });
      broadcastEvent(event, user.id);
      sendExpoPush(user.id, event.title, event.message, { bookingId:event.bookingId, type:event.type });
      return send(res, 200, { ok: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/notifications') {
      const rows = db.prepare(`${bookingSelect} WHERE b.user_id = ? ORDER BY b.created_at DESC LIMIT 30`).all(user.id);
      const notifications = rows.map((item) => ({
        id: `notification-${item.id}`,
        title: item.status === 'cancelled' ? 'Booking đã hủy' : item.status === 'completed' ? 'Booking đã hoàn thành' : 'Đặt phòng thành công',
        message: `${item.room_name} · ${item.date} · ${item.start_time}-${item.end_time}`,
        createdAt: item.created_at,
        type: item.status
      }));
      return send(res, 200, { notifications });
    }

    return send(res, 404, { message: 'API không tồn tại.' });
  } catch (error) {
    console.error(error);
    return send(res, 500, { message: 'Máy chủ gặp lỗi. Vui lòng thử lại.' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`StudyRoom API running at http://localhost:${PORT}`);
});

const sockets = new WebSocketServer({ noServer:true });
server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const session = url.pathname === '/ws' ? verifyToken(url.searchParams.get('token') || '') : null;
  if (!session) return socket.destroy();
  sockets.handleUpgrade(request, socket, head, (client) => {
    client.userId = session.id;
    sockets.emit('connection', client, request);
  });
});

broadcastEvent = (event, userId = null) => {
  const payload = JSON.stringify(event);
  for (const client of sockets.clients) {
    if (client.readyState === 1 && (userId == null || client.userId === userId)) client.send(payload);
  }
};

sockets.on('connection', (client) => client.send(JSON.stringify({ type:'connected' })));
