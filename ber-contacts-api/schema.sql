-- Schema for the signups table
CREATE TABLE IF NOT EXISTS signups (
    contact_key TEXT PRIMARY KEY,
    created_at TEXT DEFAULT (datetime('now'))
);
