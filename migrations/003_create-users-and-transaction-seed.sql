-- Migration: create-users-and-transaction-seed
-- Created at: 2026-03-05T17:36:13.932Z

BEGIN;

-- Seed User (Password: password123)
-- Note: In a real app, you'd use a hashed password. This is for local dev testing.
INSERT INTO users (first_name, last_name, email, password, role)
VALUES ('Demo', 'User', 'demo@example.com', '$2b$10$A789A123B456C789D0123uB5vYd5Y8T3Z1Q2W3E4R5T6Y7U8I9O0', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed Transactions for the first user
DO $$
DECLARE
    target_user_id INTEGER;
BEGIN
    SELECT id INTO target_user_id FROM users WHERE email = 'demo@example.com' LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- Salary (Income)
        INSERT INTO transactions (user_id, title, category, amount, is_negative, icon, currency)
        VALUES (target_user_id, 'Monthly Salary', 'Income', 5000.00, false, 'banknote.fill', 'USD');

        -- Rent (Expense)
        INSERT INTO transactions (user_id, title, category, amount, is_negative, icon, currency)
        VALUES (target_user_id, 'Apartment Rent', 'Rent', 1200.00, true, 'key.fill', 'USD');

        -- Groceries
        INSERT INTO transactions (user_id, title, category, amount, is_negative, icon, currency)
        VALUES (target_user_id, 'Weekly Groceries', 'Groceries', 150.75, true, 'cart.fill', 'USD');

        -- Food
        INSERT INTO transactions (user_id, title, category, amount, is_negative, icon, currency)
        VALUES (target_user_id, 'Dinner with Friends', 'Food', 65.50, true, 'fork.knife', 'USD');

        -- Transport
        INSERT INTO transactions (user_id, title, category, amount, is_negative, icon, currency)
        VALUES (target_user_id, 'Uber Ride', 'Transport', 25.00, true, 'bus.fill', 'USD');
    END IF;
END $$;

COMMIT;
