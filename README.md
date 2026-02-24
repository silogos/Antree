# Antree

A real-time queue management system for service businesses. Built with a **session-based architecture** that allows you to manage operational periods (morning shift, afternoon batch, etc.) with drag-and-drop status tracking and live updates via SSE.

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

## Quick Start

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

Create a `.env` file in the `be/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/antree
PORT=3001
```

4. **Run database migrations**

```bash
pnpm db:push
```

5. **Start the application**

```bash
# Run both backend and frontend
pnpm dev

# Backend only
pnpm dev:be

# Frontend only
pnpm dev:fe
```

The backend will be available at `http://localhost:3001` and the frontend at `http://localhost:5173`.

## Usage

```bash
pnpm dev              # Start both backend and frontend
pnpm dev:be           # Backend only (port 3001)
pnpm dev:fe           # Frontend only (port 5173)
pnpm build            # Build both
pnpm start            # Start production backend
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open Drizzle Studio
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
│  └────────┬────────┘                    └───────────────────┘     │
│           │                                                       │
│           ▼                                                       │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                  Drizzle ORM                               │   │
│  └───────────────────────┬───────────────────────────────────┘   │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PostgreSQL Database                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Templates   │──│   Queues     │──│    Sessions            │   │
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

## Documentation

- **[Backend Documentation](be/README.md)** - API endpoints, testing, database operations
- **[CLAUDE.md](CLAUDE.md)** - Development guide for Claude Code
- **[OpenAPI Spec](docs/queue-session-openapi.yaml)** - Complete API documentation

## Project Structure

```
antree-app/
├── be/                 # Backend (Hono + Drizzle)
├── fe/                 # Frontend (React + Vite)
├── docs/               # Documentation
├── package.json        # Workspace scripts
├── pnpm-workspace.yaml # Monorepo config
└── docker-compose.yml  # Docker orchestration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

Made with ❤️ by [silogos](https://github.com/silogos)
