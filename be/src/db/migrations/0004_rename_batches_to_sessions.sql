-- Migration: Rename batches to sessions and update session status tracking
-- This migration transforms queue_batches into queue_sessions with new tracking capabilities

-- ============================================================================
-- 1. Rename queue_batches to queue_sessions
-- ============================================================================

ALTER TABLE queue_batches RENAME TO queue_sessions;

-- ============================================================================
-- 2. Rename queue_statuses to queue_session_statuses
-- ============================================================================

ALTER TABLE queue_statuses RENAME TO queue_session_statuses;

-- ============================================================================
-- 3. Add new columns to queue_sessions table
-- ============================================================================

ALTER TABLE queue_sessions ADD COLUMN session_number INTEGER;
ALTER TABLE queue_sessions ADD COLUMN started_at TIMESTAMP;
ALTER TABLE queue_sessions ADD COLUMN ended_at TIMESTAMP;
ALTER TABLE queue_sessions ADD COLUMN deleted_at TIMESTAMP;

-- ============================================================================
-- 4. Update default status to 'draft'
-- ============================================================================

ALTER TABLE queue_sessions ALTER COLUMN status SET DEFAULT 'draft';

-- ============================================================================
-- 5. Rename batch_id to session_id in queue_items table
-- ============================================================================

ALTER TABLE queue_items RENAME COLUMN batch_id TO session_id;

-- ============================================================================
-- 6. Update foreign key constraint for session_id
-- ============================================================================

ALTER TABLE queue_items DROP CONSTRAINT queue_items_batch_id_fkey;

ALTER TABLE queue_items
  ADD CONSTRAINT queue_items_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES queue_sessions(id) ON DELETE CASCADE;

-- ============================================================================
-- Migration complete
-- ============================================================================

COMMENT ON MIGRATION IS 'Renamed queue_batches to queue_sessions and queue_statuses to queue_session_statuses. Added session tracking columns (session_number, started_at, ended_at, deleted_at) and updated queue_items foreign key from batch_id to session_id.';
