# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level (Run from project root)
```bash
pnpm dev              # Start both backend and frontend in parallel
pnpm dev:be           # Start backend only
pnpm dev:fe           # Start frontend only
pnpm build            # Build both backend and frontend
pnpm build:be         # Build backend only
pnpm build:fe         # Build frontend only
pnpm lint             # Lint frontend code
pnpm start            # Start production backend server
```

### Backend (be/ directory)
```bash
pnpm dev                    # Start backend with hot reload (tsx watch)
pnpm build                  # Compile TypeScript
pnpm start                  # Start production server
pnpm lint                   # Check code with Biome
pnpm lint:fix               # Fix lint issues
pnpm format                 # Format code with Biome

# Database operations
pnpm db:generate            # Generate Drizzle migrations
pnpm db:migrate             # Run migrations
pnpm db:push                # Push schema changes directly
pnpm db:studio              # Open Drizzle Studio (database GUI)
pnpm db:seed                # Seed database with sample data
pnpm db:seed:queue-items    # Seed queue items specifically
pnpm db:seed:real-world     # Seed with realistic data
pnpm db:seed:sample-items   # Seed sample items

# Simulation scripts (for testing SSE)
pnpm simulate               # Simulate banking queue workflow
pnpm simulate-http          # Simulate via HTTP endpoints
pnpm simulate-simple        # Simple queue simulation

# Testing
pnpm test                   # Run Vitest tests
pnpm test:ui                # Run tests with UI
pnpm test:coverage          # Run tests with coverage report
```

### Frontend (fe/ directory)
```bash
pnpm dev          # Start Vite dev server
pnpm build        # Build for production
pnpm lint         # Check code with Biome
pnpm lint:fix     # Fix lint issues
pnpm format       # Format code with Biome
pnpm preview      # Preview production build
```

## Architecture Overview

Antree is a **real-time queue management system** built with a session-based architecture. The project uses a monorepo structure with separate backend and frontend workspaces.

### Core Architecture Pattern: Template → Queue → Session → Items

The system is built around a four-level hierarchy:

1. **Template** (`queue_templates`) - Reusable status definitions for queue types
2. **Queue** (`queues`) - Permanent dashboard/configurations that reference a template
3. **Session** (`queue_sessions`) - Operational runtime periods (e.g., "Morning Shift", "Batch #12")
4. **Queue Item** (`queue_items`) - Individual items within a session

**Key Design Decisions:**
- Queue numbering resets per session (each session starts from A-1, B-1, etc.)
- Queue items are immutable to their session (cannot move between sessions)
- Sessions use soft delete (`deletedAt` column)
- Template statuses are cloned into sessions when a session is created
- Multiple sessions can be active simultaneously for a single queue

### Technology Stack

**Backend (`be/`)**:
- Hono - Fast, lightweight web framework
- Drizzle ORM - Type-safe SQL toolkit
- PostgreSQL - Primary database
- Vitest - Testing framework
- Biome - Linter and formatter

**Frontend (`fe/`)**:
- React 18.3 - UI library
- Vite - Build tool
- TailwindCSS v4 - Styling
- @dnd-kit - Drag-and-drop functionality
- Radix UI - Component primitives
- React Router - Client-side routing
- Zod - Schema validation

### Backend Structure

```
be/src/
├── db/
│   ├── schema.ts          # Drizzle schema definitions (all tables)
│   └── index.ts           # Database connection
├── routes/
│   ├── queues.ts          # Queue CRUD endpoints
│   ├── sessions.ts        # Session lifecycle endpoints
│   ├── items.ts           # Queue item endpoints
│   └── templates.ts       # Template management endpoints
├── services/
│   ├── session.service.ts # Session business logic
│   └── [other services]
├── sse/
│   ├── broadcaster.ts     # SSE connection manager & event broadcaster
│   └── index.ts           # SSE route handlers
├── middleware/            # Request/response middleware
├── validators/            # Zod validation schemas
└── index.ts              # Main server entry point
```

### Frontend Structure

```
fe/src/
├── components/
│   ├── KanbanBoard.tsx   # Main drag-and-drop board
│   ├── QueueCard.tsx     # Individual queue item
│   ├── StatusColumn.tsx  # Column with drag-and-drop
│   ├── SessionDetail.tsx # Session view
│   └── [other components]
├── hooks/
│   ├── useSessionSSE.ts  # Session event subscription
│   └── [other hooks]
├── services/
│   ├── sseClient.ts      # SSE client implementation
│   └── [API services]
└── main.tsx             # React entry point
```

## Server-Sent Events (SSE)

The SSE system is the core real-time communication mechanism:

**Connection Types:**
- Session streams: `/sse/sessions/:sessionId/stream` - All events for a session
- Item streams: `/sse/items/:itemId/stream` - Events for a specific item

**Event Types:**
```typescript
// Session lifecycle
session_created, session_updated, session_paused, session_resumed, session_completed

// Session statuses
session_status_created, session_status_updated, session_status_deleted

// Queue items
queue_item_created, queue_item_updated, queue_item_status_changed, queue_item_deleted

// Queues
queue_created, queue_updated, queue_deleted

// Templates
template_created, template_updated, template_deleted

// Legacy (deprecated)
batch_created, batch_updated, batch_deleted
board_updated, board_deleted
```

**SSE Features:**
- Event ID tracking for reconnection (`Last-Event-ID` header support)
- Event history replay (1000 events per session)
- Rate limiting (100 messages/60 seconds per client)
- Connection cleanup (idle connections after 5 minutes)
- Graceful shutdown handling

**Key Files:**
- `be/src/sse/broadcaster.ts` - SSE broadcaster singleton with connection management
- `be/src/sse/index.ts` - SSE route handlers
- `fe/src/services/sseClient.ts` - Frontend SSE client

## Database Schema

**Core Tables:**
- `queue_templates` - Reusable queue configurations
- `queue_template_statuses` - Status definitions for templates
- `queues` - Permanent queue instances (reference templates)
- `queue_sessions` - Operational periods for queues
- `queue_session_statuses` - Clone of template statuses for sessions
- `queue_items` - Queue items within sessions (immutable)
- `users` - User accounts

**Important Patterns:**
- Soft deletes via `deletedAt` (sessions) or `isActive` flags
- UUID primary keys throughout
- Foreign key cascading deletes
- Template-based inheritance for session statuses

## API Response Format

All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Detailed error message"
}
```

See `docs/queue-session-openapi.yaml` for the complete OpenAPI specification.

## Key Development Notes

### Creating a New Session
When creating a session via `POST /queues/:queueId/sessions`:
1. Session is created with statuses cloned from the queue's template
2. Session number is auto-incremented per queue
3. SSE event `session_created` is broadcast

### Updating Queue Item Status
When updating item status via `PATCH /items/:itemId/status`:
1. Item's `statusId` is updated
2. SSE event `queue_item_status_changed` is broadcast
3. Frontend updates in real-time via SSE

### Environment Setup
- Backend requires `.env` file with `DATABASE_URL` and `PORT`
- Default backend port: 3001
- Frontend dev server: Vite default (5173)

### Testing
- Test files in `be/src/tests/`
- Use Vitest for backend testing
- Test utilities in `be/src/tests/utils.ts`
