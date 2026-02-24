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

### Backend Structure (Feature-Based)

```
be/src/
├── db/                    # Database layer
│   ├── schema.ts          # Drizzle schema definitions (all tables)
│   └── index.ts           # Database connection
├── features/              # 🆕 Feature modules (grouped by domain)
│   ├── health/
│   │   └── health.route.ts
│   ├── items/             # Queue items feature
│   │   ├── items.route.ts
│   │   ├── queue-items.route.ts
│   │   ├── queue-item.service.ts
│   │   └── queue-item.validator.ts
│   ├── queues/            # Queue management feature
│   │   ├── queues.route.ts
│   │   ├── queue.service.ts
│   │   └── queue.validator.ts
│   ├── sessions/          # Session lifecycle feature
│   │   ├── sessions.route.ts
│   │   ├── session.service.ts
│   │   └── session.validator.ts
│   ├── statuses/          # Status management feature
│   │   ├── status.service.ts
│   │   └── status.validator.ts
│   └── templates/         # Template management feature
│       ├── templates.route.ts
│       ├── template.service.ts
│       └── template.validator.ts
├── lib/                   # Shared utilities
│   ├── logger.ts
│   ├── metrics.ts
│   └── pagination.ts
├── middleware/            # Global middleware
│   ├── error.middleware.ts
│   ├── metrics.middleware.ts
│   ├── response.middleware.ts
│   └── validation.middleware.ts
├── sse/                   # Server-Sent Events
│   ├── broadcaster.ts     # SSE connection manager & event broadcaster
│   └── index.ts           # SSE route handlers
├── types/                 # Shared TypeScript types
│   └── session.dto.ts
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

## Backend Conventions

### File Naming
- **Routes**: Use `.route.ts` suffix (e.g., `queues.route.ts`)
- **Services**: Use `.service.ts` suffix (e.g., `queue.service.ts`)
- **Validators**: Use `.validator.ts` suffix (e.g., `queue.validator.ts`)
- **Middleware**: Use `.middleware.ts` suffix (e.g., `error.middleware.ts`)

### Code Conventions
- **ES Modules**: All imports must use `.js` extension (TypeScript compiles to JS)
- **Hono**: Async route handlers, use `c.json()` for responses
- **Drizzle**: Use `db` instance from `db/index.ts`, relations defined in schema.ts
- **Feature Organization**: Each feature groups its route, service, and validator together

### Import Patterns
```typescript
// Within same feature - use relative import
import { queueService } from "./queue.service.js";

// Cross-feature imports - use feature path
import { sessionService } from "../sessions/session.service.js";

// Shared utilities - go up to src root
import { successResponse } from "../../middleware/response.middleware.js";
import { db } from "../../db/index.js";
```

### Anti-Patterns
- **No CommonJS** imports - must use ES modules with `.js` extension
- **No direct SQL queries** - use Drizzle ORM
- **No missing `.js` extensions** - ES modules requirement
- **Don't split features** - keep related route/service/validator together

### Where to Look
| Task | Location | Notes |
|------|----------|-------|
| Backend entry | `be/src/index.ts` | Hono app with CORS + logger |
| Frontend entry | `fe/src/main.tsx` | React mount point |
| DB schema | `be/src/db/schema.ts` | Table definitions (all tables) |
| DB connection | `be/src/db/index.ts` | PostgreSQL connection via `postgres` package |
| Route registration | `be/src/index.ts` | All feature routes mounted here |
| SSE events | `be/src/sse/broadcaster.ts` | Broadcast queue/session changes |
| Feature logic | `be/src/features/*/` | Each feature is self-contained |
| Components | `fe/src/components/` | Kanban board, modals, UI components |
| API services | `fe/src/services/` | Backend API calls |
| Hooks | `fe/src/hooks/` | React hooks for state/SSE |

## Project Structure

```
antree-app/
├── be/                 # @antree/backend - Hono + Drizzle ORM + PostgreSQL
├── fe/                 # @antree/frontend - React + Vite + TailwindCSS
├── docs/               # Project documentation
├── ss/                 # Screenshots/assets
├── package.json        # Workspace scripts (dev, build, start)
├── pnpm-workspace.yaml # Monorepo config
└── docker-compose.yml  # Docker orchestration
```

## Environment Variables

### Backend (be/.env)
| Variable | Required | Default | Description |
|----------|-----------|----------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string (e.g., `postgres://user:pass@host:5432/db`) |
| `PORT` | No | 3001 | Backend server port |
| `NODE_ENV` | No | development | Environment mode (development/production) |

### Frontend (fe/.env)
| Variable | Required | Default | Description |
|----------|-----------|----------|-------------|
| `VITE_API_URL` | No | http://localhost:3001 | Backend API base URL |

### Docker Compose (root)
| Variable | Required | Default | Description |
|----------|-----------|----------|-------------|
| `POSTGRES_USER` | No | antree_user | PostgreSQL username |
| `POSTGRES_PASSWORD` | No | antree_password | PostgreSQL password |
| `POSTGRES_DB` | No | antree_db | PostgreSQL database name |
| `POSTGRES_PORT` | No | 5432 | PostgreSQL port |

## Deployment

### Docker Deployment
```bash
# Start all services (backend + frontend + postgres)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Database Migrations
```bash
# Generate migration from schema changes
pnpm db:generate

# Push schema directly to database (for development)
pnpm db:push

# Run migrations (for production)
pnpm db:migrate
```
