-- ============================================================
-- FutureMeal Seed Data (manual SQL version)
-- The Java DataSeeder runs automatically on startup.
-- Use this file only if you need raw SQL seeding.
-- Passwords: Demo@123 (BCrypt encoded)
-- ============================================================

USE futuremeal_db;

-- Demo users (password = Demo@123)
INSERT IGNORE INTO users (name, email, password, phone, role, dietary_preference, spice_preference, is_active) VALUES
('Admin User',    'admin@futuremeal.in',    '$2a$12$HRdO8JBzxE1JxLk5mZqvqOVpOJzOPX3PLbUL8g5M6z9P6vRQ6WxS6', '9000000001', 'ADMIN',              NULL,       NULL,     1),
('Arjun Sharma',  'customer@futuremeal.in', '$2a$12$HRdO8JBzxE1JxLk5mZqvqOVpOJzOPX3PLbUL8g5M6z9P6vRQ6WxS6', '9000000002', 'CUSTOMER',           'NON_VEG',  'MEDIUM', 1),
('Priya Rangan',  'owner@futuremeal.in',    '$2a$12$HRdO8JBzxE1JxLk5mZqvqOVpOJzOPX3PLbUL8g5M6z9P6vRQ6WxS6', '9000000003', 'RESTAURANT_OWNER',   NULL,       NULL,     1),
('Ravi Kumar',    'delivery@futuremeal.in', '$2a$12$HRdO8JBzxE1JxLk5mZqvqOVpOJzOPX3PLbUL8g5M6z9P6vRQ6WxS6', '9000000004', 'DELIVERY_PARTNER',   NULL,       NULL,     1);
