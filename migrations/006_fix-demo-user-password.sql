-- Migration: fix-demo-user-password
-- Created at: 2026-03-05T17:55:19.761Z

BEGIN;

-- Update Demo User password with a valid bcrypt hash for "password123"
UPDATE users 
SET password = '$2b$10$s/JaiEndUX8I.QvQmpGAPOQA1K6qqm/yhSyRCsiboYcI/MoM9kZCe'
WHERE email = 'demo@example.com';

COMMIT;
