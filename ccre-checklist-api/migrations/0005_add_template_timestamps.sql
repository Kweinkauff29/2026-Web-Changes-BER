-- Migration: Add Timestamps for Template Dashboard tracking
ALTER TABLE workflow_templates ADD COLUMN created_at DATETIME;
ALTER TABLE workflow_templates ADD COLUMN updated_at DATETIME;
UPDATE workflow_templates SET created_at = datetime('now'), updated_at = datetime('now');
