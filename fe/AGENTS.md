# FRONTEND PACKAGE

**Parent:** ../AGENTS.md

## OVERVIEW
React + Vite + TailwindCSS frontend with drag-and-drop Kanban queue UI.

## STRUCTURE
```
fe/
├── src/
│   ├── main.tsx          # React entry point
│   ├── App.tsx           # Main app component
│   ├── components/        # UI components
│   │   ├── KanbanBoard.tsx      # Main queue board
│   │   ├── StatusColumn.tsx      # Queue status column
│   │   ├── QueueCard.tsx         # Individual queue item
│   │   ├── AddQueueModal.tsx     # Create queue dialog
│   │   ├── StatusManagerModal.tsx # Manage statuses
│   │   └── ui/                  # Radix UI primitives
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service layer
│   ├── types/            # TypeScript types
│   └── lib/             # Utilities (validations, helpers)
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
└── package.json        # @antree/frontend
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Main UI | src/components/KanbanBoard.tsx | Drag-and-drop queue board |
| API calls | src/services/ | Backend API integration |
| SSE hooks | src/hooks/ | useSseConnection, useQueues |
| Types | src/types/queue.ts | Queue-related TypeScript interfaces |

## CONVENTIONS
- **Radix UI**: Use shadcn/ui components from components/ui/
- **@dnd-kit**: Drag-and-drop for queue items
- **Tailwind**: Utility-first styling, no custom CSS files
- **API Services**: All backend calls go through services/

## ANTI-PATTERNS
- **No direct fetch** - use services/ layer
- **No inline styles** - use Tailwind classes
- **No bypass API services** - never call backend directly from components

## COMMANDS
```bash
pnpm dev          # Vite dev server (port 5173)
pnpm build        # tsc -b && vite build
pnpm lint         # eslint . - check code quality
```
