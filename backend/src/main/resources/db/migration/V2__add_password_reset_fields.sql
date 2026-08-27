-- ============================================================
-- V2: Add Password Reset Fields
-- ============================================================

ALTER TABLE users ADD COLUMN reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN reset_token_expiry TIMESTAMP;

CREATE INDEX idx_users_reset_token ON users(reset_token);
