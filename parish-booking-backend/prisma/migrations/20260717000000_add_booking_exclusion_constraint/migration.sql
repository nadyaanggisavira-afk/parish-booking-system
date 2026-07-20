-- This migration adds a database-level guarantee that no room can have two
-- APPROVED bookings with overlapping time ranges, even under concurrent
-- admin approvals. Prisma's schema.prisma cannot express exclusion
-- constraints, so this is added as a raw SQL migration.

-- Needed so we can mix an equality check (roomId) with a range overlap
-- check (tstzrange) in a single exclusion constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Only rows where status = 'approved' participate in the constraint.
-- Pending/rejected/cancelled bookings can overlap freely.
ALTER TABLE "bookings"
  ADD CONSTRAINT "no_overlapping_approved_bookings"
  EXCLUDE USING gist (
    "roomId" WITH =,
    tstzrange("startTime", "endTime") WITH &&
  )
  WHERE (status = 'approved');
