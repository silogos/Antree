# App Integration Task - Learnings

## Architecture Patterns

### Hook Integration Pattern
The main pattern used for hook integration:
```typescript
// Import hook
const { queues, loading, error, fetchQueues } = useQueues();

// Store in local state for component rendering
const [queues, setQueues] = useState<QueueItem[]>([]);

// Sync hook data to local state
useEffect(() => {
  if (!loading && queues) {
    setQueues(queues);
  }
}, [loading, queues]);
```

**Learning**: Always sync hook data to local state because:
1. Hooks are for state management within the component
2. Local state is used for rendering and updates
3. Maintains a single source of truth for UI state

### Service Layer Pattern
```typescript
// Import mock service directly for operations
import { mockQueueService } from './services/mockQueueService';

// Use service for data mutations
const handleUpdateQueue = async (id: string, data: UpdateQueueInput) => {
  const updatedQueue = await mockQueueService.updateQueue(id, data);
  setQueues(prev => prev.map(q => q.id === id ? updatedQueue : q));
};
```

**Learning**: Service layer abstracts mock API calls with:
- `createQueue`: Creates new queue items
- `updateQueue`: Updates existing queue items
- `deleteQueue`: Removes queue items
- `getQueues`: Fetches all queues
- `getQueueById`: Fetches single queue

### Component Composition Pattern
```typescript
// Conditionally render components based on state
{viewMode === 'operator' && (
  <>
    <AddQueueModal />
    <StatusManagerModal />
  </>
)}
```

**Learning**: Modal components should:
- Be controlled by `open` prop
- Call `onSuccess` callback on completion
- Not require `onClose` prop (modal handles its own state)
- Be rendered directly (no extra wrapper needed)

## Common Pitfalls

### Import vs Export Issues
**Problem**: Using `import Component from './Component'` when it exports as `export function Component`
**Solution**: Use named imports: `import { Component } from './Component'`

**Lesson**: Always check the export pattern before importing. Look at the last line of the file or use grep for "export".

### Unused Variables and Functions
**Problem**: TypeScript complains about unused variables like `autoMovementEnabled`, `handleDeleteQueue`, etc.
**Solution**: Remove unused code or add `// eslint-disable-next-line` comments if intentional

**Lesson**: Keep code clean and remove unused imports and functions to avoid TypeScript errors.

### Type Mismatch in Props
**Problem**: Passing wrong props to components (e.g., `onToggle` instead of `onChange`)
**Solution**: Check the component interface definition and match props exactly

**Lesson**: Always verify component interfaces before usage. Use `grep -A 10 "interface ComponentProps"` to find them.

### Hook State Management
**Problem**: Forgetting to sync hook data to local state, causing stale UI
**Solution**: Use `useEffect` to sync hook state to local state

**Lesson**: Hooks provide state, but components need local state for rendering. Sync them properly.

### Component Interface Mismatches
**Problem**: Passing props that don't exist on components
**Example**: `Topbar` expects `title` and `lastRefresh`, but we tried passing `viewMode`, `soundEnabled`, etc.

**Solution**: Read the component file to find the interface:
```bash
grep -A 10 "interface TopbarProps" /path/to/Topbar.tsx
```

**Lesson**: Always verify component interfaces. Look at the function parameters.

## Build Verification

**Success Criteria**:
1. TypeScript compilation passes (`tsc -b`)
2. Vite build succeeds
3. No unused variables
4. No type mismatches

**Verification Command**:
```bash
pnpm run build
```

**Common Build Errors**:
- Unused imports/variables → Remove or suppress
- Type mismatches → Check interfaces and props
- Missing exports → Use named imports
- Property not found → Check component interface

## Component Integration Checklist

When integrating a component:
1. [ ] Check export pattern (named vs default)
2. [ ] Read component interface
3. [ ] Verify required props
4. [ ] Match prop types exactly
5. [ ] Handle component state (controlled vs uncontrolled)
6. [ ] Add proper event handlers
7. [ ] Verify build passes

## Modal Patterns

**Controlled Modal Pattern**:
```typescript
const [modalOpen, setModalOpen] = useState(false);

{viewMode === 'operator' && (
  <Modal
    open={modalOpen}
    onClose={() => setModalOpen(false)}
    onSuccess={handleSuccess}
  />
)}
```

**Note**: Most modals don't need `onClose` prop - they handle their own state internally.
