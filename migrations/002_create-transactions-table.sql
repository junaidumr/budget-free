-- Migration: create-transactions-table
-- Created at: 2026-03-05T17:33:59.052Z

BEGIN;

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    is_negative BOOLEAN DEFAULT TRUE,
    icon VARCHAR(50),
    description TEXT,
    companions VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'USD',
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
