-- ============================================================
-- V3: Convert PostgreSQL ENUM types to VARCHAR
-- Hibernate @Enumerated(EnumType.STRING) sends String values,
-- which PostgreSQL rejects for custom ENUM columns.
-- ============================================================

-- Step 1: Remove defaults that reference the ENUM types
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
ALTER TABLE events ALTER COLUMN status DROP DEFAULT;
ALTER TABLE bookings ALTER COLUMN status DROP DEFAULT;

-- Step 2: Convert columns from ENUM to VARCHAR
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20) USING role::TEXT;
ALTER TABLE events ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
ALTER TABLE bookings ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(30) USING type::TEXT;

-- Step 3: Re-add defaults as plain strings (now VARCHAR-compatible)
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'ATTENDEE';
ALTER TABLE events ALTER COLUMN status SET DEFAULT 'DRAFT';
ALTER TABLE bookings ALTER COLUMN status SET DEFAULT 'PENDING';

-- Step 4: Drop the custom ENUM types (no longer needed)
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
