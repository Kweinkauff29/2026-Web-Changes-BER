-- Migration: Add tracking columns for multi-checkbox and award preference features
-- Run with: npx wrangler d1 execute ber-membership-db --remote --file=./migrations/0002_add_tracking_columns.sql

ALTER TABLE signups ADD COLUMN numbers_confirmed INTEGER DEFAULT 0;
ALTER TABLE signups ADD COLUMN numbers_confirmed_by TEXT;
ALTER TABLE signups ADD COLUMN numbers_confirmed_at TEXT;
ALTER TABLE signups ADD COLUMN event_registered INTEGER DEFAULT 0;
ALTER TABLE signups ADD COLUMN event_registered_by TEXT;
ALTER TABLE signups ADD COLUMN event_registered_at TEXT;
ALTER TABLE signups ADD COLUMN award_pref TEXT DEFAULT '';
ALTER TABLE signups ADD COLUMN award_pref_by TEXT;
ALTER TABLE signups ADD COLUMN award_pref_at TEXT;
