# Backend Integration Guide

This document explains how to integrate the frontend with the backend API.

## Overview

The backend provides:
- REST API for CRUD operations on boards, statuses, and queues
- SSE (Server-Sent Events) for real-time updates

## API Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: Set via `VITE_API_URL` environment variable

## Available Services

### 1. Board Service

```typescript
import { boardService } from '../services';

// Get all boards
const { data, total } = await boardService.getBoards();

// Get single board
const { data: board } = await boardService.getBoardById('board-123');

// Create board
const { data: newBoard } = await boardService.createBoard({
  name: 'Main Reception',
  description: 'Primary customer service queue',
});

// Update board
const { data: updatedBoard } = await boardService.updateBoard('board-123', {
  name: 'Updated Name',
});

// Delete board
await boardService.deleteBoard('board-123');
```

### 2. Status Service

```typescript
import { statusService } from '../services';

// Get statuses for a board
const { data: statuses } = await statusService.getStatuses('board-123');

// Create status
const { data: newStatus } = await statusService.createStatus({
  boardId: 'board-123',
  label: 'Waiting',
  color: '#F59E0B',
  order: 1,
});

// Update status
const { data: updatedStatus } = await statusService.updateStatus('status-123', {
  label: 'Updated Label',
});

// Delete status
await statusService.deleteStatus('status-123');
```

### 3. Queue Service

```typescript
import { queueService } from '../services';

// Get queues (optionally filtered)
const { data: queues } = await queueService.getQueues({
  boardId: 'board-123',
  statusId: 'status-123',
});

// Create queue
const { data: newQueue } = await queueService.createQueue({
  boardId: 'board-123',
  queueNumber: 'A001',
  name: 'John Doe',
  statusId: 'status-123',
  metadata: {
    phone: '+62-812-3456-7890',
    email: 'john@example.com',
  },
});

// Update queue
const { data: updatedQueue } = await queueService.updateQueue('queue-123', {
  statusId: 'status-456',
  name: 'Updated Name',
});

// Delete queue
await queueService.deleteQueue('queue-123');
```

### 4. SSE (Real-time Updates)

#### Using the Hook (Recommended)

```typescript
import { useBoardSSE } from '../hooks/useBoardSSE';
import { useState } from 'react';

function BoardView({ boardId }: { boardId: string }) {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [statuses, setStatuses] = useState<QueueStatus[]>([]);

  const { isConnected } = useBoardSSE(boardId, {
    onQueueCreated: (queue) => {
      setQueues(prev => [...prev, queue]);
    },
    onQueueUpdated: (queue) => {
      setQueues(prev => prev.map(q => q.id === queue.id ? queue : q));
    },
    onQueueDeleted: ({ id }) => {
      setQueues(prev => prev.filter(q => q.id !== id));
    },
    onStatusCreated: (status) => {
      setStatuses(prev => [...prev, status]);
    },
    onStatusUpdated: (status) => {
      setStatuses(prev => prev.map(s => s.id === status.id ? status : s));
    },
    onStatusDeleted: ({ id }) => {
      setStatuses(prev => prev.filter(s => s.id !== id));
    },
  });

  return (
    <div>
      <div>Connection Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
      {/* Render board */}
    </div>
  );
}
```

#### Using the SSE Client Directly

```typescript
import { getSSEClient } from '../services/sseClient';

const sseClient = getSSEClient();

// Connect to board
sseClient.connect('board-123', {
  onMessage: (event) => {
    console.log('Received event:', event.type, event.data);
  },
  onOpen: () => {
    console.log('SSE connected');
  },
  onClose: () => {
    console.log('SSE disconnected');
  },
  onError: (error) => {
    console.error('SSE error:', error);
  },
});

// Disconnect
sseClient.disconnect();
```

## SSE Event Types

| Event Type | Data Type | Description |
|------------|-----------|-------------|
| `connected` | `{ clientId, boardId }` | Initial connection message |
| `queue_created` | `QueueItem` | New queue item created |
| `queue_updated` | `QueueItem` | Queue item updated |
| `queue_deleted` | `{ id }` | Queue item deleted |
| `status_created` | `QueueStatus` | New status created |
| `status_updated` | `QueueStatus` | Status updated |
| `status_deleted` | `{ id }` | Status deleted |
| `board_updated` | `QueueBoard` | Board updated |
| `board_deleted` | `{ id }` | Board deleted |

## Error Handling

All API services can throw errors. Always wrap calls in try-catch:

```typescript
import { queueService } from '../services';

async function createQueue() {
  try {
    const { data } = await queueService.createQueue({
      boardId: 'board-123',
      queueNumber: 'A001',
      name: 'John Doe',
      statusId: 'status-123',
    });
    console.log('Queue created:', data);
  } catch (error: any) {
    if (error.success === false) {
      // API error
      console.error('Error:', error.error, error.message);
      if (error.details) {
        // Field-specific errors
        error.details.forEach((detail: any) => {
          console.error(`${detail.field}: ${detail.message}`);
        });
      }
    } else {
      // Network error
      console.error('Network error:', error);
    }
  }
}
```

## Environment Variables

Create a `.env` file in the frontend directory:

```bash
VITE_API_URL=http://localhost:3001/api
```

Or use the existing `.env.example`:

```bash
cp .env.example .env
```

## Switching Between Mock and Real API

The frontend exports both mock and real API services. Choose which one to use:

```typescript
// Use mock services (for development)
import { mockQueueService, mockStatusService } from '../services';

// Use real API services (for production)
import { queueService, statusService } from '../services';
```

## Running the Backend

```bash
cd be
npm install
npm run dev
```

The backend will be available at `http://localhost:3001`

## API Endpoints Reference

### Boards
- `GET /boards` - Get all boards
- `GET /boards/:id` - Get single board
- `POST /boards` - Create board
- `PUT /boards/:id` - Update board
- `DELETE /boards/:id` - Delete board

### Statuses
- `GET /statuses?boardId=:id` - Get statuses for a board
- `GET /statuses/:id` - Get single status
- `POST /statuses` - Create status
- `PUT /statuses/:id` - Update status
- `DELETE /statuses/:id` - Delete status

### Queues
- `GET /queues?boardId=:id&statusId=:id` - Get queues (filtered)
- `GET /queues/:id` - Get single queue
- `POST /queues` - Create queue
- `PUT /queues/:id` - Update queue
- `DELETE /queues/:id` - Delete queue

### SSE
- `GET /sse/boards/:boardId/events` - Connect to board events stream

See `docs/api-contract.md` for full API documentation.
