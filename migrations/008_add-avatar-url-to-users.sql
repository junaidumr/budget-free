-- Migration: add-avatar-url-to-users
-- Created at: 2026-03-13T20:25:19.140Z

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMIT;
