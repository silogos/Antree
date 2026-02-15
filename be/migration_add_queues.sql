-- Migration: Add queues table and refactor to use queueId
-- This script adds the new queues table and updates existing tables

-- 1. Add isSystemTemplate to queue_templates
ALTER TABLE queue_templates ADD COLUMN IF NOT EXISTS is_system_template BOOLEAN DEFAULT false;

-- 2. Create queues table
CREATE TABLE IF NOT EXISTS queues (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT NOT NULL REFERENCES queue_templates(id) ON DELETE CASCADE,
  created_by TEXT, -- FK to users.id removed temporarily (type mismatch)
  updated_by TEXT, -- FK to users.id removed temporarily (type mismatch)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queues_template_id ON queues(template_id);

-- 3. Add queueId to queueBatches and drop templateId
ALTER TABLE queue_batches ADD COLUMN IF NOT EXISTS queue_id TEXT REFERENCES queues(id) ON DELETE CASCADE;

-- Migrate data: Create a queue for each batch template
-- Note: This is a simplified migration - in production, handle existing data properly
-- Insert batches as queues (each batch becomes a queue)
INSERT INTO queues (id, name, template_id, created_by, updated_by, is_active, created_at, updated_at)
SELECT
  gen_random_uuid()::text,
  qb.name || ' Queue',
  qb.template_id,
  NULL,
  NULL,
  true,
  qb.created_at,
  qb.updated_at
FROM queue_batches qb;

-- After migration, we can drop template_id from queue_batches (keep for now for safety)
-- ALTER TABLE queue_batches DROP COLUMN template_id;

-- 4. Rename batchId to queueId in queue_statuses and queue_items
ALTER TABLE queue_statuses RENAME COLUMN batch_id TO queue_id;

ALTER TABLE queue_items RENAME COLUMN batch_id TO queue_id;

-- 5. Remove templateId from queue_items (redundant)
ALTER TABLE queue_items DROP COLUMN IF EXISTS template_id;

-- 6. Update foreign key constraint for queue_batches.queueId
-- Drop old constraint if exists
ALTER TABLE queue_batches DROP CONSTRAINT IF EXISTS queue_batches_template_id_fkey;

-- Add new constraint
ALTER TABLE queue_batches
ADD CONSTRAINT queue_batches_queue_id_fkey
FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE;

-- 7. Update foreign key for queue_statuses (batchId -> queueId renamed, constraint needs update)
ALTER TABLE queue_statuses
DROP CONSTRAINT IF EXISTS queue_statuses_batch_id_fkey;

ALTER TABLE queue_statuses
ADD CONSTRAINT queue_statuses_queue_id_fkey
FOREIGN KEY (queue_id) REFERENCES queue_batches(id) ON DELETE CASCADE;

-- 8. Update foreign key for queue_items (batchId -> queueId renamed, constraint needs update)
ALTER TABLE queue_items
DROP CONSTRAINT IF EXISTS queue_items_batch_id_fkey;

ALTER TABLE queue_items
ADD CONSTRAINT queue_items_queue_id_fkey
FOREIGN KEY (queue_id) REFERENCES queue_batches(id) ON DELETE CASCADE;

-- 9. Add NOT NULL constraint to queue_batches.queue_id
ALTER TABLE queue_batches ALTER COLUMN queue_id SET NOT NULL;
