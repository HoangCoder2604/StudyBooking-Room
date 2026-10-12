# StudyBooking-Room: Vercel Web + API + Turso DB

## Changes made
- Web production uses its own Vercel domain for requests to `/api/*`, not `localhost`.
- `api/[...path].js` handles API requests using `server/server.js`.
- Turso is persistent SQLite-compatible cloud storage; local `server/studyroom.db` is **NOT** uploaded automatically.
- Fixes expired-booking sweep crash; guards double booking using a DB trigger.
- WebSocket realtime on local server is preserved; deployed HTTPS version polls approximately every 15 seconds (no WebSocket on Vercel Functions).

## Deployment steps
1. Create a Turso database at https://turso.tech/ and obtain database URL and authentication token.
2. In Vercel, import the GitHub repo and set **Root Directory** to the directory containing this `package.json`, `vercel.json`, and `api/` (typically `./`).
3. Build command: `npx expo export -p web`, Output directory: `dist`. Framework preset: Other.
4. Set Vercel environment variables for Production (and Preview if needed):
   - `TURSO_DATABASE_URL=libsql://...`
   - `TURSO_AUTH_TOKEN=...`
   - `TOKEN_SECRET=<long random secret>`
5. For browser web, **remove EXPO_PUBLIC_API_URL** in Vercel unless it is set exactly to the final HTTPS website origin. Leaving it unset is best.
6. Commit and push these changes to GitHub, then Redeploy in Vercel (ensure new environment vars apply).
7. Visit `https://<your-domain>/api/health`. Expect JSON with `ok:true` and `database:"turso"`.
8. Test register, logout/login, list rooms, create booking, cancel, log in from another device.

## Local user data
User accounts created in the old local SQLite file do NOT magically appear online. You must either register them in production again, or migrate the old `server/studyroom.db` into Turso. The ZIP did not include a SQLite DB file, so it cannot be migrated as part of this patch. Preserve existing password hashes during migration.

## Android emulator
For local backend: `npm run server` and `npx expo start --clear`; the emulator accesses `http://10.0.2.2:4000`.
For Android using online backend, set `EXPO_PUBLIC_API_URL=https://<your-domain>` when building Expo Android. This project uses **Expo / React Native**, not Capacitor.

## Troubleshooting
- `/api/health` returns `503`: missing Turso env vars. Set them and redeploy.
- `/api/health` returns `500`: verify Turso connection credentials in the Vercel Functions logs.
- Web still calls localhost: remove old `EXPO_PUBLIC_API_URL`, redeploy; hard refresh browser.
- HTTP 404 on `/api/health`: ensure root dir and dynamic API Function are deployed.
- No old local accounts: perform migration or register accounts again.

## Security / limitations
Remove demo seed users with password `123456` before public production use. `TOKEN_SECRET` must be strong and stable. Polling is not push realtime. This patch has not been verified against your live Vercel/Turso deployment without project credentials.
