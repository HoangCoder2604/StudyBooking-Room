const assert = require('node:assert/strict');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const { WebSocket } = require('ws');

const base = 'http://127.0.0.1:4000';
async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  return { status: response.status, data: await response.json() };
}

async function login(email) {
  const response = await request('/api/auth/login', { method:'POST', body:{ email, password:'123456' } });
  assert.equal(response.status, 200);
  return response.data.token;
}

function connectSocket(token) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(`ws://127.0.0.1:4000/ws?token=${encodeURIComponent(token)}`);
    socket.once('open', () => resolve(socket));
    socket.once('error', reject);
  });
}

function waitForEvent(socket, predicate) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timed out waiting for realtime event')), 3000);
    const receive = (raw) => {
      const event = JSON.parse(raw.toString());
      if (!predicate(event)) return;
      clearTimeout(timer);
      socket.off('message', receive);
      resolve(event);
    };
    socket.on('message', receive);
  });
}

(async () => {
  const [tokenA, tokenB] = await Promise.all([login('student@example.com'), login('student2@example.com')]);
  const rooms = await request('/api/rooms?date=2099-12-31&startTime=08%3A00&endTime=10%3A00&size=Medium&status=available&facility=Projector&minCapacity=10', { token:tokenA });
  assert.equal(rooms.status, 200);
  assert.ok(rooms.data.rooms.some(room => room.id === 'R001'));

  const socket = await connectSocket(tokenA);
  const realtimeUpdate = waitForEvent(socket, event => event.type === 'rooms_updated' && event.reason === 'booking_created');
  const booking = { roomId:'R002', date:'2099-12-31', startTime:'14:00', endTime:'15:00', purpose:'Concurrency test', note:'' };
  const results = await Promise.all([
    request('/api/bookings', { method:'POST', token:tokenA, body:booking }),
    request('/api/bookings', { method:'POST', token:tokenB, body:booking })
  ]);
  assert.deepEqual(results.map(result => result.status).sort(), [201, 409]);
  assert.equal((await realtimeUpdate).roomId, 'R002');
  socket.close();
  const winner = results.find(result => result.status === 201);
  const winnerToken = results[0].status === 201 ? tokenA : tokenB;
  await request(`/api/bookings/${winner.data.booking.id}/cancel`, { method:'PATCH', token:winnerToken });
  const db = new DatabaseSync(path.join(__dirname, 'studyroom.db'));
  db.exec('PRAGMA busy_timeout = 5000');
  const demoUser = db.prepare("SELECT id FROM users WHERE email = 'student@example.com'").get();
  db.prepare(`INSERT OR REPLACE INTO bookings (id, room_id, user_id, date, start_time, end_time, purpose, note, status)
    VALUES ('BK-EXPIRY-TEST', 'R006', ?, '2000-01-01', '08:00', '09:00', 'Expiry test', '', 'confirmed')`).run(demoUser.id);
  const afterExpirySweep = await request('/api/bookings', { token:tokenA });
  assert.equal(afterExpirySweep.data.bookings.find(item => item.id === 'BK-EXPIRY-TEST').status, 'completed');
  db.prepare("DELETE FROM bookings WHERE purpose = 'Concurrency test'").run();
  db.prepare("DELETE FROM bookings WHERE id = 'BK-EXPIRY-TEST'").run();
  db.close();
  console.log('Integration OK: auth, multi-filter search, realtime WebSocket, transaction conflict (201 + 409), cancellation, automatic expiry');
})().catch(error => { console.error(error); process.exit(1); });
