-- ============================================================
-- V6: Performance indexes for hot read paths
-- ============================================================

-- Notifications poll (every 30s per logged-in user):
-- ORDER BY created_at DESC filtered by user_id — the (user_id, is_read)
-- index cannot serve the sort, so Postgres sorted all rows per user.
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications(user_id, created_at DESC);

-- Unread badge count touches only unread rows of a user.
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
    ON notifications(user_id) WHERE is_read = FALSE;

-- Capacity checks count CONFIRMED bookings per event; the composite index
-- already exists, this partial variant is smaller and index-only scannable.
CREATE INDEX IF NOT EXISTS idx_bookings_event_confirmed
    ON bookings(event_id) WHERE status = 'CONFIRMED';

-- Stale-PENDING cleanup scans (booked_at < cutoff) on the PENDING subset.
CREATE INDEX IF NOT EXISTS idx_bookings_status_booked_at
    ON bookings(status, booked_at);
