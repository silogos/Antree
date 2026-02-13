# API Contract - Antree Queue Management System

> **Note**: This document defines the API contract for future backend implementation. The frontend currently uses mock services that simulate these endpoints.

## Overview

The Antree Queue Management System API provides REST endpoints for managing queue items and statuses. All responses use JSON format.

**Base URL**: `http://localhost:3000/api` (future backend)

---

## Data Models

### QueueItem

Represents a customer queue item with customizable payload for extensibility.

```typescript
interface QueueItem {
  id: string;                    // Unique identifier (UUID)
  queueNumber: string;           // Display queue number (e.g., "A001", "B025")
  name: string;                  // Customer name
  service?: string;              // Service type (optional, e.g., "General", "VIP")
  statusId: string;              // Reference to Status ID
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  customPayload?: Record<string, any>;  // Flexible payload for custom fields
}
```

### QueueStatus

Represents a status column in the Kanban board.

```typescript
interface QueueStatus {
  id: string;        // Unique identifier (UUID)
  label: string;     // Display label (e.g., "Waiting", "In Progress", "Done")
  color: string;     // Color code (hex, e.g., "#3B82F6")
  order: number;     // Display order (ascending)
}
```

---

## QueueService API

### GET /queues

Get all queue items.

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "queueNumber": "A001",
      "name": "Ahmad Santoso",
      "service": "General",
      "statusId": "status-1",
      "createdAt": "2026-02-13T10:00:00.000Z",
      "updatedAt": "2026-02-13T10:00:00.000Z",
      "customPayload": {
        "priority": "high",
        "notes": "VIP customer"
      }
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
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

### POST /queues

Create a new queue item.

**Request Body**:

```json
{
  "queueNumber": "A003",
  "name": "Budi Hartono",
  "service": "VIP",
  "statusId": "status-1",
  "customPayload": {
    "phone": "+62-812-3456-7890",
    "email": "budi@example.com"
  }
}
```

**Required Fields**: `queueNumber`, `name`, `statusId`

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "queueNumber": "A003",
    "name": "Budi Hartono",
    "service": "VIP",
    "statusId": "status-1",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z",
    "customPayload": {
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
  "message": "queueNumber, name, and statusId are required",
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
  "customPayload": {
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
    "queueNumber": "A003",
    "name": "Budi Hartono (Updated)",
    "service": "VIP",
    "statusId": "status-2",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T11:00:00.000Z",
    "customPayload": {
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

Get all status items, ordered by their display order.

**Request**: None

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "status-1",
      "label": "Waiting",
      "color": "#F59E0B",
      "order": 1
    },
    {
      "id": "status-2",
      "label": "In Progress",
      "color": "#3B82F6",
      "order": 2
    },
    {
      "id": "status-3",
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
  "label": "Cancelled",
  "color": "#EF4444",
  "order": 4
}
```

**Required Fields**: `label`, `color`, `order`

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "status-4",
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
  "message": "label, color, and order are required",
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

### Frontend (Mock Services)
- ✅ **Implemented**: Mock services simulate these API endpoints
- ✅ **Implemented**: Data structure matches contract exactly
- ✅ **Implemented**: All CRUD operations supported
- 📍 **Location**: `/fe/src/services/mockQueueService.ts`, `/fe/src/services/mockStatusService.ts`

### Backend (Future)
- ❌ **Not Implemented**: Backend API does not exist yet
- 📍 **Location**: `/be` directory (to be implemented in future tasks)

---

## Notes

1. **customPayload**: This field allows flexible customization per queue item. Frontend can add any custom fields needed (e.g., phone, email, priority, notes).

2. **Status References**: When deleting a status, ensure no queues reference it. Either:
   - Delete all queues with that status first, or
   - Implement status reassignment logic

3. **Order Management**: Status order determines column sequence in Kanban board. Ensure order values are unique and sequential.

4. **Timestamps**: All timestamps are in ISO 8601 format (UTC).

5. **ID Format**: All IDs use UUID v4 format for uniqueness.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-13 | Initial API contract definition |
