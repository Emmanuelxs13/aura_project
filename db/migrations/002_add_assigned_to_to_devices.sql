-- Migration: add assigned_to column to devices
-- Adds a nullable assigned_to field to store the assignee identifier or name

ALTER TABLE devices
ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(150) NULL;

-- index to help lookups by assignee
CREATE INDEX IF NOT EXISTS idx_devices_assigned_to ON devices(assigned_to);
