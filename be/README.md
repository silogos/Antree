# Antree Backend

Real-time queue management system backend built with Hono, Drizzle ORM, and PostgreSQL.

## Features

- ⚡ **Fast & Lightweight** - Built on Hono framework
- 🔄 **Real-Time Updates** - Server-Sent Events (SSE) for live updates
- 📊 **Session-Based Architecture** - Manage operational periods independently
- ✅ **Type-Safe** - Full TypeScript with Drizzle ORM
- 🧪 **Well-Tested** - 328 tests with good coverage

## Development

```bash
# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Database Management

```bash
# Generate migrations from schema changes
pnpm db:generate

# Push schema directly to database (development)
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed database with sample data
pnpm db:seed
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage
```

## Simulation Scripts

For testing SSE functionality:

```bash
# Simulate banking queue workflow
pnpm simulate

# Simulate via HTTP endpoints
pnpm simulate-http

# Simple queue simulation
pnpm simulate-simple
```

## Project Structure

**Feature-Based Organization:**

```
src/
├── db/                    # Database layer
│   ├── schema.ts          # Drizzle schema definitions
│   └── index.ts           # Database connection
├── features/              # Feature modules (grouped by domain)
│   ├── health/            # Health check routes
│   ├── items/             # Queue items feature
│   ├── queues/            # Queue management feature
│   ├── sessions/          # Session lifecycle feature
│   ├── statuses/          # Status management feature
│   └── templates/         # Template management feature
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
│   ├── broadcaster.ts     # SSE connection manager
│   └── index.ts           # SSE route handlers
├── types/                 # Shared TypeScript types
│   └── session.dto.ts
└── index.ts              # Main server entry point
```

## API Endpoints

### Health
- `GET /` - Health check

### Queues
- `GET /queues` - Get all queues
- `GET /queues/:id` - Get single queue
- `POST /queues` - Create queue
- `PATCH /queues/:id` - Update queue
- `DELETE /queues/:id` - Delete queue

### Sessions
- `GET /queues/:queueId/sessions` - Get all sessions for a queue
- `POST /queues/:queueId/sessions` - Create new session
- `GET /sessions/:id` - Get single session
- `PATCH /sessions/:id` - Update session (pause/resume/complete)
- `DELETE /sessions/:id` - Soft delete session

### Session Statuses
- `GET /sessions/:sessionId/statuses` - Get all statuses for a session
- `POST /sessions/:sessionId/statuses` - Create custom status
- `PATCH /sessions/:sessionId/statuses/:statusId` - Update status
- `DELETE /sessions/:sessionId/statuses/:statusId` - Delete status

### Queue Items
- `GET /items` - Get all queue items
- `GET /sessions/:sessionId/items` - Get items in a session
- `POST /sessions/:sessionId/items` - Create queue item
- `PATCH /items/:itemId` - Update queue item
- `PATCH /items/:itemId/status` - Update item status
- `DELETE /items/:itemId` - Delete queue item

### Templates
- `GET /templates` - Get all templates
- `GET /templates/:id` - Get single template
- `POST /templates` - Create template
- `PATCH /templates/:id` - Update template
- `DELETE /templates/:id` - Delete template

### Real-Time (SSE)
- `GET /sse/sessions/:sessionId/stream` - SSE stream for session events
- `GET /sse/items/:itemId/stream` - SSE stream for item events

## Environment Variables

Create a `.env` file in the `be/` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/antree
PORT=3001
NODE_ENV=development
```

## Conventions

### File Naming
- **Routes**: Use `.route.ts` suffix (e.g., `queues.route.ts`)
- **Services**: Use `.service.ts` suffix (e.g., `queue.service.ts`)
- **Validators**: Use `.validator.ts` suffix (e.g., `queue.validator.ts`)
- **Middleware**: Use `.middleware.ts` suffix (e.g., `error.middleware.ts`)

### Import Patterns
```typescript
// Within same feature
import { queueService } from "./queue.service.js";

// Cross-feature
import { sessionService } from "../sessions/session.service.js";

// Shared utilities
import { successResponse } from "../../middleware/response.middleware.js";
```

## License

MIT
