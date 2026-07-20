# Parish Room Booking — Backend

NestJS + Prisma + PostgreSQL API for a room booking system with public
requests, admin approval, a live display screen, and a suggestion/violation
inbox.

## Stack
- NestJS (Express adapter by default)
- Prisma ORM
- PostgreSQL (tested against Neon/Supabase-style hosted Postgres)
- Socket.io for the display screen's live updates
- JWT (passport-jwt) for admin auth

## Getting started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npx prisma migrate deploy   # applies schema + the exclusion-constraint migration
npx prisma db seed          # creates one admin account + 3 sample rooms
npm run start:dev
```

Default seeded admin: `sekretariat@parishname.org` / `changeme123`
— change this password immediately in production (there's no "change
password" endpoint yet; update `passwordHash` directly via `prisma studio`
or add that endpoint before going live).

## API overview

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/bookings` | public | submit a booking request (status: pending) |
| GET | `/bookings?status=pending` | admin | review queue |
| PATCH | `/bookings/:id/approve` | admin | approve (conflict-checked, see below) |
| PATCH | `/bookings/:id/reject` | admin | reject |
| GET | `/rooms` | public | list active rooms |
| POST/PATCH | `/rooms` | admin | manage rooms |
| POST | `/feedback` | public | suggestion or violation report |
| GET | `/feedback` | admin | inbox |
| PATCH | `/feedback/:id/status` | admin | mark reviewed/resolved |
| GET | `/schedule/today` | public | today's approved bookings — powers the display |
| WS | `/schedule` namespace, event `schedule:changed` | public | tells the display to re-fetch |
| POST | `/auth/login` | public | admin login, returns JWT |

## The double-booking guard

This is the one place correctness matters more than convenience. Multiple
**pending** requests for the same room/slot are allowed to coexist — the
room is only "claimed" the moment an admin approves one. To make that claim
airtight even if two admins approve conflicting requests at nearly the same
moment, there's a Postgres **exclusion constraint** added via raw SQL
migration (`prisma/migrations/20260717000000_.../migration.sql`):

```sql
ALTER TABLE "bookings"
  ADD CONSTRAINT "no_overlapping_approved_bookings"
  EXCLUDE USING gist (
    "roomId" WITH =,
    tstzrange("startTime", "endTime") WITH &&
  )
  WHERE (status = 'approved');
```

Prisma's schema language can't express this, so it's a hand-written
migration — Prisma will still track it fine as part of the migration
history, it just didn't generate it. `BookingsService.approve()` tries the
update and translates a constraint violation into a clean `409 Conflict`
for the admin UI, rather than a raw Postgres error leaking through.

**Known rough edge:** Prisma doesn't have a dedicated error code for a
custom exclusion constraint (only for its own known ones, e.g. `P2002` for
`@unique`), so the violation is currently detected by matching on the
error message / constraint name. Verify the exact wording against whatever
Prisma version you land on and adjust the match if needed — this is called
out with a comment at the point in `bookings.service.ts` where it matters.

## What's stubbed / left for you to fill in
- No "forgot password" or "change password" flow for admins yet.
- No rate limiting on the public `POST /bookings` and `POST /feedback`
  endpoints — worth adding (`@nestjs/throttler`) before going live, since
  both are unauthenticated.
- No email/WhatsApp notification to the requester when their booking is
  approved/rejected — the data model supports it (`requesterContact`),
  wiring the actual notification is a separate task.
- CORS is wide open (`origin: '*'`) for the WebSocket gateway — narrow this
  to your actual frontend domain(s) before deploying.
