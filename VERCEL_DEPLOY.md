# StudyBooking-Room — Vercel deployment

This version is prepared so the Expo web frontend and Node API can be deployed from the same Vercel project.

## Vercel settings

- Root Directory: `.`
- Build Command: `npx expo export -p web`
- Output Directory: `dist`
- Install Command: `npm install`

The backend entry point is `server.js` at the repository root, which Vercel can detect as a Node server.

## Environment variables

Set `TOKEN_SECRET` to a long random value.

Set `EXPO_PUBLIC_API_URL` to the deployed Vercel URL, for example:

`https://YOUR-PROJECT.vercel.app`

## IMPORTANT database note

The current backend still uses SQLite (`server/studyroom.db`). On Vercel, the default path is `/tmp/studyroom.db`, which is writable but ephemeral. This means this ZIP is suitable for testing the Vercel deployment and API, but **SQLite data is not guaranteed to survive cold starts/redeployments**.

For a real online system where registrations and bookings must persist permanently, migrate the SQLite database to a persistent hosted database such as Turso (SQLite/libSQL), Neon/Postgres, or Supabase. Do not treat `/tmp/studyroom.db` as production persistent storage.

## Local behavior

`npm run server` still runs the original backend from `server/server.js` and uses `server/studyroom.db` by default.
