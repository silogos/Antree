-- ============================================================================
-- Queue Session Migration
-- ============================================================================
-- This migration refactors the queue system from batch-based to session-based
-- architecture. All existing queue_batches and queue_statuses tables are dropped,
-- and new queue_sessions and queue_session_statuses tables are created.
--
-- Note: This is a fresh migration - no data will be preserved. Existing data
-- will be lost after running this migration.
-- ============================================================================

-- ============================================================================
-- 1. DROP TABLES (cleanup old structure)
-- ============================================================================

-- Drop queue_statuses first (referenced by queue_items)
DROP TABLE IF EXISTS queue_statuses CASCADE;

-- Drop queue_batches second (referenced by queue_items and queueStatuses)
DROP TABLE IF EXISTS queue_batches CASCADE;

-- ============================================================================
-- 2. CREATE NEW TABLES (queue_sessions and queue_session_statuses)
-- ============================================================================

-- Create queue_sessions table
-- Represents a single queue session with lifecycle management
CREATE TABLE queue_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES queue_templates(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    session_number INTEGER NOT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create queue_session_statuses table
-- Represents status values specific to a queue session
CREATE TABLE queue_session_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES queue_sessions(id) ON DELETE CASCADE,
    template_status_id UUID NOT NULL REFERENCES queue_template_statuses(id) ON DELETE RESTRICT,
    label TEXT NOT NULL,
    color TEXT NOT NULL,
    order INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. ALTER queue_items (migrate from batch-based to session-based)
-- ============================================================================

-- Add session_id column to queue_items
ALTER TABLE queue_items
    ADD COLUMN session_id UUID REFERENCES queue_sessions(id) ON DELETE CASCADE;

-- Drop old batch_id column (no longer needed)
ALTER TABLE queue_items
    DROP COLUMN batch_id;

-- ============================================================================
-- 4. ADD INDEXES (performance optimization)
-- ============================================================================

-- Index on session_number for efficient session lookup and ordering
CREATE INDEX idx_queue_sessions_session_number
    ON queue_sessions(session_number);

-- Index on is_deleted for efficient soft-delete queries
CREATE INDEX idx_queue_sessions_deleted
    ON queue_sessions(is_deleted);

-- Index on queue_id for join performance with queues table
CREATE INDEX idx_queue_sessions_queue_id
    ON queue_sessions(queue_id);

-- Index on session_id for join performance with queue_session_statuses
CREATE INDEX idx_queue_session_statuses_session_id
    ON queue_session_statuses(session_id);

-- Index on template_status_id for join performance with queue_template_statuses
CREATE INDEX idx_queue_session_statuses_template_status_id
    ON queue_session_statuses(template_status_id);

-- ============================================================================
-- 5. ADD CHECK CONSTRAINTS (data integrity)
-- ============================================================================

-- Enforce status values for queue_sessions
ALTER TABLE queue_sessions
    ADD CONSTRAINT chk_queue_sessions_status
    CHECK (status IN ('active', 'paused', 'completed', 'archived'));

-- ============================================================================
-- 6. ADD FOREIGN KEY CONSTRAINTS (referential integrity)
-- ============================================================================

-- Note: Foreign keys are already defined in CREATE TABLE statements above
-- These constraints ensure:
-- - queue_sessions.queue_id references queues.id
-- - queue_sessions.template_id references queue_templates.id
-- - queue_session_statuses.session_id references queue_sessions.id
-- - queue_session_statuses.template_status_id references queue_template_statuses.id
-- - queue_items.session_id references queue_sessions.id
-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
