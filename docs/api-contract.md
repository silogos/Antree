# API Contract - Antree Queue Management System

> **Note**: This document defines the API contract for future backend implementation. The frontend currently uses mock services that simulate these endpoints.

## Overview

The Antree Queue Management System API provides REST endpoints for managing queue boards, statuses, and items. All responses use JSON format.

**Base URL**: `http://localhost:3000/api` (future backend)

**Multi-Tenancy**: The system supports multiple queue boards, with statuses and items scoped to specific boards.

---

## Data Models

### QueueBoard

Represents a queue board (Kanban board) that contains statuses and queue items.

```typescript
interface QueueBoard {
  id: string;              // Unique identifier (UUID)
  name: string;            // Board name
  description?: string;    // Board description (optional)
  isActive: boolean;       // Active status (default: true)
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### QueueItem

Represents a customer queue item with customizable metadata for extensibility.

```typescript
interface QueueItem {
  id: string;                    // Unique identifier (UUID)
  boardId: string;               // Reference to Queue Board ID
  queueNumber: string;           // Display queue number (e.g., "A001", "B025")
  name: string;                  // Customer name
  statusId: string;              // Reference to Queue Status ID
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  metadata?: Record<string, any>;  // Flexible JSON metadata for custom fields (e.g., phone, email, priority, notes)
}
```

### QueueStatus

Represents a status column in the Kanban board.

```typescript
interface QueueStatus {
  id: string;        // Unique identifier (UUID)
  boardId: string;   // Reference to Queue Board ID
  label: string;     // Display label (e.g., "Waiting", "In Progress", "Done")
  color: string;     // Color code (hex, e.g., "#3B82F6")
  order: number;     // Display order (ascending)
}
```

### User

Represents a system user (for authentication).

```typescript
interface User {
  id: number;            // Auto-increment ID
  username: string;      // Unique username
  email: string;         // Unique email
  password: string;      // Hashed password
  fullName?: string;     // Full name (optional)
  isActive: boolean;     // Active status (default: true)
  createdAt: string;     // ISO 8601 timestamp
  updatedAt: string;     // ISO 8601 timestamp
}
```

---

## QueueService API

### GET /queues

Get all queue items. Optionally filter by board or status.

**Query Parameters** (optional):
- `boardId` - Filter by board ID
- `statusId` - Filter by status ID

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "boardId": "board-1",
      "queueNumber": "A001",
      "name": "Ahmad Santoso",
      "statusId": "status-1",
      "createdAt": "2026-02-13T10:00:00.000Z",
      "updatedAt": "2026-02-13T10:00:00.000Z",
      "metadata": {
        "priority": "high",
        "notes": "VIP customer"
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "boardId": "board-1",
      "queueNumber": "A002",
      "name": "Siti Rahayu",
      "statusId": "status-1",
      "createdAt": "2026-02-13T10:05:00.000Z",
      "updatedAt": "2026-02-13T10:05:00.000Z"
    }
  ],
  "total": 2
}
```

---

### GET /queues/:id

Get a single queue item by ID.

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "boardId": "board-1",
    "queueNumber": "A001",
    "name": "Ahmad Santoso",
    "statusId": "status-1",
    "createdAt": "2026-02-13T10:00:00.000Z",
    "updatedAt": "2026-02-13T10:00:00.000Z",
    "metadata": {
      "priority": "high",
      "notes": "VIP customer"
    }
  }
}
```

**Error Response**: `404 Not Found`

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Queue with id 550e8400-e29b-41d4-a716-446655440000 not found"
}
```

---

### POST /queues

Create a new queue item.

**Request Body**:

```json
{
  "boardId": "board-1",
  "queueNumber": "A003",
  "name": "Budi Hartono",
  "statusId": "status-1",
  "metadata": {
    "phone": "+62-812-3456-7890",
    "email": "budi@example.com"
  }
}
```

**Required Fields**: `boardId`, `queueNumber`, `name`, `statusId`

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "boardId": "board-1",
    "queueNumber": "A003",
    "name": "Budi Hartono",
    "statusId": "status-1",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z",
    "metadata": {
      "phone": "+62-812-3456-7890",
      "email": "budi@example.com"
    }
  },
  "message": "Queue created successfully"
}
```

**Error Response**: `400 Bad Request`

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "boardId, queueNumber, name, and statusId are required",
  "details": [
    {
      "field": "statusId",
      "message": "Status not found"
    }
  ]
}
```

---

### PUT /queues/:id

Update an existing queue item.

**Request Body**:

```json
{
  "name": "Budi Hartono (Updated)",
  "statusId": "status-2",
  "metadata": {
    "phone": "+62-812-3456-7890",
    "email": "budi@example.com",
    "notes": "VIP customer - updated"
  }
}
```

**Optional Fields**: All fields are optional except `id` (in URL)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "boardId": "board-1",
    "queueNumber": "A003",
    "name": "Budi Hartono (Updated)",
    "statusId": "status-2",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T11:00:00.000Z",
    "metadata": {
      "phone": "+62-812-3456-7890",
      "email": "budi@example.com",
      "notes": "VIP customer - updated"
    }
  },
  "message": "Queue updated successfully"
}
```

**Error Response**: `404 Not Found`

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Queue with id 770e8400-e29b-41d4-a716-446655440002 not found"
}
```

---

### DELETE /queues/:id

Delete a queue item.

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002"
  },
  "message": "Queue deleted successfully"
}
```

**Error Response**: `404 Not Found`

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Queue with id 770e8400-e29b-41d4-a716-446655440002 not found"
}
```

---

## StatusService API

### GET /statuses

Get all status items for a board, ordered by their display order.

**Query Parameters**:
- `boardId` (required) - Filter by board ID

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "status-1",
      "boardId": "board-1",
      "label": "Waiting",
      "color": "#F59E0B",
      "order": 1
    },
    {
      "id": "status-2",
      "boardId": "board-1",
      "label": "In Progress",
      "color": "#3B82F6",
      "order": 2
    },
    {
      "id": "status-3",
      "boardId": "board-1",
      "label": "Done",
      "color": "#10B981",
      "order": 3
    }
  ],
  "total": 3
}
```

---

### POST /statuses

Create a new status.

**Request Body**:

```json
{
  "boardId": "board-1",
  "label": "Cancelled",
  "color": "#EF4444",
  "order": 4
}
```

**Required Fields**: `boardId`, `label`, `color`, `order`

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "status-4",
    "boardId": "board-1",
    "label": "Cancelled",
    "color": "#EF4444",
    "order": 4
  },
  "message": "Status created successfully"
}
```

**Error Response**: `400 Bad Request`

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "boardId, label, color, and order are required",
  "details": [
    {
      "field": "order",
      "message": "order must be a positive number"
    }
  ]
}
```

---

### PUT /statuses/:id

Update an existing status.

**Request Body**:

```json
{
  "label": "Cancelled (Updated)",
  "color": "#DC2626",
  "order": 5
}
```

**Optional Fields**: All fields are optional except `id` (in URL)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "status-4",
    "boardId": "board-1",
    "label": "Cancelled (Updated)",
    "color": "#DC2626",
    "order": 5
  },
  "message": "Status updated successfully"
}
```

**Error Response**: `404 Not Found`

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Status with id status-4 not found"
}
```

---

### DELETE /statuses/:id

Delete a status.

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "status-4"
  },
  "message": "Status deleted successfully"
}
```

**Error Response**: `409 Conflict` (if queues reference this status)

```json
{
  "success": false,
  "error": "Conflict",
  "message": "Cannot delete status with id status-4 because it is referenced by 3 queues"
}
```

---

## BoardService API

### GET /boards

Get all queue boards.

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "board-1",
      "name": "Main Reception",
      "description": "Primary customer service queue",
      "isActive": true,
      "createdAt": "2026-02-13T09:00:00.000Z",
      "updatedAt": "2026-02-13T09:00:00.000Z"
    },
    {
      "id": "board-2",
      "name": "VIP Service",
      "description": "VIP customer queue",
      "isActive": true,
      "createdAt": "2026-02-13T09:30:00.000Z",
      "updatedAt": "2026-02-13T09:30:00.000Z"
    }
  ],
  "total": 2
}
```

---

### GET /boards/:id

Get a single board by ID.

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "board-1",
    "name": "Main Reception",
    "description": "Primary customer service queue",
    "isActive": true,
    "createdAt": "2026-02-13T09:00:00.000Z",
    "updatedAt": "2026-02-13T09:00:00.000Z"
  }
}
```

**Error Response**: `404 Not Found`

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Board with id board-1 not found"
}
```

---

### POST /boards

Create a new queue board.

**Request Body**:

```json
{
  "name": "Customer Service",
  "description": "Primary customer service queue",
  "isActive": true
}
```

**Required Fields**: `name`

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "board-3",
    "name": "Customer Service",
    "description": "Primary customer service queue",
    "isActive": true,
    "createdAt": "2026-02-13T12:00:00.000Z",
    "updatedAt": "2026-02-13T12:00:00.000Z"
  },
  "message": "Board created successfully"
}
```

---

### PUT /boards/:id

Update an existing board.

**Request Body**:

```json
{
  "name": "Customer Service (Updated)",
  "description": "Updated description",
  "isActive": false
}
```

**Optional Fields**: All fields are optional except `id` (in URL)

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "board-3",
    "name": "Customer Service (Updated)",
    "description": "Updated description",
    "isActive": false,
    "createdAt": "2026-02-13T12:00:00.000Z",
    "updatedAt": "2026-02-13T13:00:00.000Z"
  },
  "message": "Board updated successfully"
}
```

---

### DELETE /boards/:id

Delete a board (cascade deletes all statuses and queue items in the board).

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "board-3"
  },
  "message": "Board deleted successfully"
}
```

**Error Response**: `404 Not Found`

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Board with id board-3 not found"
}
```

---

## Notes

1. **metadata**: This field allows flexible customization per queue item. It's stored as JSONB in PostgreSQL, supporting any JSON-serializable data (e.g., phone, email, priority, notes).

2. **Status References**: When deleting a status, ensure no queues reference it. The database has `onDelete: 'restrict'` on the foreign key, so deletion will fail if queues reference it.

3. **Board Deletion**: Deleting a board will cascade delete all associated statuses and queue items.

4. **Order Management**: Status order determines column sequence in Kanban board. Ensure order values are unique and sequential within a board.

5. **Timestamps**: All timestamps are in ISO 8601 format (UTC).

6. **ID Format**:
   - Users: Auto-increment integer
   - Boards, Statuses, Queue Items: UUID v4 format for uniqueness

---

## Response Codes

| Code | Description |
|------|-------------|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Invalid request body or validation error |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Resource cannot be deleted due to dependencies |
| `500 Internal Server Error` | Server error |

---

## Error Response Format

All error responses follow this structure:

```typescript
interface ErrorResponse {
  success: false;
  error: string;        // Error type (e.g., "Validation Error", "Not Found")
  message: string;      // Human-readable error message
  details?: Array<{     // Optional field-specific errors
    field: string;
    message: string;
  }>;
}
```

---

## Current Implementation Status

### Database
- ✅ **Implemented**: PostgreSQL with Drizzle ORM
- ✅ **Implemented**: Schema matches contract exactly
- 📍 **Location**: `/be/src/db/schema.ts`

### Backend API (Express.js)
- ✅ **Implemented**: BoardService endpoints
- ✅ **Implemented**: StatusService endpoints
- ✅ **Implemented**: QueueService endpoints
- 📍 **Location**: `/be/src/routes/`

### Frontend (Mock Services)
- ✅ **Implemented**: Mock services simulate these API endpoints
- 📍 **Location**: `/fe/src/services/mockQueueService.ts`, `/fe/src/services/mockStatusService.ts`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-02-14 | Updated contract to match existing database schema - added boards, metadata, user model |
| 1.0.0 | 2026-02-13 | Initial API contract definition |
