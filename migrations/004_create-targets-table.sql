-- Migration: create-targets-table
-- Created at: 2026-03-05T17:39:56.197Z

BEGIN;

CREATE TABLE IF NOT EXISTS targets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    current DECIMAL(15,2) DEFAULT 0,
    target DECIMAL(15,2) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
