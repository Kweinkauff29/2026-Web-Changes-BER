-- Migration to add checked_by column to signups table
ALTER TABLE signups ADD COLUMN checked_by TEXT DEFAULT '';
