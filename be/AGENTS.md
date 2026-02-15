# BACKEND PACKAGE

**Parent:** ../AGENTS.md

## OVERVIEW
Hono + Drizzle ORM + PostgreSQL backend for Antree queue system.

## STRUCTURE
```
be/
├── src/
│   ├── index.ts          # Hono app entry, CORS + logger middleware
│   ├── db/              # Database schema, connection, migrations
│   ├── routes/          # API endpoints (boards, statuses, queues, health)
│   ├── sse/             # Server-Sent Events broadcaster
│   ├── seed.ts          # Database seeding
│   └── seed-queue-items.ts
├── dist/                # Compiled JavaScript output
├── drizzle.config.ts    # Drizzle ORM configuration
├── Dockerfile           # Container configuration
└── package.json         # @antree/backend
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| DB schema | src/db/schema.ts | Table definitions (users, queueBoards, queueStatuses, queueItems) |
| DB connection | src/db/index.ts | PostgreSQL connection via `postgres` package |
| Route registration | src/index.ts | All routes mounted here |
| SSE events | src/sse/broadcaster.ts | Broadcast queue/board changes |

## CONVENTIONS
- **ES Modules**: All imports must use `.js` extension
- **Hono**: Async route handlers, use `c.json()` for responses
- **Drizzle**: Use `getDb()` to get DB instance, relations defined in schema.ts

## ANTI-PATTERNS
- **No CommonJS** imports - must use ES modules with .js extension
- **No direct SQL queries** - use Drizzle ORM
- **No missing .js extensions** - ES modules requirement

## COMMANDS
```bash
pnpm dev              # tsx watch --env-file=.env src/index.ts
pnpm build            # tsc
pnpm start            # node --env-file=.env dist/index.js
pnpm db:push          # Push schema to PostgreSQL
pnpm db:studio        # Open Drizzle Studio UI
```
