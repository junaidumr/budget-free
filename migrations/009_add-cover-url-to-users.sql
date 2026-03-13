-- Migration: add-cover-url-to-users
-- Created at: 2026-03-13T20:42:46.282Z

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_url TEXT;

COMMIT;
