# Sistem Booking Ruang Pertemuan — Paroki St. Antonius Purbayan

Room booking system for Paroki St. Antonius Purbayan, Surakarta. Umat request
meeting rooms, the secretariat approves them, and a wall-mounted monitor shows
today's schedule live.

Built to the parish design document (v1, 18 Juli 2026) using the **Broadsheet**
design system — serif newsprint on paper, cyan/magenta accents.

## Structure

```
parish-booking-backend/    NestJS + Prisma + PostgreSQL API  → deployed to Railway
parish-booking-frontend/   React + Vite PWA                  → deployed to Vercel/Netlify
```

This is a monorepo, but the two apps deploy **independently** — see
[Independent deploys](#independent-deploys) below.

## The three surfaces

| Surface | Route | Who | Notes |
|---|---|---|---|
| Aplikasi Umat | `/`, `/booking-baru`, `/booking-saya`, `/saran`, `/lapor` | Parishioners (login) | Responsive, installable PWA |
| Panel Admin | `/admin/*` | Secretariat | Desktop-oriented |
| Monitor Display | `/display` | Public, read-only | Landscape 16:9, auto-updating, QR to the umat app |

## Local development

Prerequisites: Node 20+, Docker.

```bash
# 1. Database
cd parish-booking-backend
docker compose up -d postgres          # Postgres on :5434

# 2. Backend
cp .env.example .env                   # fill DATABASE_URL, JWT_SECRET, VAPID keys
npm install
npx prisma migrate deploy              # creates schema + double-booking constraint
npx prisma db seed                     # admin + sample umat + 4 rooms
npm run start:dev                      # :3000

# 3. Frontend
cd ../parish-booking-frontend
cp .env.example .env                   # VITE_API_URL=http://localhost:3000
npm install
npm run dev                            # :5173
```

Seeded accounts (change before going live):

- **Admin** — `sekretariat@purbayan-paroki.org` / `changeme123`
- **Umat** — `yohanes@example.com` / `password123`

Generate VAPID keys for push with `npx web-push generate-vapid-keys --json`.

## The double-booking guard

The one place correctness matters more than convenience. Multiple **pending**
requests for the same room/slot may coexist — the room is only claimed when an
admin approves one. To make that airtight even if two admins approve at nearly
the same moment, a Postgres **exclusion constraint** enforces it in the database:

```sql
ALTER TABLE "bookings"
  ADD CONSTRAINT "no_overlapping_approved_bookings"
  EXCLUDE USING gist ("roomId" WITH =, tstzrange("startTime", "endTime") WITH &&)
  WHERE (status = 'approved');
```

Prisma's schema language can't express this, so it lives in a hand-written
migration. `BookingsService.approve()` translates the violation into a clean
`409 Conflict`. `startTime`/`endTime` are `@db.Timestamptz(3)` because
`tstzrange()` requires timezone-aware columns.

## Deployment

### Backend → Railway

Create a Railway project with a **PostgreSQL** database and a service pointed at
this repo.

| Setting | Value |
|---|---|
| Root Directory | `parish-booking-backend` |
| Watch Paths | `parish-booking-backend/**` |
| Build | `npm ci && npx prisma generate && npm run build` |
| Start | `npx prisma migrate deploy && node dist/main` |
| Healthcheck | `/health` |

Most of this is already declared in `parish-booking-backend/railway.json`.

**Volume (required).** Railway's filesystem is ephemeral — without a volume,
uploaded Surat Permohonan PDFs are deleted on every redeploy. Attach a volume
and point `UPLOADS_DIR` at its mount path.

Environment variables:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Reference Railway's Postgres: `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Long random string |
| `CORS_ORIGINS` | Frontend origin(s), comma-separated, no trailing slash |
| `UPLOADS_DIR` | Volume mount path, e.g. `/data/uploads` |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web push |
| `MAIL_FROM` | `sekretariat@purbayan-paroki.org` |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Optional — replies are logged until set |

`PORT` is provided by Railway automatically.

### Frontend → Vercel or Netlify

**Vercel** — set Root Directory to `parish-booking-frontend`; the rest comes from
`vercel.json`.

**Netlify** — `netlify.toml` at the repo root already sets base, build and publish.

Set `VITE_API_URL` to the Railway backend URL. Note this is a **build-time**
variable (Vite inlines it), so changing it requires a rebuild, not just a restart.

After the frontend has a domain, add it to the backend's `CORS_ORIGINS` — the API
rejects unlisted origins by design.

### Independent deploys

A monorepo does not give you this for free; each platform needs telling:

- **Railway** — set Watch Paths to `parish-booking-backend/**` so frontend-only
  pushes don't redeploy the API.
- **Netlify** — handled by `[build] ignore` in `netlify.toml`.
- **Vercel** — set the project's *Ignored Build Step* to:
  ```
  git diff --quiet HEAD^ HEAD -- .
  ```

## Notes and known gaps

- **Email replies are stubbed.** Admin replies are stored and logged, not sent,
  until `SMTP_*` is configured. The call site doesn't change when you wire it up.
- **iOS push requires install.** Web Push on iPhone only works once the PWA is
  added to the home screen, over HTTPS.
- **`peminjaman_berkala`** stores the flag only; recurrence rules are undefined
  in the design document and need product input before implementation.
- **No rate limiting** on the public auth endpoints yet — consider
  `@nestjs/throttler` before launch.
