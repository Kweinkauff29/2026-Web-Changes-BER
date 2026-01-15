-- Migration: Add columns for Headshot, Confirmed Volume, Actual Award Level, and Not Attending
-- Run with: npx wrangler d1 execute ber-membership-db --remote --file=./migrations/0003_add_enhancement_columns.sql

-- Headshot Tracking
ALTER TABLE signups ADD COLUMN headshot_url TEXT;
ALTER TABLE signups ADD COLUMN headshot_by TEXT;
ALTER TABLE signups ADD COLUMN headshot_at TEXT;

-- Broker Confirmed Volume
ALTER TABLE signups ADD COLUMN confirmed_volume TEXT;
ALTER TABLE signups ADD COLUMN confirmed_volume_by TEXT;
ALTER TABLE signups ADD COLUMN confirmed_volume_at TEXT;

-- Actual Award Level (Manual Override)
ALTER TABLE signups ADD COLUMN actual_award_level TEXT;
ALTER TABLE signups ADD COLUMN actual_award_level_by TEXT;
ALTER TABLE signups ADD COLUMN actual_award_level_at TEXT;

-- Not Attending Checkbox
ALTER TABLE signups ADD COLUMN not_attending INTEGER DEFAULT 0;
ALTER TABLE signups ADD COLUMN not_attending_by TEXT;
ALTER TABLE signups ADD COLUMN not_attending_at TEXT;
