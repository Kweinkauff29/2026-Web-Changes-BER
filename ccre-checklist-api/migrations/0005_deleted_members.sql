-- Migration: Add deleted_members table to prevent deleted users from repopulating
CREATE TABLE IF NOT EXISTS deleted_members (
    growthzone_contact_id TEXT PRIMARY KEY,
    deleted_at TEXT NOT NULL DEFAULT (datetime('now'))
);
