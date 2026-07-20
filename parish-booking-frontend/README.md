# Parish Room Booking — Frontend

React + TypeScript + Tailwind, three routes on one app:

- `/` — public booking form (rooms, date/time, requester info) + suggestion /
  violation report form (tabbed)
- `/admin/login` and `/admin` — secretariat login + review queue (approve /
  reject) + feedback inbox
- `/display` — standalone kiosk view for the monitor outside the
  secretariat: today's approved schedule per room, with a live "now" line,
  auto-updating over WebSocket the moment an admin approves/rejects
  something (no manual refresh needed)

## Design notes
Palette and type are deliberately not the generic AI defaults (cream +
terracotta, or near-black + neon): a liturgical maroon/gold/parchment
palette with a serif display face (Source Serif 4) paired with IBM Plex
Sans for body/data, meant to read as dignified-but-usable rather than
"generic SaaS dashboard" or "generic AI demo."

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your NestJS backend
npm run dev
```

Build: `npm run build` (outputs to `dist/`, deploy as a static site — Vercel
works well since routing is client-side; add a rewrite-all-to-index.html
rule if your host needs one for SPA routes to work on refresh).

## Wiring to the backend
All API calls go through `src/lib/api.ts`. The admin JWT is stored in
`localStorage` under `admin_token` and attached automatically as a Bearer
token — see `useAuth.ts`.

## The display screen in practice
Point the monitor's browser at `https://your-domain/display` in fullscreen
(F11 / kiosk mode). It only reads data — no interaction needed once it's
loaded. If the WebSocket connection drops (e.g. brief network hiccup), a
60-second fallback poll keeps it from going stale indefinitely.

## Known gaps to close before going live
- No "forgot password" flow for admins (matches the backend, which also
  doesn't have one yet).
- No client-side rate limiting / captcha on the public forms — pair with
  the backend's rate limiting once that's added.
- Room photos (`photoUrl` on Room) aren't rendered anywhere yet — easy to
  add to the booking form's room dropdown if useful.
