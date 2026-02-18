# SSE Event Mapping Documentation

Server-Sent Events (SSE) for real-time queue session system updates. This document describes all event types, endpoints, and payload structures for the session-based queue system.

## Overview

The SSE system provides real-time updates for queue sessions and items. Clients can subscribe to specific sessions or items to receive live updates when changes occur.

**Important:** All event payloads use `snake_case` property names per project convention.

## Session Events

### `session_created`

Emitted when a new queue session is created.

**Payload:**
```json
{
  "type": "session_created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001",
    "template_id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Morning Session",
    "status": "draft",
    "session_number": 1,
    "started_at": null,
    "ended_at": null,
    "created_at": "2026-02-19T10:00:00.000Z"
  },
  "timestamp": "2026-02-19T10:00:00.000Z"
}
```

### `session_updated`

Emitted when session metadata is updated (name, template_id, etc.). Not emitted when only status changes.

**Payload:**
```json
{
  "type": "session_updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001",
    "template_id": "550e8400-e29b-41d4-a716-446655440003",
    "name": "Morning Session - Updated",
    "status": "draft",
    "session_number": 1,
    "started_at": null,
    "ended_at": null,
    "created_at": "2026-02-19T10:00:00.000Z"
  },
  "timestamp": "2026-02-19T10:15:00.000Z"
}
```

### `session_closed`

Emitted when session status changes to 'closed'.

**Payload:**
```json
{
  "type": "session_closed",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001",
    "template_id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Morning Session",
    "status": "closed",
    "session_number": 1,
    "started_at": "2026-02-19T10:00:00.000Z",
    "ended_at": "2026-02-19T14:00:00.000Z",
    "created_at": "2026-02-19T10:00:00.000Z"
  },
  "timestamp": "2026-02-19T14:00:00.000Z"
}
```

### `session_deleted`

Emitted when a session is soft-deleted (is_deleted flag set to true).

**Payload:**
```json
{
  "type": "session_deleted",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001"
  },
  "timestamp": "2026-02-19T15:00:00.000Z"
}
```

## Session Status Events

### `session_status_created`

Emitted when a new status is created within a session.

**Payload:**
```json
{
  "type": "session_status_created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "label": "Waiting",
    "color": "#94a3b8",
    "order": 1
  },
  "timestamp": "2026-02-19T10:00:00.000Z"
}
```

### `session_status_updated`

Emitted when a session status is updated (label, color, order).

**Payload:**
```json
{
  "type": "session_status_updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "label": "In Queue",
    "color": "#3b82f6",
    "order": 1
  },
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

### `session_status_deleted`

Emitted when a session status is deleted.

**Payload:**
```json
{
  "type": "session_status_deleted",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2026-02-19T11:00:00.000Z"
}
```

## Item Events

### `item_created`

Emitted when a new queue item is created within a session.

**Payload:**
```json
{
  "type": "item_created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status_id": "550e8400-e29b-41d4-a716-446655440010",
    "queue_number": "A001",
    "name": "John Doe",
    "metadata": {},
    "created_at": "2026-02-19T10:05:00.000Z"
  },
  "timestamp": "2026-02-19T10:05:00.000Z"
}
```

### `item_updated`

Emitted when queue item metadata is updated (name, metadata, etc.). Not emitted when only status changes.

**Payload:**
```json
{
  "type": "item_updated",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status_id": "550e8400-e29b-41d4-a716-446655440010",
    "queue_number": "A001",
    "name": "John Smith",
    "metadata": {
      "phone": "555-1234"
    },
    "created_at": "2026-02-19T10:05:00.000Z"
  },
  "timestamp": "2026-02-19T10:10:00.000Z"
}
```

### `item_status_changed`

Emitted when an item's status is updated (moved to different status).

**Payload:**
```json
{
  "type": "item_status_changed",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "status_id": "550e8400-e29b-41d4-a716-446655440011",
    "queue_number": "A001",
    "name": "John Smith",
    "metadata": {
      "phone": "555-1234"
    },
    "created_at": "2026-02-19T10:05:00.000Z"
  },
  "timestamp": "2026-02-19T10:20:00.000Z"
}
```

### `item_deleted`

Emitted when a queue item is deleted.

**Payload:**
```json
{
  "type": "item_deleted",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440020",
    "queue_id": "550e8400-e29b-41d4-a716-446655440001",
    "session_id": "550e8400-e29b-41d4-a716-446655440000"
  },
  "timestamp": "2026-02-19T11:30:00.000Z"
}
```

## SSE Endpoints

### `GET /sse/sessions/:sessionId/stream`

Subscribe to real-time events for a specific queue session. Receives all session and item events for the specified session.

**Path Parameters:**
- `sessionId` (string, required) - The UUID of the queue session to subscribe to

**Headers:**
- `Last-Event-ID` (string, optional) - Event ID for reconnection and catching up on missed events

**Example Request:**
```bash
curl -N -H "Accept: text/event-stream" \
  http://localhost:3001/sse/sessions/550e8400-e29b-41d4-a716-446655440000/stream
```

**Events Received:**
- `session_created`, `session_updated`, `session_closed`, `session_deleted`
- `session_status_created`, `session_status_updated`, `session_status_deleted`
- `item_created`, `item_updated`, `item_status_changed`, `item_deleted`

### `GET /sse/items/:itemId/stream`

Subscribe to real-time events for a specific queue item. Receives only item-related events for the specified item.

**Path Parameters:**
- `itemId` (string, required) - The UUID of the queue item to subscribe to

**Headers:**
- `Last-Event-ID` (string, optional) - Event ID for reconnection and catching up on missed events

**Example Request:**
```bash
curl -N -H "Accept: text/event-stream" \
  http://localhost:3001/sse/items/550e8400-e29b-41d4-a716-446655440020/stream
```

**Events Received:**
- `item_updated`
- `item_status_changed`
- `item_deleted`

## Event Payload Structure

All SSE events follow this structure:

```typescript
interface SSEEvent {
  type: string;           // Event type (e.g., "session_created")
  data: unknown;          // Event payload with snake_case properties
  timestamp: string;      // ISO 8601 timestamp
}
```

The SSE message format includes an event ID for deduplication and reconnection support:

```
id: evt_1234567890_abc123def
data: {"type":"session_created","data":{...},"timestamp":"2026-02-19T10:00:00.000Z"}

```

### Reconnection Support

Clients can reconnect using the `Last-Event-ID` header to receive missed events since their last connection:

```bash
curl -N -H "Accept: text/event-stream" \
  -H "Last-Event-ID: evt_1234567890_abc123def" \
  http://localhost:3001/sse/sessions/550e8400-e29b-41d4-a716-446655440000/stream
```

The server will replay missed events and send `catch_up_start` and `catch_up_complete` events to notify the client.

### Heartbeat

The server sends a keep-alive message every 30 seconds to prevent connection timeouts:

```
: keep-alive

```

## Deprecation Notice

The following legacy event types are deprecated and should not be used in new implementations:

**Deprecated Batch Events:**
- `batch_created` - Use `session_created` instead
- `batch_updated` - Use `session_updated` instead
- `batch_deleted` - Use `session_deleted` instead

**Deprecated Queue Item Events:**
- `queue_item_created` - Use `item_created` instead
- `queue_item_updated` - Use `item_updated` instead
- `queue_item_deleted` - Use `item_deleted` instead

**Deprecated Endpoint:**
- `GET /batches/:batchId/events` - Use `GET /sse/sessions/:sessionId/stream` instead

## Connection Management

### Connection Limits

- Maximum connections per session: 50
- Maximum event history per session: 1000 events
- Rate limit: 100 messages per 60 seconds per client

### Special Events

**Connected Event:**
Emitted when a client successfully connects to the stream.

```json
{
  "type": "connected",
  "clientId": "client_1234567890_abc123def",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-19T10:00:00.000Z"
}
```

**Error Event:**
Emitted when an error occurs (e.g., connection limit reached).

```json
{
  "type": "error",
  "data": null,
  "timestamp": "2026-02-19T10:00:00.000Z",
  "message": "Connection limit reached for this session"
}
```

**Disconnect Event:**
Emitted when the server is shutting down.

```json
{
  "type": "disconnect",
  "data": null,
  "timestamp": "2026-02-19T14:00:00.000Z",
  "message": "Server shutting down"
}
```

**Catch-up Events:**
Emitted during reconnection when replaying missed events.

```json
{
  "type": "catch_up_start",
  "data": null,
  "timestamp": "2026-02-19T10:00:00.000Z",
  "message": "Replaying missed events"
}
```

```json
{
  "type": "catch_up_complete",
  "data": null,
  "timestamp": "2026-02-19T10:00:05.000Z",
  "message": "Replayed 15 missed events"
}
```

## Best Practices

1. **Always handle the `disconnect` event** to gracefully close connections
2. **Store the last received event ID** to support reconnection
3. **Implement exponential backoff** for reconnection attempts
4. **Handle `error` events** to inform users of issues
5. **Use `item_status_changed`** separately from `item_updated` to distinguish status changes from metadata updates
6. **Subscribe to session streams** for most use cases, only use item streams when tracking specific items
