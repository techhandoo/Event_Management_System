-- Add Razorpay payment fields to bookings table
ALTER TABLE bookings ADD COLUMN payment_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN razorpay_order_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50);
ALTER TABLE bookings ADD COLUMN paid_at TIMESTAMP;

CREATE INDEX idx_bookings_payment_id ON bookings(payment_id);
CREATE INDEX idx_bookings_razorpay_order_id ON bookings(razorpay_order_id);
