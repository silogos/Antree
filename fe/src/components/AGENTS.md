# FRONTEND COMPONENTS

**Parent:** ../../AGENTS.md

## OVERVIEW
React components for queue management UI.

## STRUCTURE
```
components/
├── KanbanBoard.tsx      # Main board with drag-and-drop
├── StatusColumn.tsx      # Single status column
├── QueueCard.tsx         # Queue item card
├── AddQueueModal.tsx     # Create queue dialog
├── StatusManagerModal.tsx # Status CRUD dialog
├── Topbar.tsx            # App header
├── Footer.tsx            # App footer
├── SoundToggle.tsx       # Sound notification toggle
├── ViewModeToggle.tsx    # Compact/List view toggle
├── EmptyState.tsx        # Empty state placeholder
└── ui/                  # Radix UI primitives (Button, Dialog, Input, Label, Switch)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Main UI | KanbanBoard.tsx | Drag-and-drop, SSE integration |
| Queue cards | QueueCard.tsx | Individual item display |
| Modals | *Modal.tsx | Dialogs using Radix UI |
| UI primitives | ui/ | Reusable base components |

## CONVENTIONS
- **Radix UI**: All modal components use Dialog from Radix
- **@dnd-kit**: KanbanBoard and StatusColumn use drag-and-drop
- **Tailwind**: All styling via classes
- **Zod**: Form validation in modal components

## ANTI-PATTERNS
- **No inline styles** - use Tailwind
- **No bypass services** - API calls through services/
- **No native alert** - use UI components for feedback
