-- Migration to add checked_by column to signups table
ALTER TABLE signups ADD COLUMN checked_by TEXT DEFAULT '';

-- Migration to add sales_volume column
-- ALTER TABLE signups ADD COLUMN sales_volume TEXT DEFAULT '';
