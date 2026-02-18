-- Migration: Migrate from TEXT to UUID for all ID columns
-- This migration updates all primary key and foreign key columns from TEXT to UUID type

-- ============================================================================
-- IMPORTANT: This migration should be run on a database that is either:
-- 1. Empty (new installation)
-- 2. Has data that can be safely migrated (existing UUIDs stored as TEXT)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. Update users table
-- ============================================================================

-- Drop existing primary key
ALTER TABLE users DROP CONSTRAINT users_pkey;

-- Add temporary column for new UUID type
ALTER TABLE users ADD COLUMN id_new UUID;

-- Copy data from old ID column to new UUID column (cast TEXT to UUID)
UPDATE users SET id_new = id::UUID WHERE id IS NOT NULL;

-- Drop old ID column
ALTER TABLE users DROP COLUMN id;

-- Rename new column to id
ALTER TABLE users RENAME COLUMN id_new TO id;

-- Add primary key constraint back
ALTER TABLE ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- ============================================================================
-- 2. Update queue_boards table
-- ============================================================================

ALTER TABLE queue_boards DROP CONSTRAINT queue_boards_pkey;
ALTER TABLE queue_boards ADD COLUMN id_new UUID;
UPDATE queue_boards SET id_new = id::UUID WHERE id IS NOT NULL;
ALTER TABLE queue_boards DROP COLUMN id;
ALTER TABLE queue_boards RENAME COLUMN id_new TO id;
ALTER TABLE queue_boards ADD CONSTRAINT queue_boards_pkey PRIMARY KEY (id);

-- ============================================================================
-- 3. Update queue_templates table
-- ============================================================================

ALTER TABLE queue_templates DROP CONSTRAINT queue_templates_pkey;
ALTER TABLE queue_templates ADD COLUMN id_new UUID;
UPDATE queue_templates SET id_new = id::UUID WHERE id IS NOT NULL;
ALTER TABLE queue_templates DROP COLUMN id;
ALTER TABLE queue_templates RENAME COLUMN id_new TO id;
ALTER TABLE queue_templates ADD CONSTRAINT queue_templates_pkey PRIMARY KEY (id);

-- ============================================================================
-- 4. Update queue_template_statuses table
-- ============================================================================

-- Update foreign key column
ALTER TABLE queue_template_statuses DROP CONSTRAINT queue_template_statuses_template_id_fkey;
ALTER TABLE queue_template_statuses ALTER COLUMN template_id TYPE UUID USING template_id::UUID;

-- Update primary key
ALTER TABLE queue_template_statuses DROP CONSTRAINT queue_template_statuses_pkey;
ALTER TABLE queue_template_statuses ADD COLUMN id_new UUID;
UPDATE queue_template_statuses SET id_new = id::UUID WHERE id IS NOT NULL;
ALTER TABLE queue_template_statuses DROP COLUMN id;
ALTER TABLE queue_template_statuses RENAME COLUMN id_new TO id;
ALTER TABLE queue_template_statuses ADD CONSTRAINT queue_template_statuses_pkey PRIMARY KEY (id);

-- Recreate foreign key
ALTER TABLE queue_template_statuses
  ADD CONSTRAINT queue_template_statuses_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES queue_templates(id) ON DELETE CASCADE;

-- ============================================================================
-- 5. Update queues table
-- ============================================================================

-- Update foreign key columns
ALTER TABLE queues DROP CONSTRAINT queues_template_id_fkey;
ALTER TABLE queues ALTER COLUMN template_id TYPE UUID USING template_id::UUID;

ALTER TABLE queues DROP CONSTRAINT queues_created_by_fkey;
ALTER TABLE queues ALTER COLUMN created_by TYPE UUID USING created_by::UUID;

ALTER TABLE queues DROP CONSTRAINT queues_updated_by_fkey;
ALTER TABLE queues ALTER COLUMN updated_by TYPE UUID USING updated_by::UUID;

-- Update primary key
ALTER TABLE queues DROP CONSTRAINT queues_pkey;
ALTER TABLE queues ADD COLUMN id_new UUID;
UPDATE queues SET id_new = id::UUID WHERE id IS NOT NULL;
ALTER TABLE queues DROP COLUMN id;
ALTER TABLE queues RENAME COLUMN id_new TO id;
ALTER TABLE queues ADD CONSTRAINT queues_pkey PRIMARY KEY (id);

-- Recreate foreign keys
ALTER TABLE queues
  ADD CONSTRAINT queues_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES queue_templates(id) ON DELETE CASCADE;

ALTER TABLE queues
  ADD CONSTRAINT queues_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE queues
  ADD CONSTRAINT queues_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================================================
-- 6. Update queue_batches table
-- ============================================================================

-- Update foreign key columns
ALTER TABLE queue_batches DROP CONSTRAINT queue_batches_template_id_fkey;
ALTER TABLE queue_batches ALTER COLUMN template_id TYPE UUID USING template_id::UUID;

ALTER TABLE queue_batches DROP CONSTRAINT queue_batches_queue_id_fkey;
ALTER TABLE queue_batches ALTER COLUMN queue_id TYPE UUID USING queue_id::UUID;

-- Update primary key
ALTER TABLE queue_batches DROP CONSTRAINT queue_batches_pkey;
ALTER TABLE queue_batches ADD COLUMN id_new UUID;
UPDATE queue_batches SET id_new = id::UUID WHERE id IS NOT NULL;
ALTER TABLE queue_batches DROP COLUMN id;
ALTER TABLE queue_batches RENAME COLUMN id_new TO id;
ALTER TABLE queue_batches ADD CONSTRAINT queue_batches_pkey PRIMARY KEY (id);

-- Recreate foreign keys
ALTER TABLE queue_batches
  ADD CONSTRAINT queue_batches_template_id_fkey
  FOREIGN KEY (template_id) REFERENCES queue_templates(id) ON DELETE CASCADE;

ALTER TABLE queue_batches
  ADD CONSTRAINT queue_batches_queue_id_fkey
  FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE;

-- ============================================================================
-- 7. Update queue_statuses table
-- ============================================================================

-- Update foreign key columns
ALTER TABLE queue_statuses DROP CONSTRAINT queue_statuses_queue_id_fkey;
ALTER TABLE queue_statuses ALTER COLUMN queue_id TYPE UUID USING queue_id::UUID;

ALTER TABLE queue_statuses DROP CONSTRAINT queue_statuses_template_status_id_fkey;
ALTER TABLE queue_statuses ALTER COLUMN template_status_id TYPE UUID USING template_status_id::UUID;

-- Update primary key
ALTER TABLE queue_statuses DROP CONSTRAINT queue_statuses_pkey;
ALTER TABLE queue_statuses ADD COLUMN id_new UUID;
UPDATE queue_statuses SET id_new = id::UUID WHERE id IS NOT NULL;
ALTER TABLE queue_statuses DROP COLUMN id;
ALTER TABLE queue_statuses RENAME COLUMN id_new TO id;
ALTER TABLE queue_statuses ADD CONSTRAINT queue_statuses_pkey PRIMARY KEY (id);

-- Recreate foreign keys
ALTER TABLE queue_statuses
  ADD CONSTRAINT queue_statuses_queue_id_fkey
  FOREIGN KEY (queue_id) REFERENCES queue_batches(id) ON DELETE CASCADE;

ALTER TABLE queue_statuses
  ADD CONSTRAINT queue_statuses_template_status_id_fkey
  FOREIGN KEY (template_status_id) REFERENCES queue_template_statuses(id) ON DELETE SET NULL;

-- ============================================================================
-- 8. Update queue_items table
-- ============================================================================

-- Update foreign key columns
ALTER TABLE queue_items DROP CONSTRAINT queue_items_queue_id_fkey;
ALTER TABLE queue_items ALTER COLUMN queue_id TYPE UUID USING queue_id::UUID;

ALTER TABLE queue_items DROP CONSTRAINT queue_items_batch_id_fkey;
ALTER TABLE queue_items ALTER COLUMN batch_id TYPE UUID USING batch_id::UUID;

ALTER TABLE queue_items DROP CONSTRAINT queue_items_status_id_fkey;
ALTER TABLE queue_items ALTER COLUMN status_id TYPE UUID USING status_id::UUID;

-- Update primary key
ALTER TABLE queue_items DROP CONSTRAINT queue_items_pkey;
ALTER TABLE queue_items ADD COLUMN id_new UUID;
UPDATE queue_items SET id_new = id::UUID WHERE id IS NOT NULL;
ALTER TABLE queue_items DROP COLUMN id;
ALTER TABLE queue_items RENAME COLUMN id_new TO id;
ALTER TABLE queue_items ADD CONSTRAINT queue_items_pkey PRIMARY KEY (id);

-- Recreate foreign keys
ALTER TABLE queue_items
  ADD CONSTRAINT queue_items_queue_id_fkey
  FOREIGN KEY (queue_id) REFERENCES queues(id) ON DELETE CASCADE;

ALTER TABLE queue_items
  ADD CONSTRAINT queue_items_batch_id_fkey
  FOREIGN KEY (batch_id) REFERENCES queue_batches(id) ON DELETE CASCADE;

ALTER TABLE queue_items
  ADD CONSTRAINT queue_items_status_id_fkey
  FOREIGN KEY (status_id) REFERENCES queue_statuses(id) ON DELETE RESTRICT;

-- ============================================================================
-- Migration complete
-- ============================================================================

COMMENT ON MIGRATION IS 'All ID columns migrated from TEXT to UUID type for UUID v7 support';
