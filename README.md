# Antree

A real-time queue management system for service businesses. Built with a **session-based architecture** that allows you to manage operational periods (morning shift, afternoon batch, etc.) with drag-and-drop status tracking, live updates via SSE, and support for hospitals, banks, customer service centers, and more.

![Antree](https://img.shields.io/badge/Antree-Queue%20Management-blue)

## Features

- 🎯 **Session-Based Architecture** - Create operational periods (sessions) for queues with independent numbering and state
- 📊 **Drag-and-Drop Status Tracking** - Visual Kanban-style queue management
- ⚡ **Real-Time Updates** - Server-Sent Events (SSE) for instant queue status updates
- 👥 **Queue Item Management** - Add, update, and remove queue items with ease
- 🎨 **Customizable Status Templates** - Define reusable status templates with custom labels and colors
- 🔄 **Multi-Session Support** - Run multiple sessions simultaneously per queue

## Tech Stack

### Backend
- **Hono** - Fast, lightweight web framework
- **Drizzle ORM** - Type-safe SQL toolkit
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe JavaScript
- **Vitest** - Testing framework (328 tests)

### Frontend
- **React 18.3** - UI library
- **Vite** - Fast build tool
- **@dnd-kit** - Drag-and-drop utilities
- **TailwindCSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Zod** - Schema validation
- **React Router** - Client-side routing

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/silogos/Antree.git
cd Antree
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/antree
PORT=3001
```

**Important:** The `.env` file is gitignored for security. Never commit credentials to version control.

4. **Run database migrations**

```bash
pnpm db:generate
pnpm db:push
```

5. **Seed the database (optional)**

```bash
pnpm db:seed
```

## Usage

### Development

Run both backend and frontend in parallel:

```bash
pnpm dev
```

Run only backend:

```bash
pnpm dev:be
```

Run only frontend:

```bash
pnpm dev:fe
```

### Production Build

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

### Database Management

Generate migrations:

```bash
pnpm db:generate
```

Run migrations:

```bash
pnpm db:migrate
```

Push schema changes:

```bash
pnpm db:push
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

### Testing

Run backend tests:

```bash
cd be
pnpm test              # Run all tests
pnpm test:ui           # Run tests with UI
pnpm test:coverage     # Generate coverage report
```

**Note:** The backend has 328 tests with good coverage. Frontend tests are yet to be implemented (see [docs/TECH-DEBT.md](docs/TECH-DEBT.md)).

### Simulation Scripts (Backend)

For testing SSE functionality:

```bash
cd be
pnpm simulate              # Simulate banking queue workflow
pnpm simulate-http         # Simulate via HTTP endpoints
pnpm simulate-simple       # Simple queue simulation
```

These scripts simulate realistic queue workflows and are useful for testing SSE real-time updates.

## API Endpoints

### Health
- `GET /` - Health check

### Queues
- `GET /queues` - Get all queues
- `GET /queues/:id` - Get single queue with active session count
- `POST /queues` - Create queue (requires templateId)
- `PUT /queues/:id` - Update queue
- `DELETE /queues/:id` - Delete queue

### Sessions
- `GET /queues/:queueId/sessions` - Get all sessions for a queue
- `POST /queues/:queueId/sessions` - Create new session (clones template statuses)
- `GET /sessions/:id` - Get single session details
- `PATCH /sessions/:id` - Update session (pause/resume/complete)
- `DELETE /sessions/:id` - Soft delete session

### Session Statuses
- `GET /sessions/:sessionId/statuses` - Get all statuses for a session
- `POST /sessions/:sessionId/statuses` - Create custom status for session
- `PATCH /sessions/:sessionId/statuses/:statusId` - Update session status
- `DELETE /sessions/:sessionId/statuses/:statusId` - Delete session status

### Queue Items
- `GET /items` - Get all queue items (filterable)
- `GET /sessions/:sessionId/items` - Get all items in a session
- `POST /sessions/:sessionId/items` - Create queue item
- `PATCH /items/:itemId` - Update queue item details
- `PATCH /items/:itemId/status` - Update queue item status
- `DELETE /items/:itemId` - Delete queue item

### Templates
- `GET /templates` - Get all templates
- `GET /templates/:id` - Get single template with statuses
- `POST /templates` - Create template with statuses
- `PUT /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Real-Time (SSE)
- `GET /sse/sessions/:sessionId/stream` - SSE stream for all session events
- `GET /sse/items/:itemId/stream` - SSE stream for specific item events

For complete API documentation, see [docs/queue-session-openapi.yaml](docs/queue-session-openapi.yaml)

## Project Structure

```
Antree/
├── be/                      # Backend (Hono + Drizzle)
│   ├── src/
│   │   ├── db/             # Database schema & connection
│   │   │   ├── schema.ts   # Drizzle ORM schema definitions
│   │   │   └── index.ts    # Database connection
│   │   ├── routes/         # API route handlers
│   │   │   ├── queues.ts   # Queue CRUD endpoints
│   │   │   ├── sessions.ts # Session lifecycle endpoints
│   │   │   ├── items.ts    # Queue item endpoints
│   │   │   └── templates.ts # Template management
│   │   ├── services/       # Business logic layer
│   │   │   └── session.service.ts
│   │   ├── sse/            # Server-Sent Events
│   │   │   ├── broadcaster.ts # SSE connection manager
│   │   │   └── index.ts    # SSE route handlers
│   │   ├── middleware/     # Request/response middleware
│   │   ├── validators/     # Zod validation schemas
│   │   └── index.ts        # Main server entry point
│   └── package.json
├── fe/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── KanbanBoard.tsx  # Main drag-and-drop board
│   │   │   ├── QueueCard.tsx    # Individual queue item
│   │   │   ├── StatusColumn.tsx # Column with drag-and-drop
│   │   │   ├── SessionDetail.tsx # Session view
│   │   │   └── ErrorBoundary.tsx # Error handling
│   │   ├── hooks/
│   │   │   └── useSessionSSE.ts  # SSE event subscription
│   │   ├── services/
│   │   │   ├── sseClient.ts      # SSE client implementation
│   │   │   └── http.ts           # HTTP client with retry logic
│   │   ├── lib/
│   │   │   └── errors.ts         # Error message mapping
│   │   └── main.tsx
│   └── package.json
├── docs/                     # Documentation
│   ├── queue-session-openapi.yaml  # OpenAPI specification
│   └── TECH-DEBT.md               # Technical debt tracker
├── package.json
├── pnpm-workspace.yaml
└── CLAUDE.md                 # Claude Code development guide
```

## Architecture

Antree uses a **session-based architecture** with a four-level hierarchy:

1. **Template** (`queue_templates`) - Reusable status definitions for queue types
2. **Queue** (`queues`) - Permanent dashboards that reference a template
3. **Session** (`queue_sessions`) - Operational runtime periods (e.g., "Morning Shift", "Batch #12")
4. **Queue Item** (`queue_items`) - Individual items within a session

### Key Design Decisions

- Queue numbering resets per session (each session starts from A-1, B-1, etc.)
- Queue items are immutable to their session (cannot move between sessions)
- Sessions use soft delete (`deletedAt` column)
- Template statuses are cloned into sessions when created
- Multiple sessions can be active simultaneously for a single queue

### Server-Sent Events (SSE)

The SSE system provides real-time updates for:

- Session lifecycle (created, updated, paused, resumed, completed)
- Session status changes
- Queue item CRUD operations
- Queue changes
- Template updates

**Features:**
- Event ID tracking for reconnection
- Event history replay (1000 events per session)
- Rate limiting (100 messages/60 seconds per client)
- Graceful shutdown handling

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Queue List   │  │ Session View │  │   Kanban Board           │  │
│  │              │  │              │  │   (Drag & Drop)          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────────┘  │
│         │                  │                  │                      │
│         └──────────────────┴──────────────────┘                      │
│                            │                                         │
│                    ┌───────▼────────┐                               │
│                    │  SSE Client    │◄──────┐                       │
│                    │  (reconnect)   │       │                       │
│                    └───────┬────────┘       │                       │
└────────────────────────────┼────────────────┼───────────────────────┘
                             │                │
                             │ HTTP           │ SSE (real-time)
                             ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            Backend (Hono)                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    API Routes                                │   │
│  │  /queues  /sessions  /items  /templates                     │   │
│  └────┬──────────────────────────────────────────────┬─────────┘   │
│       │                                             │              │
│       ▼                                             ▼              │
│  ┌─────────────────┐                    ┌───────────────────┐     │
│  │   Services      │                    │  SSE Broadcaster  │     │
│  │                 │                    │                   │     │
│  │ • session.svc   │                    │ • Event history   │     │
│  │ • validation    │                    │ • Rate limiting    │     │
│  └────────┬────────┘                    │ • Connection mgmt  │     │
│           │                             └───────────────────┘     │
│           ▼                                                       │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                  Drizzle ORM                               │   │
│  └───────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                          │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Templates   │──│   Queues     │──│    Sessions            │   │
│  │              │  │              │  │                         │   │
│  │ • statuses   │  │ • templateId │  │ • session statuses     │   │
│  └──────────────┘  └──────────────┘  │ • queue items          │   │
│                                       └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Example

```
User drags item to new status:
  1. Frontend: PATCH /items/:itemId/status
  2. Backend: Validates → Updates DB → Broadcasts SSE event
  3. SSE: Sends "queue_item_status_changed" to all subscribers
  4. Frontend: All connected clients update UI instantly
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

Made with ❤️ by [silogos](https://github.com/silogos)
