# API SERVICES LAYER

**Parent:** ../../AGENTS.md

## OVERVIEW
Service layer for all backend API calls. Centralizes HTTP requests, response handling, and SSE connections.

## STRUCTURE
```
services/
├── index.ts               # Central export point
├── apiBoardService.ts     # Boards CRUD + apiRequest helper
├── apiStatusService.ts     # Statuses CRUD
├── apiQueueService.ts      # Queues CRUD
├── sseClient.ts           # SSE connection management
├── mockQueueService.ts     # Mock queues (dev)
└── mockStatusService.ts    # Mock statuses (dev)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| API base URL | apiBoardService.ts | `API_BASE_URL` from VITE_API_URL env |
| HTTP helper | apiBoardService.ts | `apiRequest<T>()` handles all fetch calls |
| SSE connection | sseClient.ts | `SSEClient` class with auto-reconnect |
| Board operations | apiBoardService.ts | `boardService` CRUD methods |
| Queue operations | apiQueueService.ts | `queueService` CRUD methods |
| Status operations | apiStatusService.ts | `statusService` CRUD methods |

## CONVENTIONS
- **Response format**: `{ success: boolean, data?: T, error?: string, message?: string }`
- **HTTP helper**: Use `apiRequest<T>(endpoint, options)` for all API calls
- **SSE singleton**: `getSSEClient()` returns singleton instance
- **Error handling**: Throws `ApiErrorResponse` on failure

## ANTI-PATTERNS
- **No direct fetch** - use `apiRequest()` helper
- **No hardcoded URLs** - use `API_BASE_URL` constant
- **No SSE in components** - use `useBoardSSE` hook instead

## SSE CLIENT

### Connection Lifecycle
```typescript
const sseClient = getSSEClient();
sseClient.connect(boardId, {
  onMessage: (event) => console.log(event),
  onOpen: () => console.log('connected'),
  onError: (err) => console.error(err),
  onClose: () => console.log('disconnected'),
});
sseClient.disconnect();
```

### Auto-Reconnect
- Max attempts: 5
- Initial delay: 3s
- Backoff: delay × attempt number
- Exponential: 3s → 6s → 9s → 12s → 15s

### SSE Event Types
| Event Type | Data Shape | When Emitted |
|------------|-----------|--------------|
| `queue_created` | `QueueItem` | POST /queues |
| `queue_updated` | `QueueItem` | PUT /queues/:id |
| `queue_deleted` | `{ id: string }` | DELETE /queues/:id |
| `status_created` | `QueueStatus` | POST /statuses |
| `status_updated` | `QueueStatus` | PUT /statuses/:id |
| `status_deleted` | `{ id: string }` | DELETE /statuses/:id |
| `board_updated` | `QueueBoard` | PUT /boards/:id |
| `board_deleted` | `{ id: string }` | DELETE /boards/:id |

## API RESPONSE FORMAT

### Success
```typescript
{
  success: true,
  data: T,           // Actual data (array or object)
  message?: string,   // Optional success message
  total?: number      // For list endpoints
}
```

### Error
```typescript
{
  success: false,
  error: string,     // Error type (e.g., "Validation Error")
  message: string,   // Human-readable error
  details?: Array<{   // Validation errors
    field: string,
    message: string
  }>
}
```

## API REQUEST EXAMPLES

```typescript
// GET all queues
const { data, total } = await queueService.getQueues({ boardId: 'board-123' });

// GET single queue
const { data } = await queueService.getQueueById('queue-456');

// CREATE queue
const { data } = await queueService.createQueue({
  boardId: 'board-123',
  queueNumber: 'A001',
  name: 'John Doe',
  statusId: 'status-waiting'
});

// UPDATE queue
const { data } = await queueService.updateQueue('queue-456', {
  statusId: 'status-completed'
});

// DELETE queue
await queueService.deleteQueue('queue-456');
```
