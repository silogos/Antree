# Prompt — Refactor Queue System to Session-Based Architecture (v2 Clean API Contract)

## Context
You are refactoring an existing Queue Management System database into a new architecture built around **queue sessions** as the operational runtime layer.

This system will be used as a **Queue Infrastructure Platform (SaaS)** and must support:

- Multi-tenant usage
- External system integrations
- Real-time updates (SSE per session & per item)
- Immutable queue items
- Session-based numbering
- Clean separation between DB design and API contract

---

# Core Architectural Principles

1. A **Queue** is a permanent dashboard.
2. Each operational run creates a **queue session**.
3. Sessions represent runtime periods (e.g., Morning Shift, Batch #12).
4. Multiple sessions may be active simultaneously.
5. Queue items are immutable to their session.
6. Queue numbering resets per session.
7. Sessions use soft delete.
8. Template statuses are cloned into sessions.
9. Database schema and API contract must not expose ambiguous fields.

---

# Naming & Contract Rules (Mandatory)

## Database Rules

- Use `snake_case`
- UUID primary keys
- JSONB for metadata
- Internal foreign keys may exist but do not have to be exposed in API

## API Contract Rules

- Use `camelCase`
- Do NOT expose internal foreign keys unless necessary
- Avoid ambiguous field names
- Explicitly separate:
  - `lifecycleStatus` → session runtime state
  - `statusId` → queue item status
- Avoid generic `name` for items → use `displayName`
- Hide soft delete flags from public API

---

# Target Database Schema

## 1. users

- id (uuid, PK)
- username (text, unique, not null)
- email (text, unique, not null)
- password (text, not null)
- full_name (text)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

---

## 2. queue_templates

- id (uuid, PK)
- name (text, not null)
- description (text)
- is_system_template (boolean, default false)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

---

## 3. queue_template_statuses

- id (uuid, PK)
- template_id (uuid, FK → queue_templates.id, cascade delete)
- label (text, not null)
- color (text, not null)
- order (integer, not null)
- created_at (timestamp)
- updated_at (timestamp)

---

## 4. queues

- id (uuid, PK)
- name (text, not null)
- template_id (uuid, FK → queue_templates.id)
- created_by (uuid, FK → users.id)
- updated_by (uuid, FK → users.id)
- is_active (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

---

## 5. queue_sessions

- id (uuid, PK)
- queue_id (uuid, FK → queues.id, cascade delete)
- template_id (uuid, FK → queue_templates.id)
- name (text, not null)
- status (text → active | paused | completed | archived)
- session_number (integer)
- started_at (timestamp)
- ended_at (timestamp)
- is_deleted (boolean, default false)
- created_at (timestamp)
- updated_at (timestamp)

Note:
- `status` here represents lifecycle state (NOT item status)

---

## 6. queue_session_statuses

- id (uuid, PK)
- session_id (uuid, FK → queue_sessions.id, cascade delete)
- template_status_id (uuid, FK → queue_template_statuses.id)
- label (text, not null)
- color (text, not null)
- order (integer, not null)
- created_at (timestamp)
- updated_at (timestamp)

---

## 7. queue_items

- id (uuid, PK)
- queue_id (uuid, FK → queues.id, cascade delete)
- session_id (uuid, FK → queue_sessions.id, cascade delete)
- status_id (uuid, FK → queue_session_statuses.id, restrict delete)
- queue_number (text, not null)
- name (text, not null)
- metadata (jsonb)
- created_at (timestamp)
- updated_at (timestamp)

---

# API Contract Design

## Queue (API Response)

```json
{
  "id": "uuid",
  "name": "Customer Service",
  "templateId": "uuid",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## Session (API Response)

```json
{
  "id": "uuid",
  "queueId": "uuid",
  "name": "Morning Shift",
  "lifecycleStatus": "active",
  "sessionNumber": 12,
  "startedAt": "timestamp",
  "endedAt": null,
  "createdAt": "timestamp"
}
```

Note:
- `lifecycleStatus` maps from DB `status`
- Do NOT expose `is_deleted`

---

## Session Status (API Response)

```json
{
  "id": "uuid",
  "sessionId": "uuid",
  "label": "Cooking",
  "color": "#FFAA00",
  "order": 2
}
```

Note:
- Do NOT expose `template_status_id`

---

## Queue Item (API Response)

```json
{
  "id": "uuid",
  "queueId": "uuid",
  "sessionId": "uuid",
  "statusId": "uuid",
  "queueNumber": "A-12",
  "displayName": "Budi",
  "metadata": {
    "orderId": "ORD-99123",
    "channel": "grab"
  },
  "createdAt": "timestamp"
}
```

Rules:
- `displayName` maps from DB `name`
- `statusId` maps from DB `status_id`
- Session binding is immutable

---

# Updated API Routes

## Queues
- POST /queues
- GET /queues
- GET /queues/:id
- PATCH /queues/:id
- DELETE /queues/:id (soft deactivate)

## Sessions
- POST /queues/:queueId/sessions
- GET /queues/:queueId/sessions
- GET /sessions/:id
- PATCH /sessions/:id
- PATCH /sessions/:id/lifecycle
- DELETE /sessions/:id (soft delete)

## Session Statuses
- GET /sessions/:sessionId/statuses
- PATCH /session-statuses/:id

## Items
- POST /sessions/:sessionId/items
- GET /sessions/:sessionId/items
- GET /items/:id
- PATCH /items/:id
- PATCH /items/:id/status

## Templates
- GET /templates
- POST /templates
- GET /templates/:id/statuses
- POST /templates/:id/statuses

---

# Real-Time SSE Channels

## Session Stream

GET /sessions/:sessionId/stream

Events:
- item_created
- item_updated
- item_status_changed
- session_paused
- session_resumed
- session_completed

---

## Item Stream

GET /items/:itemId/stream

---

# Deliverables Required

1. New SQL schema
2. Migration SQL
3. ERD diagram
4. Updated OpenAPI spec (aligned with camelCase API contract)
5. SSE channel mapping
6. DTO types (backend + frontend)
7. Clear mapping layer between DB model and API model

---

End of prompt.