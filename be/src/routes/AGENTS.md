# BACKEND ROUTES

**Parent:** ../AGENTS.md

## OVERVIEW
Hono API endpoints for queue boards, statuses, and items management.

## STRUCTURE
```
routes/
├── boards.ts      # CRUD for queue boards
├── statuses.ts    # CRUD for queue statuses
├── queues.ts      # CRUD for queue items
└── health.ts     # Health check endpoint
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Boards API | boards.ts | GET/POST/PUT/DELETE /boards |
| Statuses API | statuses.ts | GET/POST/PUT/DELETE /statuses |
| Queues API | queues.ts | GET/POST/PUT/DELETE /queues with filters |

## CONVENTIONS
- **Response format**: `{ success: boolean, data?: any, error?: string, message?: string }`
- **Error handling**: Try-catch with 500 on errors, 404 on not found, 400 on validation
- **SSE broadcast**: Call `sseBroadcaster.broadcast()` after CRUD operations
- **Validation**: Check required fields before DB operations

## ANTI-PATTERNS
- **No missing .js imports** - ES modules requirement
- **No silent failures** - always return error responses
- **No CRUD without SSE** - broadcast all changes

## SSE EVENTS
| Event Type | When Emitted |
|------------|--------------|
| queue_created | POST /queues |
| queue_updated | PUT /queues/:id |
| queue_deleted | DELETE /queues/:id |
| board_updated | PUT /boards/:id |
| board_deleted | DELETE /boards/:id |

## API ENDPOINTS

### Health Check
```
GET /
```

**Response (200)**
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Boards

#### GET /boards
Get all queue boards.

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "board-123",
      "name": "Customer Service",
      "description": "Main customer service queue",
      "isActive": true,
      "createdAt": "2026-02-15T10:00:00.000Z",
      "updatedAt": "2026-02-15T10:00:00.000Z"
    }
  ],
  "total": 1
}
```

#### POST /boards
Create a new board.

**Request**
```json
{
  "name": "Customer Service",
  "description": "Main customer service queue",
  "isActive": true
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "board-123",
    "name": "Customer Service",
    "description": "Main customer service queue",
    "isActive": true,
    "createdAt": "2026-02-15T10:00:00.000Z",
    "updatedAt": "2026-02-15T10:00:00.000Z"
  },
  "message": "Board created successfully"
}
```

#### PUT /boards/:id
Update an existing board.

**Request**
```json
{
  "name": "Customer Service - Updated",
  "isActive": false
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "board-123",
    "name": "Customer Service - Updated",
    "description": "Main customer service queue",
    "isActive": false,
    "createdAt": "2026-02-15T10:00:00.000Z",
    "updatedAt": "2026-02-15T10:05:00.000Z"
  },
  "message": "Board updated successfully"
}
```

#### DELETE /boards/:id
Delete a board (cascades to statuses and queues).

**Response (200)**
```json
{
  "success": true,
  "data": { "id": "board-123" },
  "message": "Board deleted successfully"
}
```

### Statuses

#### GET /statuses
Get all statuses (optionally filter by board).

**Query Parameters**
- `boardId` (optional): Filter by board ID

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "status-waiting",
      "boardId": "board-123",
      "label": "Waiting",
      "color": "#94a3b8",
      "order": 1
    },
    {
      "id": "status-in-progress",
      "boardId": "board-123",
      "label": "In Progress",
      "color": "#3b82f6",
      "order": 2
    }
  ],
  "total": 2
}
```

#### POST /statuses
Create a new status.

**Request**
```json
{
  "boardId": "board-123",
  "label": "Completed",
  "color": "#22c55e",
  "order": 3
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "status-completed",
    "boardId": "board-123",
    "label": "Completed",
    "color": "#22c55e",
    "order": 3
  },
  "message": "Status created successfully"
}
```

### Queues

#### GET /queues
Get all queues (optionally filter by board or status).

**Query Parameters**
- `boardId` (optional): Filter by board ID
- `statusId` (optional): Filter by status ID

**Response (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "queue-456",
      "boardId": "board-123",
      "queueNumber": "A001",
      "name": "John Doe",
      "statusId": "status-waiting",
      "createdAt": "2026-02-15T10:00:00.000Z",
      "updatedAt": "2026-02-15T10:00:00.000Z",
      "metadata": {
        "customerEmail": "john@example.com"
      }
    }
  ],
  "total": 1
}
```

#### POST /queues
Create a new queue item.

**Request**
```json
{
  "boardId": "board-123",
  "queueNumber": "A001",
  "name": "John Doe",
  "statusId": "status-waiting",
  "metadata": {
    "customerEmail": "john@example.com",
    "phone": "1234567890"
  }
}
```

**Response (201)**
```json
{
  "success": true,
  "data": {
    "id": "queue-456",
    "boardId": "board-123",
    "queueNumber": "A001",
    "name": "John Doe",
    "statusId": "status-waiting",
    "createdAt": "2026-02-15T10:00:00.000Z",
    "updatedAt": "2026-02-15T10:00:00.000Z",
    "metadata": {
      "customerEmail": "john@example.com",
      "phone": "1234567890"
    }
  },
  "message": "Queue created successfully"
}
```

#### PUT /queues/:id
Update an existing queue.

**Request**
```json
{
  "statusId": "status-completed",
  "metadata": {
    "servedBy": "Agent Smith"
  }
}
```

**Response (200)**
```json
{
  "success": true,
  "data": {
    "id": "queue-456",
    "boardId": "board-123",
    "queueNumber": "A001",
    "name": "John Doe",
    "statusId": "status-completed",
    "createdAt": "2026-02-15T10:00:00.000Z",
    "updatedAt": "2026-02-15T10:10:00.000Z",
    "metadata": {
      "customerEmail": "john@example.com",
      "phone": "1234567890",
      "servedBy": "Agent Smith"
    }
  },
  "message": "Queue updated successfully"
}
```

#### DELETE /queues/:id
Delete a queue item.

**Response (200)**
```json
{
  "success": true,
  "data": { "id": "queue-456" },
  "message": "Queue deleted successfully"
}
```

### Error Responses

#### 400 Validation Error
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "name is required"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Board with id board-123 not found"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Database connection failed"
}
```
