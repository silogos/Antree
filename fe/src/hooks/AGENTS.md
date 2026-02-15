# REACT HOOKS

**Parent:** ../../AGENTS.md

## OVERVIEW
Custom React hooks for state management, API calls, SSE connections, and business logic.

## STRUCTURE
```
hooks/
├── useBoards.ts        # Board CRUD + local state sync
├── useStatuses.ts      # Status CRUD + local state sync
├── useQueues.ts        # Queue CRUD + local state sync
├── useBoardSSE.ts      # SSE connection for real-time updates
├── useAutoMovement.ts   # Auto-advance queues through statuses
├── useSound.ts         # Sound playback for announcements
└── useAutoRefresh.ts   # Auto-refresh data on interval
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Board management | useBoards.ts | CRUD + local state sync for SSE |
| Queue management | useQueues.ts | CRUD + local state sync for SSE |
| SSE connection | useBoardSSE.ts | Real-time event subscriptions |
| Auto-advance logic | useAutoMovement.ts | 15s interval, moves queues randomly |

## CONVENTIONS
- **State sync pattern**: CRUD hooks return `updateXLocal`, `addXLocal`, `removeXLocal` for SSE updates
- **Error handling**: Hooks catch errors and set `error` state, throw for component handling
- **Loading states**: All hooks return `loading` boolean for UI feedback
- **SSE integration**: `useBoardSSE` provides event callbacks for SSE events

## HOOK PATTERNS

### CRUD Hooks (useBoards, useStatuses, useQueues)
```typescript
// Returns
{
  items,           // Array of items
  loading,         // Boolean loading state
  error,           // Error message or null
  fetchX,         // Fetch from API
  createX,        // Create via API (updates local state)
  updateX,        // Update via API (updates local state)
  deleteX,        // Delete via API (updates local state)
  updateXLocal,   // Update local state only (for SSE)
  addXLocal,       // Add to local state only (for SSE)
  removeXLocal,    // Remove from local state only (for SSE)
}
```

### SSE Hook (useBoardSSE)
```typescript
const { isConnected, connect, disconnect } = useBoardSSE(boardId, {
  onQueueCreated: (queue) => console.log(queue),
  onQueueUpdated: (queue) => console.log(queue),
  onQueueDeleted: (data) => console.log(data.id),
  onStatusCreated: (status) => console.log(status),
  onStatusUpdated: (status) => console.log(status),
  onStatusDeleted: (data) => console.log(data.id),
  onBoardUpdated: (board) => console.log(board),
  onBoardDeleted: (data) => console.log(data.id),
});
```

## KEY HOOKS

### useBoardSSE
Real-time SSE connection for board updates.
- **Auto-reconnect**: Handled by `SSEClient` class
- **Connection lifecycle**: Connects when `boardId` changes, disconnects on unmount
- **Event routing**: Routes SSE events to appropriate callbacks
- **Connection state**: Returns `isConnected` boolean

### useAutoMovement
Automatically advances queues through status stages.
- **Interval**: Every 15 seconds
- **Logic**: Randomly selects active queue, moves to next status
- **Stop condition**: Disables when all queues reach "Done" status
- **Announcement**: Plays sound when queue advances

## ANTI-PATTERNS
- **No direct API calls in components** - use CRUD hooks instead
- **No manual SSE connections** - use `useBoardSSE` hook
- **No duplicate state** - leverage local sync methods from CRUD hooks
- **No manual intervals** - use `useAutoRefresh` for periodic updates

## SSE INTEGRATION PATTERN

1. **Initialize CRUD hooks** (e.g., `useQueues`)
2. **Initialize SSE hook** (e.g., `useBoardSSE`)
3. **Map SSE events to local updates**:
   ```typescript
   useBoardSSE(boardId, {
     onQueueCreated: (queue) => addQueueLocal(queue),
     onQueueUpdated: (queue) => updateQueueLocal(queue.id, queue),
     onQueueDeleted: (data) => removeQueueLocal(data.id),
   });
   ```
4. **Benefit**: Instant UI updates without re-fetching from API

## AUTO-MOVEMENT LOGIC

1. Finds "Done" status (highest `order` value)
2. Filters queues not in "Done" status
3. Randomly selects queue to advance
4. Moves queue to next status (by `order`)
5. Plays announcement sound
6. Repeats every 15 seconds

**Example Status Flow:**
- Waiting (order=0) → In Progress (order=1) → Done (order=2)
- Queue moves: Waiting → In Progress → Done
