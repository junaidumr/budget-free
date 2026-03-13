-- Migration: seed-targets-data
-- Created at: 2026-03-05T17:41:47.802Z

BEGIN;

-- Seed Targets for the demo user
DO $$
DECLARE
    target_user_id INTEGER;
BEGIN
    SELECT id INTO target_user_id FROM users WHERE email = 'demo@example.com' LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- New Car
        INSERT INTO targets (user_id, title, current, target, icon, color)
        VALUES (target_user_id, 'New Car', 5000.00, 25000.00, 'car.fill', '#4F46E5');

        -- Vacation
        INSERT INTO targets (user_id, title, current, target, icon, color)
        VALUES (target_user_id, 'Japan Trip', 1200.00, 4000.00, 'airplane', '#10B981');

        -- Emergency Fund
        INSERT INTO targets (user_id, title, current, target, icon, color)
        VALUES (target_user_id, 'Emergency Fund', 800.00, 10000.00, 'shield.fill', '#F59E0B');
    END IF;
END $$;

COMMIT;
