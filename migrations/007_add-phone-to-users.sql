-- Migration: add-phone-to-users
-- Created at: 2026-03-13T20:21:02.533Z

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

COMMIT;
