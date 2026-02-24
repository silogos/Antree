# Technical Debt & Improvement Tracker

> **Last Updated:** 2026-02-24
> **Status:** Active tracking document

## 🔴 Critical Issues (Fix Immediately)

### 1. Hard-coded Database Credentials
**Status:** ✅ Completed
**Priority:** P0 - Critical
**Effort:** 5 minutes
**Location:** [be/src/db/index.ts:4](be/src/db/index.ts#L4)

**Issue:** Database credentials are embedded directly in source code, creating a severe security vulnerability.

**Risk:**
- Credentials exposed in version control
- Unable to rotate credentials without code deployment
- Compliance violations (GDPR, SOC2, etc.)

**Action Items:**
- [x] Move credentials to environment variables
- [x] Verify `.env` file is in `.gitignore`
- [x] Rotate database credentials if committed to git history
- [x] Add environment variable validation on startup
- [ ] Document required environment variables in README

**Resources:**
- [Hono Environment Variables](https://hono.dev/docs/helpers/binding#env)
- Consider using `dotenv` or `zod-env` for validation

---

### 2. Missing Authentication & Authorization System
**Status:** 🔴 Open
**Priority:** P0 - Critical
**Effort:** 8-16 hours
**Location:** System-wide

**Issue:** No authentication or authorization mechanism exists in the application.

**Risk:**
- Anyone can access, modify, or delete queues/sessions/items
- No audit trail of user actions
- Cannot implement user-specific permissions
- Data privacy concerns

**Action Items:**
- [ ] Choose authentication strategy:
  - JWT tokens (stateless, scalable)
  - Session-based (simpler, server-state)
- [ ] Implement user registration/login endpoints
- [ ] Add authentication middleware for protected routes
- [ ] Implement role-based access control (RBAC):
  - Admin (full access)
  - Manager (queue/session management)
  - Viewer (read-only)
- [ ] Add password hashing (bcrypt/argon2)
- [ ] Implement token refresh mechanism
- [ ] Add password reset flow

**Tech Stack Options:**
- Backend: `@hono/jwt` or `hono-auth`
- Frontend: React Context or Zustand for auth state

---

## 🟡 High Priority Improvements

### 3. Frontend Testing Gap
**Status:** 🟡 Open
**Priority:** P1 - High
**Effort:** 8-12 hours
**Location:** [fe/src/](fe/src/)

**Issue:** Backend has 328 tests, but frontend has zero test coverage.

**Risk:**
- Regressions in UI changes
- Unclear component behavior
- Difficult to refactor safely
- Bugs caught by users instead of tests

**Action Items:**
- [ ] Set up testing framework:
  - [ ] Install Vitest for React testing
  - [ ] Install React Testing Library
  - [ ] Install jsdom for DOM simulation
- [ ] Write tests for critical components:
  - [ ] `KanbanBoard.tsx` - Drag-and-drop functionality
  - [ ] `SessionDetail.tsx` - Session management
  - [ ] `useSessionSSE.ts` - SSE connection lifecycle
- [ ] Test coverage goal: 70% minimum
- [ ] Set up test scripts in `package.json`
- [ ] Add test requirements to PR checklist

**Key Files to Test:**
```
fe/src/components/KanbanBoard.tsx
fe/src/components/SessionDetail.tsx
fe/src/hooks/useSessionSSE.ts
fe/src/services/sseClient.ts
```

---

### 4. Legacy Code Cleanup
**Status:** ✅ Completed
**Priority:** P1 - High
**Effort:** 4-6 hours
**Location:** Multiple files

**Issue:** Git status shows recent migration from "batch" to "session" architecture with deprecated code remaining.

**Risk:**
- Developer confusion (old vs new terminology)
- Maintenance burden (unused code)
- Potential bugs from calling deprecated endpoints
- Documentation inconsistencies

**Action Items:**
- [x] Audit codebase for "batch" references:
  ```bash
  grep -r "batch" be/src/ fe/src/ --include="*.ts" --include="*.tsx"
  ```
- [x] Remove deprecated service files:
  - [x] `be/src/services/batch.service.ts` (deleted in git but verify removal)
  - [x] `be/src/validators/batch.validator.ts`
  - [x] `be/src/services/board.service.ts`
  - [x] `be/src/validators/board.validator.ts`
  - [x] `fe/src/hooks/useBatches.ts`
  - [x] `fe/src/hooks/useBatchSSE.ts`
  - [x] `fe/src/hooks/useBoards.ts`
  - [x] `fe/src/components/QueueBoard.tsx`
- [x] Update type definitions (remove `QueueBatch`, `QueueBoard`, `CreateBatchInput`, etc.)
- [x] Rename `fe/src/services/board.service.ts` to `api.ts` for clarity
- [x] Update all imports from `board.service` to `api`
- [x] Update CLAUDE.md to document legacy event types
- [x] Verify OpenAPI spec matches current implementation
- [ ] Add migration guide for any external consumers

**Verification:**
- [x] All references to "board" → "queue"
- [x] All references to "batch" → "session"
- [x] Removed unused dead code files

---

### 5. API Security Enhancements
**Status:** 🟡 Open
**Priority:** P1 - High
**Effort:** 4-6 hours
**Location:** [be/src/index.ts](be/src/index.ts), [be/src/middleware/](be/src/middleware/)

**Issue:** Limited API security measures beyond SSE rate limiting.

**Risk:**
- DoS attacks on HTTP endpoints
- Unauthorized cross-origin requests
- Missing security headers
- No request throttling per user

**Action Items:**
- [ ] Implement rate limiting middleware:
  - [ ] Install `@hono/rate-limiter` or build custom
  - [ ] Configure limits: 100 req/15min per IP
  - [ ] Separate limits for authenticated vs anonymous
- [ ] Configure CORS properly:
  - [ ] Whitelist production domains
  - [ ] Remove localhost-only restriction for production
  - [ ] Configure allowed headers/methods
- [ ] Add security headers (Helmet-like middleware):
  ```typescript
  // Add these headers:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: max-age=31536000
  - Content-Security-Policy
  ```
- [ ] Add request size limits (prevent large payloads)
- [ ] Implement API key system for external integrations

---

## 🟢 Medium Priority Enhancements

### 6. Performance Optimization
**Status:** 🟢 Open
**Priority:** P2 - Medium
**Effort:** 12-16 hours
**Location:** Multiple files

**Issue:** No visible optimization strategies for scale.

**Risk:**
- Slow page loads with large datasets
- Expensive database queries
- Unnecessary re-renders in React
- SSE memory growth over time

**Action Items:**

**Backend:**
- [ ] Add pagination to list endpoints:
  - [ ] `GET /queues` - Query params: `page`, `limit`, `sort`
  - [ ] `GET /queues/:id/sessions` - Paginate sessions
  - [ ] `GET /sessions/:id/items` - Paginate items (critical!)
  - [ ] Return `total`, `page`, `limit`, `hasMore` metadata
- [ ] Implement caching layer:
  - [ ] Redis for session data (frequently accessed)
  - [ ] In-memory cache for templates (rarely change)
  - [ ] Cache invalidation on mutations
- [ ] Add database query optimization:
  - [ ] Review N+1 queries (Drizzle debug mode)
  - [ ] Add composite indexes on common queries
  - [ ] Use `EXPLAIN ANALYZE` on slow queries

**Frontend:**
- [ ] Implement React.memo for expensive components:
  - [ ] `QueueCard.tsx` - Prevent re-render on unrelated changes
  - [ ] `StatusColumn.tsx` - Optimize drag-and-drop updates
- [ ] Virtualization for long lists:
  - [ ] Install `@tanstack/react-virtual` or `react-virtual`
  - [ ] Apply to item lists (100+ items)
- [ ] Code splitting:
  - [ ] Lazy load modals (`SessionModal`, `StatusManagerModal`)
  - [ ] Route-based splitting with React Router
- [ ] Bundle analysis:
  - [ ] Run `pnpm build:fe --report`
  - [ ] Identify large dependencies
  - [ ] Consider tree-shaking or alternatives

**SSE:**
- [ ] Monitor memory usage of event history (1000 events per session)
- [ ] Consider event compression for large payloads
- [ ] Add connection pooling limits

---

### 7. Error Handling & Resilience
**Status:** 🟢 Open
**Priority:** P2 - Medium
**Effort:** 6-8 hours
**Location:** Frontend and Backend

**Issue:** Limited error recovery mechanisms and poor error UX.

**Risk:**
- Users see cryptic error messages
- No recovery from transient failures
- Difficult to debug production issues
- Poor user experience during errors

**Action Items:**

**Backend:**
- [ ] Standardize error response format:
  ```typescript
  {
    success: false,
    error: "ErrorCode",
    message: "User-friendly message",
    details: {...}, // Optional debugging info
    requestId: "uuid" // For support
  }
  ```
- [ ] Create error handler middleware
- [ ] Add error logging (structured JSON)
- [ ] Implement circuit breaker for external services

**Frontend:**
- [ ] Add React Error Boundaries:
  ```typescript
  // src/components/ErrorBoundary.tsx
  - Catch component errors
  - Show fallback UI
  - Provide retry mechanism
  ```
- [ ] Implement retry logic with exponential backoff:
  - [ ] Failed API requests (3 retries)
  - [ ] SSE reconnection (infinite retries with backoff)
- [ ] User-friendly error messages:
  - [ ] Create error message mapping
  - [ ] Add "Contact Support" with requestId
  - [ ] Use toast notifications (sonner already installed)
- [ ] Add error tracking:
  - [ ] Install Sentry or similar
  - [ ] Track error rates
  - [ ] Set up alerts

---

### 8. Documentation Improvements
**Status:** 🟢 Open
**Priority:** P2 - Medium
**Effort:** 4-6 hours
**Location:** [README.md](README.md), [docs/](docs/)

**Issue:** Documentation inconsistencies and missing component docs.

**Risk:**
- New developer onboarding friction
- Incorrect API usage
- Unclear component behavior
- Outdated setup instructions

**Action Items:**
- [ ] Update README.md:
  - [ ] Remove "board" terminology references
  - [ ] Update API endpoint examples
  - [ ] Add current architecture diagram
  - [ ] Update setup instructions for current stack
- [ ] Create component documentation:
  - [ ] Install Storybook for React components
  - [ ] Document props for each component
  - [ ] Add usage examples
  - [ ] Document SSE reconnection strategy
- [ ] Update OpenAPI spec:
  - [ ] Verify all endpoints match implementation
  - [ ] Add request/response examples
  - [ ] Document error responses
- [ ] Create architecture decision records (ADRs):
  - [ ] Why SSE over WebSockets?
  - [ ] Session-based architecture rationale
  - [ ] Template inheritance design

---

## 🔵 Nice to Have

### 9. Monitoring & Observability
**Status:** 🔵 Open
**Priority:** P3 - Low
**Effort:** 8-12 hours
**Location:** System-wide

**Issue:** No visibility into system health and performance in production.

**Risk:**
- Difficult to diagnose production issues
- No alerting for degraded performance
- Limited understanding of usage patterns
- No SLA monitoring

**Action Items:**
- [ ] Add structured logging:
  ```typescript
  // Use pino or similar
  logger.info({
    action: "queue_item_created",
    sessionId: session.id,
    userId: user.id,
    duration: 123
  })
  ```
- [ ] Implement health checks:
  ```typescript
  GET /health
  {
    status: "healthy",
    database: "connected",
    sse_connections: 42,
    uptime: 123456
  }
  ```
- [ ] Add metrics collection:
  - [ ] Request duration (p50, p95, p99)
  - [ ] SSE connection count
  - [ ] Database query performance
  - [ ] Error rate by endpoint
- [ ] Set up dashboards:
  - [ ] Grafana + Prometheus
  - [ ] Or use managed service (Datadog, New Relic)
- [ ] Configure alerts:
  - [ ] Error rate > 1%
  - [ ] Response time > 500ms
  - [ ] SSE connections > 1000
  - [ ] Database disconnected

---

### 10. Developer Experience Enhancements
**Status:** 🔵 Open
**Priority:** P3 - Low
**Effort:** 6-8 hours
**Location:** Tooling and workflows

**Issue:** Could improve developer productivity and code quality automation.

**Risk:**
- Inconsistent code style
- Bugs caught in code review instead of CI
- Manual testing burden
- Slow feedback loops

**Action Items:**
- [ ] Pre-commit hooks:
  ```json
  {
    "husky": {
      "hooks": {
        "pre-commit": "lint-staged",
        "pre-push": "pnpm test"
      }
    },
    "lint-staged": {
      "*.{ts,tsx}": ["biome check --fix", "biome format --write"]
    }
  }
  ```
- [ ] Automate database migrations:
  - [ ] Run migrations in CI pipeline
  - [ ] Validate schema before deploy
  - [ ] Rollback mechanism
- [ ] Add E2E tests:
  - [ ] Install Playwright
  - [ ] Test critical user flows:
    - [ ] Create queue → Create session → Add items → Update status
    - [ ] SSE reconnection
  - [ ] Run in CI on PRs
- [ ] Improve local development:
  - [ ] Docker Compose for dependencies (PostgreSQL)
  - [ ] Hot reload for all file types
  - [ ] Seed data script with realistic scenarios
- [ ] Add code coverage reporting:
  - [ ] Enforce minimum coverage in CI
  - [ ] Generate coverage badges
- [ ] Set up dependency scanning:
  - [ ] GitHub Dependabot or Renovate
  - [ ] Automated PRs for security updates

---

## ✅ What We're Doing Well (Keep Doing!)

- ✅ **Excellent SSE implementation** with reconnection, rate limiting, and event history
- ✅ **Clean architecture** with proper separation (routes → services → db)
- ✅ **Strong TypeScript** usage throughout
- ✅ **Good backend test coverage** (328 tests)
- ✅ **Well-documented** with CLAUDE.md and OpenAPI spec
- ✅ **Modern tech stack** (Hono, Drizzle, React 18, Vite)
- ✅ **Monorepo structure** with pnpm workspaces

---

## 📊 Summary Statistics

| Category | Count |
|----------|-------|
| Critical Issues | 1 (2 total, 2 completed) |
| High Priority | 2 (3 total, 1 completed) |
| Medium Priority | 3 |
| Nice to Have | 2 |
| **Total Items** | **10** |
| **Completed** | **2** |
| **Remaining Effort** | **~75-115 hours** |

---

## 🎯 Suggested Execution Order

### Phase 1: Security (Week 1)
1. ~~Hard-coded credentials (30 min)~~ ✅ COMPLETED
2. Authentication system (8-16 hours)
3. API security enhancements (4-6 hours)

### Phase 2: Testing (Week 2)
4. Frontend testing setup and critical tests (8-12 hours)
5. Error handling improvements (6-8 hours)

### Phase 3: Cleanup (Week 3)
6. ~~Legacy code cleanup (4-6 hours)~~ ✅ COMPLETED
7. Documentation updates (4-6 hours)

### Phase 4: Performance (Week 4)
8. Performance optimization (12-16 hours)

### Phase 5: Polish (Ongoing)
9. Monitoring & observability (8-12 hours)
10. Developer experience (6-8 hours)

---

## 📝 Notes

- Each item should be converted to a GitHub issue for tracking
- Assign owners and due dates before starting
- Update this document as items are completed
- Review quarterly for new debt
- Consider "debt sprint" to tackle multiple items

---

**Last Reviewed By:** Claude Code Analysis
**Last Updated:** 2026-02-24
**Next Review Date:** 2026-05-24 (quarterly)
