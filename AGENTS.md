# PROJECT KNOWLEDGE BASE

**Generated:** Sun Feb 15 2026
**Commit:** 4372946
**Branch:** main

## OVERVIEW
Real-time queue management system (monorepo) with Hono backend + React/Vite frontend using SSE for live updates.

## STRUCTURE
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

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Backend entry | be/src/index.ts | Hono app with CORS + logger |
| Frontend entry | fe/src/main.tsx | React mount point |
| DB schema | be/src/db/schema.ts | Drizzle ORM schema definitions |
| API routes | be/src/routes/*.ts | boards, statuses, queues, health |
| SSE setup | be/src/sse/ | Server-Sent Events broadcaster |
| Components | fe/src/components/ | Kanban board, modals, UI components |
| API services | fe/src/services/ | Backend API calls |
| Hooks | fe/src/hooks/ | React hooks for state/SSE |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| app | Hono | be/src/index.ts | Main backend app |
| sseBroadcaster | Class | be/src/sse/broadcaster.ts | SSE broadcast system |
| queueBoards | pgTable | be/src/db/schema.ts | Queue boards table |
| queueItems | pgTable | be/src/db/schema.ts | Queue items table |
| KanbanBoard | Component | fe/src/components/KanbanBoard.tsx | Main queue UI |

## CONVENTIONS
- **Package naming**: Scoped packages `@antree/backend`, `@antree/frontend`
- **Workspace filters**: Use `pnpm --filter @antree/{backend|frontend} <script>`
- **Backend**: ES modules (.js extension in imports)
- **Frontend**: TypeScript + React with Radix UI components
- **SSE**: Broadcast on queue/board changes (queue_created, queue_updated, queue_deleted, board_updated, board_deleted)

## ANTI-PATTERNS (THIS PROJECT)
- **No imports without .js extension** in backend (ES modules required)
- **No direct DB access from frontend** - use API services only
- **No hardcoded API URLs** - use environment variables

## COMMANDS
```bash
pnpm dev              # Run both backend (port 3001) and frontend
pnpm dev:be           # Backend only
pnpm dev:fe           # Frontend only
pnpm build            # Build both
pnpm start            # Start production backend
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema to DB
pnpm db:studio        # Open Drizzle Studio
```

## ENVIRONMENT VARIABLES

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

## DEPLOYMENT

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

### Production Build
```bash
# Build both packages
pnpm build

# Start backend only (frontend served by nginx)
cd be && node --env-file=.env dist/index.js
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

## NOTES
- Backend uses `tsx watch` for dev, `node --env-file` for production
- Frontend uses Vite dev server, nginx for production
- Docker config for both packages in respective Dockerfiles
- No test suite currently configured
- SSE endpoint: `/sse` for real-time updates
