-- Migration: Add columns for full contact details and soft delete
-- Run with: npx wrangler d1 execute ber-membership-db --remote --file=./migrations/0004_add_contact_details.sql

ALTER TABLE signups ADD COLUMN first_name TEXT;
ALTER TABLE signups ADD COLUMN last_name TEXT;
ALTER TABLE signups ADD COLUMN organization TEXT;
ALTER TABLE signups ADD COLUMN email TEXT;
ALTER TABLE signups ADD COLUMN role TEXT;
ALTER TABLE signups ADD COLUMN pri_phone TEXT;
ALTER TABLE signups ADD COLUMN city TEXT;
ALTER TABLE signups ADD COLUMN state TEXT;

-- Soft Delete
ALTER TABLE signups ADD COLUMN is_deleted INTEGER DEFAULT 0;
ALTER TABLE signups ADD COLUMN deleted_by TEXT;
ALTER TABLE signups ADD COLUMN deleted_at TEXT;
