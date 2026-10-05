# StudyBooking-Room — Vercel + Turso

This version keeps the Expo web frontend and Node API in one Vercel project and moves the persistent SQLite database to Turso (libSQL).

## 1. Create Turso database
Create a Turso database and obtain:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

## 2. Vercel project
- Root Directory: `.`
- Build Command: `npx expo export -p web`
- Output Directory: `dist`
- Install Command: `npm install`

## 3. Environment variables
Set these in Vercel:
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `TOKEN_SECRET` (long random secret)
- `EXPO_PUBLIC_API_URL` = your Vercel deployment URL, e.g. `https://your-project.vercel.app`

The API is available under the same domain, for example `/api/health`, `/api/auth/login`, `/api/auth/register`, `/api/rooms`, and `/api/bookings`.

## 4. Important
The Vercel backend no longer uses `server/studyroom.db` for production data. Turso is the persistent database. The old local SQLite backend is kept as `server/server.local.js` so `npm run server` still works locally.

## 5. First test
Open `https://YOUR-PROJECT.vercel.app/api/health`. It should return JSON with `ok: true` and `database: "turso"`. Then test registration, login, room listing, booking and cancellation.

## WebSocket
The original local backend used a `ws` server. The Vercel API version intentionally does not depend on a long-lived Node WebSocket server; core authentication and booking APIs remain HTTP based. The frontend can continue to run its WebSocket attempt and fall back to normal API refresh behavior.
