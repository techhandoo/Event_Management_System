-- ============================================================
-- V3: Convert PostgreSQL ENUM types to VARCHAR
-- Hibernate @Enumerated(EnumType.STRING) sends String values,
-- which PostgreSQL rejects for custom ENUM columns.
-- ============================================================

-- Convert columns from ENUM to VARCHAR
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(20) USING role::TEXT;
ALTER TABLE events ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
ALTER TABLE bookings ALTER COLUMN status TYPE VARCHAR(20) USING status::TEXT;
ALTER TABLE notifications ALTER COLUMN type TYPE VARCHAR(30) USING type::TEXT;

-- Drop the custom ENUM types (no longer needed)
DROP TYPE IF EXISTS notification_type;
DROP TYPE IF EXISTS booking_status;
DROP TYPE IF EXISTS event_status;
DROP TYPE IF EXISTS user_role;
