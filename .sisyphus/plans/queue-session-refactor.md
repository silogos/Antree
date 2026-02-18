# Queue System Refactor: Batch-Based to Session-Based Architecture

## TL;DR

> **Quick Summary**: Refactor backend database schema and API routes from batch-based to session-based queue architecture with soft delete, session numbering, and lifecycle states.
>
> **Deliverables**:
> - Renamed database tables: `queueBatches` → `queue_sessions`, `queueStatuses` → `queue_session_statuses`
> - Modified schema: Added `session_number`, `started_at`, `ended_at`, `deleted_at`, lifecycle status
> - Renamed API routes: `/batches` → `/sessions`
> - New routes: `POST /sessions/:sessionId/items`, `PATCH /sessions/:id/lifecycle`, `GET /items/:id`, `PATCH /items/:id/status`
> - Renamed SSE events: `batch_*` → `session_*`, added lifecycle events
> - SQL schema and migration files
> - ERD diagram
> - OpenAPI spec
> - SSE channel mapping document
> - Backend DTO types (frontend excluded)
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 6 waves
> **Critical Path**: Commit → Schema → Routes → Services → SSE → Documentation

---

## Context

### Original Request
Refactor the backend (be/) to implement a session-based queue architecture as specified in `docs/queue_system_refactor_prompt_v_2.md`. The system transforms from a simple queue model to a session-based architecture where queues are permanent dashboards and sessions represent runtime periods.

### Interview Summary
**Key Discussions**:
- **Data migration**: Start fresh - commit existing system, then drop/recreate tables (no data preservation)
- **Scope**: Backend only (be/), frontend (fe/) excluded
- **Testing**: No automated tests, use Agent-Executed QA scenarios only
- **Session numbering**: Auto-increment per queue (1, 2, 3...)
- **Queue numbering**: Auto-increment simple integers within each session
- **Lifecycle states**: draft, active, closed (3 simple states)
- **Soft delete**: Timestamp-based (`deleted_at` field)
- **Cascade behavior**: Soft-delete items when session is soft-deleted
- **Backward compatibility**: No - break changes, remove old `/batches` routes
- **API format**: snake_case (user's preference, not camelCase from doc - simplifies refactor)

**Research Findings**:
- Current schema has `queueBatches` table with basic fields
- Missing session-specific fields: `session_number`, `started_at`, `ended_at`, `deleted_at`, lifecycle status
- SSE broadcaster already supports flexible event types
- No test infrastructure exists in backend
- Routes use standard Hono patterns with Zod validation
- Services follow repository pattern with Drizzle ORM

### Metis Review
**Identified Gaps** (addressed):
- Session numbering logic → Auto-increment per queue, starting at 1
- Queue numbering format → Simple integers (1, 2, 3...)
- Lifecycle status values → draft, active, closed
- Soft delete type → Timestamp (`deleted_at`)
- Cascade behavior → Soft-delete items when session soft-deleted
- Refactor scope → Backend only, no frontend changes
- API response format → snake_case (user preference, no mapping layer needed)
- SSE payload format → snake_case (matching DB schema)

**Guardrails Applied**:
- NO new features beyond refactor (analytics, reporting, bulk operations)
- NO authentication/authorization changes
- NO frontend component updates
- Use existing Drizzle ORM patterns
- Keep API response format {success, data, message}
- Use docker-compose for database access
- Use pnpm for all package operations

---

## Work Objectives

### Core Objective
Transform the backend from batch-based queue system to session-based architecture with proper lifecycle management, soft delete, and clean API contract.

### Concrete Deliverables
1. Modified database schema (`be/src/db/schema.ts`)
2. Migration SQL script (`docs/queue-session-migration.sql`)
3. ERD diagram (`docs/queue-session-erd.png`)
4. OpenAPI specification (`docs/queue-session-openapi.yaml`)
5. SSE channel mapping document (`docs/sse-mapping.md`)
6. Backend DTO types (`be/src/types/session.dto.ts`)

### Definition of Done
- [ ] All database tables renamed and updated
- [ ] All API routes renamed and functional
- [ ] All services updated with session logic
- [ ] SSE events renamed and functional
- [ ] All deliverables created (SQL, ERD, OpenAPI, SSE mapping, DTOs)
- [ ] Database schema successfully deployed via Docker
- [ ] All QA scenarios pass

### Must Have
- Rename `queueBatches` → `queue_sessions` with new fields
- Rename `queueStatuses` → `queue_session_statuses`
- Add session lifecycle states (draft, active, closed)
- Implement soft delete with `deleted_at` timestamp
- Auto-increment session numbering per queue
- Auto-increment queue numbering per session
- Rename API routes `/batches` → `/sessions`
- Add new session lifecycle endpoint `PATCH /sessions/:id/lifecycle`
- Rename SSE events `batch_*` → `session_*`
- Add session lifecycle SSE events (paused, resumed, closed)
- Soft-delete items when session is soft-deleted
- Create all documentation deliverables

### Must NOT Have (Guardrails)
- NO mapping layer (user wants snake_case, matches DB)
- NO authentication/authorization changes
- NO frontend component updates
- NO new features beyond refactor (analytics, reporting, bulk operations)
- NO complex queue numbering algorithms (simple increment only)
- NO restore endpoint for soft-deleted sessions
- NO backward compatibility routes
- NO camelCase in API responses (use snake_case per user preference)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None (per user decision)
- **Framework**: None
- **Verification method**: Agent-Executed QA Scenarios only

### QA Policy
Every task MUST include agent-executed QA scenarios (see TODO template below).
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Database**: Use Bash (docker-compose exec) — Run SQL queries, verify schema, check indexes
- **API/Backend**: Use Bash (curl) — Send requests, assert status codes, validate response structure
- **SSE**: Use Bash (curl) — Connect to SSE stream, verify event types and payloads
- **Schema/Types**: Use Bash (tsc) — Compile TypeScript, verify no errors

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.
> Target: 5-8 tasks per wave.

```
Wave 1 (Foundation - Documentation & Planning):
├── Task 1: Commit existing system [quick]
├── Task 2: Create migration SQL script [quick]
├── Task 3: Create ERD diagram [quick]
└── Task 4: Create OpenAPI spec [quick]

Wave 2 (Database Schema):
├── Task 5: Update database schema (schema.ts) [unspecified-high]
├── Task 6: Generate Drizzle migration [quick]
└── Task 7: Apply migration to database via Docker [quick]

Wave 3 (Validators & Types):
├── Task 8: Rename/Update session validators [quick]
├── Task 9: Create backend DTO types [quick]
├── Task 10: Update TypeScript type exports [quick]
└── Task 11: Create SSE channel mapping doc [quick]

Wave 4 (Services - MAX PARALLEL):
├── Task 12: Rename/Update batch.service.ts → session.service.ts [unspecified-high]
├── Task 13: Update queue-item.service.ts for sessions [unspecified-high]
├── Task 14: Update queue.service.ts for sessions [unspecified-high]
├── Task 15: Update status.service.ts for session statuses [quick]
└── Task 16: Update template.service.ts (if needed) [quick]

Wave 5 (Routes - MAX PARALLEL):
├── Task 17: Rename/Update batches.ts → sessions.ts routes [unspecified-high]
├── Task 18: Update queue-items.ts routes for sessions [unspecified-high]
├── Task 19: Update statuses.ts routes for session statuses [quick]
└── Task 20: Update main index.ts route registration [quick]

Wave 6 (SSE & Integration):
├── Task 21: Update SSE broadcaster event types [unspecified-high]
├── Task 22: Update SSE index.ts endpoint paths [quick]
├── Task 23: Update all services to broadcast session events [unspecified-high]
└── Task 24: Verify end-to-end integration [deep]

Wave FINAL (Verification & Cleanup - 4 parallel):
├── Task F1: Database schema verification (oracle)
├── Task F2: API routes verification (unspecified-high)
├── Task F3: SSE events verification (unspecified-high)
└── Task F4: Documentation completeness check (deep)

Critical Path: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T12 → T17 → T21 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 4 (Wave 1), 3 (Wave 2), 4 (Wave 3), 5 (Wave 4), 4 (Wave 5), 4 (Wave 6), 4 (FINAL)
```

### Dependency Matrix

- **1-4**: — — 5-7, 2
- **5**: 2 — 6, 8, 9
- **6**: 5 — 7, 8, 9
- **7**: 6 — 12, 15, 16
- **8-11**: 7 — 12-16, 3
- **12**: 8, 9, 10 — 17, 23
- **13**: 8, 10 — 18, 23
- **14**: 8, 9, 10 — 17, 18, 23
- **15**: 8 — 19, 23
- **16**: 8, 9 — 23
- **17**: 8, 12, 14 — 20, 23
- **18**: 8, 13 — 20, 23
- **19**: 8, 15 — 20, 23
- **20**: 17, 18, 19 — 21, 24
- **21**: 8, 9 — 22, 23
- **22**: 21 — 24
- **23**: 12, 13, 14, 15, 16, 17, 18, 19, 21 — 24
- **24**: 20, 22, 23 — F1-F4
- **F1-F4**: 24 — (independent)

### Agent Dispatch Summary

- **1**: **4** — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **2**: **3** — T5 → `unspecified-high`, T6 → `quick`, T7 → `quick`
- **3**: **4** — T8 → `quick`, T9 → `quick`, T10 → `quick`, T11 → `quick`
- **4**: **5** — T12 → `unspecified-high`, T13 → `unspecified-high`, T14 → `unspecified-high`, T15 → `quick`, T16 → `quick`
- **5**: **4** — T17 → `unspecified-high`, T18 → `unspecified-high`, T19 → `quick`, T20 → `quick`
- **6**: **4** — T21 → `unspecified-high`, T22 → `quick`, T23 → `unspecified-high`, T24 → `deep`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

> Implementation = ONE Task. Every task MUST have: Recommended Agent Profile + Parallelization info + QA Scenarios.
> **A task WITHOUT QA Scenarios is INCOMPLETE. No exceptions.**

- [x] 1. **Commit existing system before refactor**

  **What to do**:
  - Create a git commit to preserve current state before any destructive changes
  - Use meaningful commit message describing pre-refactor state
  - Verify commit was successful with `git log -1`

  **Must NOT do**:
  - Make any code changes before this commit
  - Skip this commit (critical for rollback capability)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple git operation, no complex logic
  - **Skills**: `git-master`
    - `git-master`: Git commit operations are critical for this task

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (must be first task)
  - **Blocks**: Tasks 2-24, F1-F4 (all subsequent tasks depend on baseline commit)
  - **Blocked By**: None (can start immediately)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `package.json` scripts - Existing git workflow patterns

  **API/Type References** (contracts to implement against):
  - N/A - Git operation, no contracts

  **Test References** (testing patterns to follow):
  - N/A - No tests for this task

  **External References** (libraries and frameworks):
  - Git documentation: `git commit --message` - Commit command with message
  - Git documentation: `git log -1` - Verify last commit

  **WHY Each Reference Matters** (explain the relevance):
  - Commit command syntax ensures correct git usage
  - Log verification confirms commit was created successfully

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] Git commit created: `git log -1 --oneline` shows new commit
  - [ ] Commit message includes "pre-refactor" or similar
  - [ ] Working directory clean: `git status` shows no uncommitted changes

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - commit existing system state
    Tool: Bash (git)
    Preconditions: Working directory has uncommitted or staged changes
    Steps:
      1. Run `git add .` to stage all changes
      2. Run `git commit -m "feat(refactor): pre-refactor baseline - batch-based system"`
      3. Run `git log -1 --oneline` to verify commit
    Expected Result: Commit exists with specified message
    Failure Indicators: Git error (nothing to commit, merge conflicts)
    Evidence: .sisyphus/evidence/task-1-commit-baseline.log

  Scenario: Edge case - verify clean state after commit
    Tool: Bash (git)
    Preconditions: Previous commit was successful
    Steps:
      1. Run `git status` to check working directory
    Expected Result: "nothing to commit, working tree clean" message
    Failure Indicators: Uncommitted changes remain, staged files
    Evidence: .sisyphus/evidence/task-1-clean-state.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-1-commit-baseline.log`: Git log output showing new commit
  - [ ] `task-1-clean-state.log`: Git status showing clean working directory

  **Commit**: NO (part of Wave 1 group commit)

- [x] 2. **Create migration SQL script**

  **What to do**:
  - Create SQL migration file at `docs/queue-session-migration.sql`
  - Include DROP statements for old tables (queue_batches, queue_statuses)
  - Include CREATE statements for new tables (queue_sessions, queue_session_statuses)
  - Include ALTER statements for queue_items (add session_id FK, rename batch_id)
  - Add indexes on session_number, deleted_at for performance
  - Add foreign key constraints with proper cascade behavior
  - Include comments explaining each change

  **Must NOT do**:
  - Create mapping layer (user wants snake_case, no transformation needed)
  - Modify existing tables beyond specified changes
  - Add any data migration (fresh start per user decision)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: SQL file creation following known schema patterns
  - **Skills**: None required
    - No specific skills needed for SQL file creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 3, 4)
  - **Blocks**: Task 7 (migration execution depends on SQL file)
  - **Blocked By**: None (can start after Task 1)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/db/schema.ts:60-85` - Existing queue_batches table definition (to understand structure)
  - `be/src/db/schema.ts:87-99` - Existing queue_statuses table definition
  - `be/src/db/schema.ts:101-114` - Existing queue_items table with batchId FK

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:105-148` - Target database schema specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - PostgreSQL ALTER TABLE syntax: https://www.postgresql.org/docs/current/sql-altertable.html
  - PostgreSQL CREATE TABLE syntax: https://www.postgresql.org/docs/current/sql-createtable.html
  - PostgreSQL CREATE INDEX syntax: https://www.postgresql.org/docs/current/sql-createindex.html

  **WHY Each Reference Matters** (explain the relevance):
  - Current schema definitions show existing table structures to be migrated
  - Refactor doc specifies exact new table structure and field requirements
  - PostgreSQL docs ensure correct SQL syntax for all operations

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] Migration file created: `docs/queue-session-migration.sql` exists
  - [ ] File contains DROP TABLE for queue_batches
  - [ ] File contains DROP TABLE for queue_statuses
  - [ ] File contains CREATE TABLE queue_sessions with all required fields
  - [ ] File contains CREATE TABLE queue_session_statuses
  - [ ] File contains ALTER TABLE queue_items to add session_id FK
  - [ ] File includes indexes on session_number, deleted_at
  - [ ] File is valid SQL: `docker-compose exec -T postgres psql -U antree_user -d antree_db -f docs/queue-session-migration.sql` parses without errors

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - migration SQL is syntactically valid
    Tool: Bash (docker-compose)
    Preconditions: Database is running via docker-compose
    Steps:
  1. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -f docs/queue-session-migration.sql`
    Expected Result: SQL executes without syntax errors
    Failure Indicators: SQL syntax error, permission denied, table not found
    Evidence: .sisyphus/evidence/task-7-migration-syntax.log

  Scenario: Edge case - verify all new fields exist in SQL
    Tool: Bash (grep)
    Preconditions: Migration SQL file exists
    Steps:
      1. Run `grep -c "queue_sessions" docs/queue-session-migration.sql`
      2. Run `grep "session_number" docs/queue-session-migration.sql`
      3. Run `grep "started_at" docs/queue-session-migration.sql`
      4. Run `grep "deleted_at" docs/queue-session-migration.sql`
      5. Run `grep "CREATE INDEX" docs/queue-session-migration.sql`
    Expected Result: Count > 0 for CREATE TABLE, all fields present, at least 1 CREATE INDEX
    Failure Indicators: Field or table missing, no indexes defined
    Evidence: .sisyphus/evidence/task-2-sql-content-check.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-2-migration-syntax.log`: psql execution output
  - [ ] `task-2-sql-content-check.log`: grep results showing required elements

  **Commit**: NO (part of Wave 1 group commit)

- [x] 3. **Create ERD diagram**

  **What to do**:
  - Create ERD diagram at `docs/queue-session-erd.png`
  - Include all tables: users, queue_templates, queue_template_statuses, queues, queue_sessions, queue_session_statuses, queue_items
  - Show all relationships with proper cardinality (1:1, 1:N, N:M)
  - Include foreign key relationships
  - Mark primary keys and foreign keys clearly
  - Show soft delete fields (deleted_at)
  - Include legend for symbols used
  - Save as PNG image file

  **Must NOT do**:
  - Include deprecated tables (queue_boards)
  - Create interactive ERD tools (static image only)
  - Include frontend components or API endpoints

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `artistry`
    - Reason: Visual diagram creation requires design and layout skills
  - **Skills**: None required
    - No specific skills needed for static image creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 4)
  - **Blocks**: Task F4 (documentation verification depends on this deliverable)
  - **Blocked By**: Task 1 (baseline commit, but can start independently)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/db/schema.ts:4-181` - Complete schema definitions for all tables
  - `be/src/db/schema.ts:116-180` - Relation definitions showing FK relationships

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:55-149` - Target database schema specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - ERD notation standards: Chen notation or Crow's foot notation
  - Mermaid ERD syntax (if using code-to-image): https://mermaid.js.org/syntax/entityRelationshipDiagram

  **WHY Each Reference Matters** (explain the relevance):
  - Schema.ts provides complete list of tables and relationships to visualize
  - Refactor doc specifies the target schema structure after refactor
  - ERD notation standards ensure consistent, readable diagram

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] ERD file created: `docs/queue-session-erd.png` exists
  - [ ] File is valid image: `file docs/queue-session-erd.png` shows "PNG image data"
  - [ ] All 7 tables included in diagram
  - [ ] All foreign key relationships shown
  - [ ] Primary keys and foreign keys marked
  - [ ] Soft delete fields (deleted_at) indicated

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - ERD file is a valid PNG image
    Tool: Bash (file)
    Preconditions: ERD diagram file exists
    Steps:
      1. Run `file docs/queue-session-erd.png`
    Expected Result: Output contains "PNG image data"
    Failure Indicators: "empty", "ASCII text", "corrupt data"
    Evidence: .sisyphus/evidence/task-3-erd-valid-image.log

  Scenario: Edge case - verify all required tables are in ERD
    Tool: Look At (image analysis)
    Preconditions: ERD PNG file exists
    Steps:
      1. Analyze image for table names
    Expected Result: All 7 tables visible: users, queue_templates, queue_template_statuses, queues, queue_sessions, queue_session_statuses, queue_items
    Failure Indicators: Missing tables, wrong table names, deprecated tables included
    Evidence: .sisyphus/evidence/task-3-erd-tables-check.txt (description of tables found)
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-3-erd-valid-image.log`: file command output
  - [ ] `task-3-erd-tables-check.txt`: Description of tables found in ERD

  **Commit**: NO (part of Wave 1 group commit)

- [x] 4. **Create OpenAPI specification**

  **What to do**:
  - Create OpenAPI spec file at `docs/queue-session-openapi.yaml`
  - Define all API endpoints for queues, sessions, session statuses, items, templates
  - Include all HTTP methods: GET, POST, PUT/PATCH, DELETE
  - Define request/response schemas for all endpoints
  - Use snake_case for all property names (user preference)
  - Include authentication requirements (even if not implemented yet)
  - Include error response schemas (400, 404, 500)
  - Include SSE endpoints documentation
  - Add descriptions for all endpoints, parameters, and schemas

  **Must NOT do**:
  - Use camelCase for properties (use snake_case per user preference)
  - Include deprecated /batches endpoints
  - Include frontend routes or components
  - Add authentication/authorization implementation (only spec)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `writing`
    - Reason: Documentation/specification writing requires clear, precise language
  - **Skills**: None required
    - No specific skills needed for YAML spec creation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task F4 (documentation verification depends on this deliverable)
  - **Blocked By**: Task 1 (baseline commit, but can start independently)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/routes/queues.ts:22-220` - Queue routes (to be updated to sessions)
  - `be/src/routes/batches.ts:18-163` - Batch routes (to be renamed to sessions)
  - `be/src/routes/queue-items.ts` - Queue item routes
  - `be/src/routes/statuses.ts` - Status routes (to be session statuses)
  - `be/src/routes/templates.ts` - Template routes (keep as-is)
  - `be/src/middleware/response.ts` - Standard response format {success, data, message}

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:151-288` - API routes and response contracts
  - `docs/queue_system_refactor_prompt_v_2.md:153-180` - Session API response contract
  - `docs/queue_system_refactor_prompt_v_2.md:189-199` - Session status API response contract
  - `docs/queue_system_refactor_prompt_v_2.md:206-222` - Queue item API response contract

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - OpenAPI 3.0 specification: https://swagger.io/specification/
  - OpenAPI YAML examples: https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.0/petstore.yaml

  **WHY Each Reference Matters** (explain the relevance):
  - Existing route files show current endpoint structure and patterns to replicate
  - Refactor doc specifies exact API contracts, routes, and response formats
  - OpenAPI spec ensures valid, complete API documentation

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] OpenAPI spec file created: `docs/queue-session-openapi.yaml` exists
  - [ ] File is valid YAML: `yamllint docs/queue-session-openapi.yaml` or similar parser
  - [ ] Includes all queues routes: GET/POST/PUT/DELETE /queues
  - [ ] Includes all sessions routes: GET/POST/PATCH/DELETE /sessions, PATCH /sessions/:id/lifecycle
  - [ ] Includes session statuses routes: GET /sessions/:sessionId/statuses, PATCH /session-statuses/:id
  - [ ] Includes items routes: POST /sessions/:sessionId/items, GET /items/:id, PATCH /items/:id/status
  - [ ] Includes templates routes: GET/POST /templates, GET /templates/:id/statuses, POST /templates/:id/statuses
  - [ ] All property names use snake_case
  - [ ] No deprecated /batches endpoints included

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - OpenAPI spec is valid YAML
    Tool: Bash (python or yamllint)
    Preconditions: OpenAPI spec file exists
    Steps:
      1. Run `python -c "import yaml; yaml.safe_load(open('docs/queue-session-openapi.yaml'))"` or use yamllint
    Expected Result: No YAML parsing errors
    Failure Indicators: YAML syntax error, indentation error
    Evidence: .sisyphus/evidence/task-4-openapi-valid-yaml.log

  Scenario: Edge case - verify all required endpoints are specified
    Tool: Bash (grep)
    Preconditions: OpenAPI spec file exists
    Steps:
      1. Run `grep -c "/sessions" docs/queue-session-openapi.yaml`
      2. Run `grep -c "/queues" docs/queue-session-openapi.yaml`
      3. Run `grep -c "/items" docs/queue-session-openapi.yaml`
      4. Run `grep "/batches" docs/queue-session-openapi.yaml`
    Expected Result: Count > 0 for /sessions, /queues, /items; count = 0 for /batches
    Failure Indicators: Missing /sessions, deprecated /batches present
    Evidence: .sisyphus/evidence/task-4-openapi-endpoints-check.log

  Scenario: Negative - verify no camelCase in response schemas
    Tool: Bash (grep)
    Preconditions: OpenAPI spec file exists
    Steps:
      1. Run `grep -E "^[[:space:]]*[a-z]+[A-Z]" docs/queue-session-openapi.yaml | head -20`
    Expected Result: No camelCase property names found (should all be snake_case)
    Failure Indicators: camelCase properties present (e.g., sessionNumber, startedAt)
    Evidence: .sisyphus/evidence/task-4-openapi-nocamelcase.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-4-openapi-valid-yaml.log`: YAML validation output
  - [ ] `task-4-openapi-endpoints-check.log`: grep results for endpoints
  - [ ] `task-4-openapi-nocamelcase.log`: grep results checking for camelCase

  **Commit**: NO (part of Wave 1 group commit)

- [x] 5. **Update database schema (schema.ts)**

  **What to do**:
  - Modify `be/src/db/schema.ts` to rename tables and add fields
  - Rename `queueBatches` table definition to `queue_sessions`
  - Rename `queueStatuses` table definition to `queue_session_statuses`
  - Add new fields to `queue_sessions`:
    - `session_number: integer` (auto-increment per queue)
    - `started_at: timestamp` (nullable)
    - `ended_at: timestamp` (nullable)
    - `deleted_at: timestamp` (nullable, soft delete)
    - Change `status` to enum: `'draft' | 'active' | 'closed'`
  - Update `queue_session_statuses` FK from `queueId` to `sessionId` (point to queue_sessions)
  - Update `queueItems` table:
    - Rename `batchId` to `sessionId`
    - Update FK to reference `queue_sessions.id`
    - Update queue_number to ensure it's text type (already is in current schema)
  - Update all relations (queuesRelations, queueBatchesRelations, etc.)
  - Rename relation types: QueueBatch → QueueSession, QueueStatus → QueueSessionStatus
  - Ensure cascade behaviors are correct:
    - queue_sessions cascade to queue_session_statuses and queue_items on delete
    - queue_session_statuses restrict delete when referenced by queue_items

  **Must NOT do**:
  - Modify users table
  - Modify queue_templates or queue_template_statuses tables
  - Create mapping layer (keep snake_case as-is)
  - Change queue_items.queue_number type (already text)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Complex schema changes with multiple table updates and FK relationships
  - **Skills**: None required
    - Drizzle ORM patterns are well-established in codebase

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Tasks 6, 7)
  - **Blocks**: Task 6 (migration generation depends on updated schema)
  - **Blocked By**: Task 2 (migration SQL provides pattern, but schema changes are independent)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/db/schema.ts:60-85` - Existing queue_batches definition (to rename to queue_sessions)
  - `be/src/db/schema.ts:87-99` - Existing queue_statuses definition (to rename to queue_session_statuses)
  - `be/src/db/schema.ts:101-114` - Existing queue_items definition with batchId FK
  - `be/src/db/schema.ts:116-180` - Existing relation definitions (to update for renamed tables)

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:105-148` - Target database schema specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle ORM schema definitions: https://orm.drizzle.team/docs/sql-schema-declaration
  - Drizzle pgTable API: https://orm.drizzle.team/docs/pg-core/pgtable
  - Drizzle relations API: https://orm.drizzle.team/docs/queries/relations

  **WHY Each Reference Matters** (explain the relevance):
  - Current schema provides exact table structure to modify
  - Refactor doc specifies exact field names and types for new schema
  - Drizzle docs ensure correct ORM syntax for all operations

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `queueBatches` renamed to `queue_sessions` in schema.ts
  - [ ] `queueStatuses` renamed to `queue_session_statuses` in schema.ts
  - [ ] `queue_sessions` has `session_number: integer` field
  - [ ] `queue_sessions` has `started_at: timestamp` field
  - [ ] `queue_sessions` has `ended_at: timestamp` field
  - [ ] `queue_sessions` has `deleted_at: timestamp` field
  - [ ] `queue_sessions.status` is enum: 'draft' | 'active' | 'closed'
  - [ ] `queueItems.batchId` renamed to `sessionId`
  - [ ] `queueItems.sessionId` FK references `queue_sessions.id`
  - [ ] All relations updated for renamed tables
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - schema compiles without errors
    Tool: Bash (pnpm)
    Preconditions: schema.ts has been updated
    Steps:
      1. Run `cd be && pnpm build`
    Expected Result: Build succeeds with no TypeScript errors
    Failure Indicators: TypeScript errors, build failures, type mismatches
    Evidence: .sisyphus/evidence/task-5-schema-build.log

  Scenario: Edge case - verify all new fields exist in queue_sessions
    Tool: Bash (grep)
    Preconditions: schema.ts has been updated
    Steps:
      1. Run `grep -E "session_number|started_at|ended_at|deleted_at" be/src/db/schema.ts`
    Expected Result: All 4 new fields present in queue_sessions definition
    Failure Indicators: Missing fields, wrong field names
    Evidence: .sisyphus/evidence/task-5-schema-fields.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-5-schema-build.log`: pnpm build output
  - [ ] `task-5-schema-fields.log`: grep results for new fields

  **Commit**: NO (part of Wave 2 group commit)

- [x] 6. **Generate Drizzle migration**

  **What to do**:
  - Run Drizzle migration generation: `pnpm --filter @antree/backend db:generate`
  - Verify migration file is created in `be/src/db/migrations/` directory
  - Review generated migration to ensure it matches expected changes:
    - RENAME TABLE queue_batches TO queue_sessions
    - RENAME TABLE queue_statuses TO queue_session_statuses
    - ALTER TABLE queue_sessions ADD COLUMN session_number
    - ALTER TABLE queue_sessions ADD COLUMN started_at
    - ALTER TABLE queue_sessions ADD COLUMN ended_at
    - ALTER TABLE queue_sessions ADD COLUMN deleted_at
    - ALTER TABLE queue_sessions ALTER COLUMN status SET DEFAULT 'draft'
    - ALTER TABLE queue_items RENAME COLUMN batch_id TO session_id
    - ALTER TABLE queue_items DROP CONSTRAINT queue_items_batch_id_fkey
    - ALTER TABLE queue_items ADD CONSTRAINT queue_items_session_id_fkey FOREIGN KEY (session_id) REFERENCES queue_sessions(id)
  - If migration is incorrect, manually edit migration SQL

  **Must NOT do**:
  - Apply migration to database (that's Task 7)
  - Modify migration beyond correcting generation errors
  - Create custom migration that differs from schema

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple command execution with review
  - **Skills**: None required
    - Drizzle migration generation is a standard pnpm script

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Tasks 5, 7)
  - **Blocks**: Task 7 (migration application depends on migration file)
  - **Blocked By**: Task 5 (schema.ts must be updated first)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/package.json:11-14` - Drizzle migration scripts
  - `be/drizzle.config.ts` - Drizzle configuration (if exists)
   - Existing migration files in `be/src/db/migrations/` - Migration file naming and structure

  **API/Type References** (contracts to implement against):
  - Task 2 migration SQL - Expected migration structure to verify against

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle migrate command: https://orm.drizzle.team/docs/kit-cli#migrate
  - Drizzle generate command: https://orm.drizzle.team/docs/kit-cli#generate

  **WHY Each Reference Matters** (explain the relevance):
  - Package.json shows exact script commands to run
  - Existing migrations show file naming conventions and SQL patterns
  - Drizzle docs ensure correct command usage

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] Migration file created: New file exists in `be/src/db/migrations/` directory
  - [ ] Migration includes RENAME TABLE queue_batches TO queue_sessions
  - [ ] Migration includes RENAME TABLE queue_statuses TO queue_session_statuses
  - [ ] Migration includes ADD COLUMN session_number to queue_sessions
  - [ ] Migration includes ADD COLUMN started_at to queue_sessions
  - [ ] Migration includes ADD COLUMN ended_at to queue_sessions
  - [ ] Migration includes ADD COLUMN deleted_at to queue_sessions
  - [ ] Migration includes RENAME COLUMN batch_id TO session_id in queue_items
  - [ ] Migration includes updated FK constraint for session_id

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - Drizzle generates migration successfully
    Tool: Bash (pnpm)
    Preconditions: schema.ts updated, working directory clean
    Steps:
      1. Run `cd be && pnpm db:generate`
      2. Run `ls -la drizzle/*.sql | tail -1`
    Expected Result: New migration file created with recent timestamp
    Failure Indicators: No migration created, generation errors
    Evidence: .sisyphus/evidence/task-6-migration-generation.log

  Scenario: Edge case - verify migration contains all expected changes
    Tool: Bash (grep)
    Preconditions: Migration file exists
    Steps:
      1. Run `grep -c "queue_sessions" be/src/db/migrations/*.sql`
      2. Run `grep -c "queue_session_statuses" be/src/db/migrations/*.sql`
      3. Run `grep "session_number\|started_at\|ended_at\|deleted_at" be/src/db/migrations/*.sql`
    Expected Result: queue_sessions present, queue_session_statuses present, all 4 new fields present
    Failure Indicators: Missing renames, missing fields
    Evidence: .sisyphus/evidence/task-6-migration-content.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-6-migration-generation.log`: pnpm db:generate output
  - [ ] `task-6-migration-content.log`: grep results for migration content

  **Commit**: NO (part of Wave 2 group commit)

- [x] 7. **Apply migration to database via Docker**

  **What to do**:
  - Start database if not running: `docker-compose up -d`
  - Apply Drizzle migration: `pnpm --filter @antree/backend db:push` or `pnpm db:push`
  - Wait for migration to complete
  - Verify tables are renamed in database
  - Verify new columns exist in queue_sessions
  - Verify queue_items.session_id FK is correct
  - Verify queue_session_statuses table exists
  - Test basic query on new schema to ensure it's functional

  **Must NOT do**:
  - Use direct psql command without docker-compose (use docker exec)
  - Modify database manually outside of migration
  - Skip verification after migration

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Standard command execution with verification
  - **Skills**: None required
    - Docker and Drizzle commands are standard

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 8-24 (all subsequent tasks depend on migrated schema)
  - **Blocked By**: Task 6 (migration file must exist)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `docker-compose.yml` - Database service configuration
  - `be/package.json:13` - Drizzle push script
  - `be/.env` - Database connection string

  **API/Type References** (contracts to implement against):
  - N/A - Database operation, no API contracts

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Docker Compose exec command: https://docs.docker.com/compose/reference/exec/
  - PostgreSQL \d command: https://www.postgresql.org/docs/current/app-psql.html#APP-PSQL-meta-commands

  **WHY Each Reference Matters** (explain the relevance):
  - Docker compose config shows database service name and ports
  - Package.json shows exact script to run for migration
  - Postgres docs ensure correct \d command syntax for schema inspection

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] Migration applied: `pnpm db:push` completes without errors
  - [ ] queue_sessions table exists: `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_sessions"`
  - [ ] queue_session_statuses table exists: `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_session_statuses"`
  - [ ] queue_sessions has session_number column
  - [ ] queue_sessions has started_at column
  - [ ] queue_sessions has ended_at column
  - [ ] queue_sessions has deleted_at column
  - [ ] queue_items.session_id FK exists: `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_items"`
  - [ ] No queue_batches table: `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\dt queue_batches"` returns empty

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - migration applied successfully
    Tool: Bash (pnpm)
    Preconditions: Migration file exists, database running
    Steps:
      1. Run `pnpm db:push`
    Expected Result: Command completes with " migrations applied" or similar success message
    Failure Indicators: Migration errors, connection errors, permission denied
    Evidence: .sisyphus/evidence/task-7-migration-push.log

  Scenario: Edge case - verify new schema in database
    Tool: Bash (docker-compose exec psql)
    Preconditions: Migration applied
    Steps:
      1. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_sessions"`
      2. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_session_statuses"`
      3. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_items"`
    Expected Result: All tables exist with correct columns and FKs
    Failure Indicators: Missing tables, missing columns, wrong FKs
    Evidence: .sisyphus/evidence/task-7-db-schema-verify.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-7-migration-push.log`: pnpm db:push output
  - [ ] `task-7-db-schema-verify.log`: \d commands output

  **Commit**: NO (part of Wave 2 group commit)

- [x] 8. **Rename/Update session validators**

  **What to do**:
  - Rename `be/src/validators/batch.validator.ts` to `session.validator.ts`
  - Update all validator schemas to match new session schema:
    - `createBatchSchema` → `createSessionSchema` with fields: queueId, templateId, name, status (default 'draft')
    - `updateBatchSchema` → `updateSessionSchema` with optional fields: name, status
    - Add `lifecycleUpdateSchema` for PATCH /sessions/:id/lifecycle: status (draft|active|closed)
    - Remove batch-specific validators if any
  - Update type names: CreateBatch → CreateSession, UpdateBatch → UpdateSession
  - Ensure all validators use Zod schemas
  - Update imports in validators

  **Must NOT do**:
  - Add complex validation logic beyond basic field validation
  - Create camelCase validators (use snake_case per user preference)
  - Add validators for deprecated batch routes

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple file rename and schema updates following existing patterns
  - **Skills**: None required
    - Zod validation patterns are established in codebase

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 9, 10, 11)
  - **Blocks**: Tasks 12-16 (services depend on updated validators)
  - **Blocked By**: Task 7 (migration must be applied, but validators can be updated independently)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/validators/batch.validator.ts` - Existing batch validators to rename and update
  - `be/src/validators/queue.validator.ts` - Queue validator patterns (Zod usage)
  - `be/src/validators/queue-item.validator.ts` - Queue item validator patterns

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:169-181` - Session API response contract
  - Task 7 updated database schema - Source of truth for field names and types

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Zod schema validation: https://zod.dev/

  **WHY Each Reference Matters** (explain the relevance):
  - Existing batch validators show patterns to follow for session validators
  - Other validators demonstrate Zod usage patterns
  - Refactor doc and schema provide exact field requirements

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `batch.validator.ts` renamed to `session.validator.ts`
  - [ ] `createSessionSchema` exists with queueId, templateId, name fields
  - [ ] `createSessionSchema` has status enum: 'draft' | 'active' | 'closed'
  - [ ] `updateSessionSchema` exists with optional fields
  - [ ] `lifecycleUpdateSchema` exists with status enum
  - [ ] All validators use Zod schemas
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - validators compile and export correctly
    Tool: Bash (ts-node or TypeScript)
    Preconditions: session.validator.ts exists
    Steps:
      1. Run `cd be && npx tsx -e "import { createSessionSchema } from './src/validators/session.validator.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors, file not found
    Evidence: .sisyphus/evidence/task-8-validator-import.log

  Scenario: Edge case - verify validators reject invalid lifecycle status
    Tool: Bash (ts-node or TypeScript)
    Preconditions: session.validator.ts exists
    Steps:
      1. Run test script that tries to validate `{ status: 'invalid' }` against lifecycleUpdateSchema
    Expected Result: Validation fails with error
    Failure Indicators: Validation passes, no error thrown
    Evidence: .sisyphus/evidence/task-8-validator-invalid-status.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-8-validator-import.log`: TypeScript import test output
  - [ ] `task-8-validator-invalid-status.log`: Validation error test output

  **Commit**: NO (part of Wave 3 group commit)

- [x] 9. **Create backend DTO types**

  **What to do**:
  - Create `be/src/types/session.dto.ts` file
  - Define TypeScript interfaces for API contracts:
    - `QueueDTO`: id, name, template_id, is_active, created_at, updated_at
    - `SessionDTO`: id, queue_id, template_id, name, status, session_number, started_at, ended_at, created_at
    - `SessionStatusDTO`: id, session_id, label, color, order
    - `QueueItemDTO`: id, queue_id, session_id, status_id, queue_number, name, metadata, created_at
    - `TemplateDTO`: id, name, description, is_system_template, is_active, created_at, updated_at
    - `TemplateStatusDTO`: id, template_id, label, color, order
    - `SessionLifecycleDTO`: status (draft | active | closed)
  - Use snake_case for all property names (user preference)
  - Export all types as module exports
  - Import types in routes/services as needed

  **Must NOT do**:
  - Create mapping functions (user wants snake_case, no transformation)
  - Use camelCase for properties
  - Include frontend-specific types

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple TypeScript interface creation
  - **Skills**: None required
    - TypeScript type definitions are straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 10, 11)
  - **Blocks**: Tasks 12-16 (services use DTO types for responses)
  - **Blocked By**: Task 7 (migration schema provides source of truth, but can be created independently)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/db/schema.ts:15-16, 27-28` - Drizzle inferred type exports (User, QueueBoard patterns)
  - Existing type exports in schema (if any)

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:153-164` - Queue API response contract
  - `docs/queue_system_refactor_prompt_v_2.md:169-181` - Session API response contract
  - `docs/queue_system_refactor_prompt_v_2.md:189-199` - Session status API response contract
  - `docs/queue_system_refactor_prompt_v_2.md:206-222` - Queue item API response contract

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - TypeScript interfaces: https://www.typescriptlang.org/docs/handbook/2/interfaces.html

  **WHY Each Reference Matters** (explain the relevance):
  - Schema type exports show patterns for defining and exporting types
  - Refactor doc specifies exact API response shapes to implement

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `session.dto.ts` file created
  - [ ] `QueueDTO` interface defined with id, name, template_id, is_active, created_at, updated_at
  - [ ] `SessionDTO` interface defined with id, queue_id, name, status, session_number, started_at, ended_at
  - [ ] `SessionStatusDTO` interface defined with id, session_id, label, color, order
  - [ ] `QueueItemDTO` interface defined with id, queue_id, session_id, status_id, queue_number, name, metadata
  - [ ] All properties use snake_case
  - [ ] All types exported
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - DTO types compile and import correctly
    Tool: Bash (ts-node or TypeScript)
    Preconditions: session.dto.ts exists
    Steps:
      1. Run `cd be && npx tsx -e "import { SessionDTO } from './src/types/session.dto.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors, file not found
    Evidence: .sisyphus/evidence/task-9-dto-import.log

  Scenario: Edge case - verify all DTO properties are snake_case
    Tool: Bash (grep)
    Preconditions: session.dto.ts exists
    Steps:
      1. Run `grep -E "^[[:space:]]*[a-z]+[A-Z]" be/src/types/session.dto.ts | head -20`
    Expected Result: No camelCase property names found
    Failure Indicators: camelCase properties present (e.g., sessionNumber, startedAt)
    Evidence: .sisyphus/evidence/task-9-dto-nocamelcase.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-9-dto-import.log`: TypeScript import test output
  - [ ] `task-9-dto-nocamelcase.log`: grep results checking for camelCase

  **Commit**: NO (part of Wave 3 group commit)

- [x] 10. **Update TypeScript type exports**

  **What to do**:
  - Update `be/src/db/schema.ts` to export renamed types:
    - `QueueBatch` → `QueueSession`
    - `NewQueueBatch` → `NewQueueSession`
    - `QueueStatus` → `QueueSessionStatus`
    - `NewQueueStatus` → `NewQueueSessionStatus`
  - Add exports for new DTO types if needed:
    - Re-export DTO types from `session.dto.ts` in schema or index file
  - Verify all type exports are correct
  - Update any imports in other files that reference old type names

  **Must NOT do**:
  - Remove existing type exports for users, queue_templates, queue_items
  - Create new types beyond what's necessary
  - Change type structure beyond renaming

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple type rename and export updates
  - **Skills**: None required
    - TypeScript type management is straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 11)
  - **Blocks**: Tasks 12-16 (services depend on correct type exports)
  - **Blocked By**: Task 5 (schema updated with new tables, but types can be renamed independently)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/db/schema.ts:15-16, 27-28, 44-45, 57-58` - Type export patterns (User, QueueBoard, QueueTemplate, QueueTemplateStatus)
  - `be/src/db/schema.ts:71-72, 84-85, 98-99, 113-114` - QueueBatch, NewQueueBatch, QueueStatus, NewQueueStatus exports (to rename)

  **API/Type References** (contracts to implement against):
  - Task 9 DTO types - Reference for type naming conventions

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle inferred types: https://orm.drizzle.team/docs/goodies#infer-types

  **WHY Each Reference Matters** (explain the relevance):
  - Existing type exports show patterns to follow for type naming
  - Type renames ensure consistency across codebase

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `QueueBatch` renamed to `QueueSession`
  - [ ] `NewQueueBatch` renamed to `NewQueueSession`
  - [ ] `QueueStatus` renamed to `QueueSessionStatus`
  - [ ] `NewQueueStatus` renamed to `NewQueueSessionStatus`
  - [ ] All old type names removed
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - type exports work correctly
    Tool: Bash (ts-node or TypeScript)
    Preconditions: schema.ts type exports updated
    Steps:
      1. Run `cd be && npx tsx -e "import { QueueSession } from './src/db/schema.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-10-type-exports-import.log

  Scenario: Edge case - verify old type names are gone
    Tool: Bash (grep)
    Preconditions: schema.ts updated
    Steps:
      1. Run `grep "QueueBatch\|NewQueueBatch\|QueueStatus\|NewQueueStatus" be/src/db/schema.ts`
    Expected Result: No matches found (all renamed)
    Failure Indicators: Old type names still present
    Evidence: .sisyphus/evidence/task-10-old-types-gone.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-10-type-exports-import.log`: TypeScript import test output
  - [ ] `task-10-old-types-gone.log`: grep results checking for old type names

  **Commit**: NO (part of Wave 3 group commit)

- [ ] 11. **Create SSE channel mapping document**

  **What to do**:
  - Create `docs/sse-mapping.md` file
  - Document all SSE event types with descriptions:
    - **Session Events**:
      - `session_created`: Emitted when new session is created
      - `session_updated`: Emitted when session metadata is updated
      - `session_deleted`: Emitted when session is soft-deleted
      - `session_paused`: Emitted when session status changes to 'paused' (if added)
      - `session_resumed`: Emitted when session status changes from 'paused' to 'active' (if added)
      - `session_closed`: Emitted when session status changes to 'closed'
    - **Session Status Events**:
      - `session_status_created`: Emitted when session status is created
      - `session_status_updated`: Emitted when session status is updated
      - `session_status_deleted`: Emitted when session status is deleted
    - **Item Events**:
      - `item_created`: Emitted when queue item is created
      - `item_updated`: Emitted when queue item metadata is updated
      - `item_status_changed`: Emitted when queue item status is updated
      - `item_deleted`: Emitted when queue item is deleted
    - **Queue Events**:
      - `queue_created`: Emitted when new queue is created
      - `queue_updated`: Emitted when queue metadata is updated
      - `queue_deleted`: Emitted when queue is deleted
    - **Template Events**:
      - `template_created`: Emitted when new template is created
      - `template_updated`: Emitted when template is updated
      - `template_deleted`: Emitted when template is deleted
  - Document SSE endpoints:
    - `GET /sse/sessions/:sessionId/stream` - Stream events for a specific session
    - `GET /sse/items/:itemId/stream` - Stream events for a specific item
  - Document event payload structure (all snake_case)
  - Include examples of each event type
  - Note that `batch_*` events are deprecated and replaced by `session_*`

  **Must NOT do**:
  - Include deprecated `batch_*` events (only note deprecation)
  - Include frontend-specific SSE client examples
  - Use camelCase in event payloads (use snake_case per user preference)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `writing`
    - Reason: Documentation writing requires clear, organized presentation
  - **Skills**: None required
    - Markdown documentation is straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9, 10)
  - **Blocks**: Task F4 (documentation verification depends on this deliverable)
  - **Blocked By**: Task 7 (migration applied, but documentation can be created independently)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/sse/broadcaster.ts:15-39` - Current SSE event type definitions
  - `be/src/sse/broadcaster.ts:143-207` - Broadcast function implementation
  - `be/src/sse/index.ts` - Current SSE endpoint routes

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:267-287` - SSE channels specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - MDN Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

  **WHY Each Reference Matters** (explain the relevance):
  - Current SSE implementation shows existing event types and patterns to document
  - Refactor doc specifies new SSE endpoints and event types

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `sse-mapping.md` file created
  - [ ] Documents all session events (session_created, session_updated, session_deleted, session_closed)
  - [ ] Documents all item events (item_created, item_updated, item_status_changed, item_deleted)
  - [ ] Documents SSE endpoints (/sse/sessions/:sessionId/stream, /sse/items/:itemId/stream)
  - [ ] Event payloads documented with snake_case properties
  - [ ] Notes deprecation of batch_* events
  - [ ] All document is valid markdown

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - SSE mapping document is valid markdown
    Tool: Bash (grep or file)
    Preconditions: sse-mapping.md exists
    Steps:
      1. Run `head -20 docs/sse-mapping.md`
      2. Verify markdown syntax (headers, lists, code blocks)
    Expected Result: Well-formed markdown with proper structure
    Failure Indicators: Broken markdown, malformed code blocks
    Evidence: .sisyphus/evidence/task-11-sse-doc-valid.txt

  Scenario: Edge case - verify all required events are documented
    Tool: Bash (grep)
    Preconditions: sse-mapping.md exists
    Steps:
      1. Run `grep -c "session_created" docs/sse-mapping.md`
      2. Run `grep -c "item_created" docs/sse-mapping.md`
      3. Run `grep -c "/sse/sessions" docs/sse-mapping.md`
    Expected Result: All events and endpoints documented (count > 0)
    Failure Indicators: Missing events, missing endpoints
    Evidence: .sisyphus/evidence/task-11-sse-events-doc.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-11-sse-doc-valid.txt`: First 20 lines of document
  - [ ] `task-11-sse-events-doc.log`: grep results for events and endpoints

  **Commit**: NO (part of Wave 3 group commit)

- [ ] 12. **Rename/Update batch.service.ts → session.service.ts**

  **What to do**:
  - Rename `be/src/services/batch.service.ts` to `session.service.ts`
  - Update all function names:
    - `getAllBatches()` → `getAllSessions(filters)`
    - `getBatchById(id)` → `getSessionById(id)`
    - `createBatch(input)` → `createSession(input)` - implement session number auto-increment logic
    - `updateBatch(id, input)` → `updateSession(id, input)`
    - `deleteBatch(id)` → `deleteSession(id)` - implement soft delete (set deleted_at timestamp)
    - `getBatchStatuses(id)` → `getSessionStatuses(id)`
  - Implement session number auto-increment:
    - When creating session, query max session_number for queue
    - Increment by 1, default to 1 if no existing sessions
    - Assign to new session
  - Implement soft delete logic:
    - Instead of hard DELETE, UPDATE with `deleted_at = NOW()`
    - Filter out soft-deleted sessions in getAllSessions queries
  - Update all SQL queries to use new table names (queue_sessions, queue_session_statuses)
  - Update imports to reference renamed types
  - Update all database operations to use session fields (session_number, started_at, ended_at, deleted_at)
  - Implement lifecycle status validation (draft → active → closed transitions)
  - Update SSE broadcasts to use `session_*` event types

  **Must NOT do**:
  - Keep any batch naming in function names or variables
  - Implement hard delete for sessions
  - Create mapping layer (return DB rows directly, snake_case)
  - Add features beyond session management

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Complex service with DB operations, business logic for numbering, soft delete
  - **Skills**: None required
    - Drizzle ORM patterns and service patterns are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 13, 14, 15, 16)
  - **Blocks**: Tasks 17, 20, 23 (routes use session service)
  - **Blocked By**: Tasks 7, 8, 9, 10 (migration, validators, DTOs, types must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/services/batch.service.ts` - Existing batch service to rename and update
  - `be/src/services/queue.service.ts` - Queue service patterns (Drizzle usage, error handling)
  - `be/src/services/status.service.ts` - Status service patterns

  **API/Type References** (contracts to implement against):
  - Task 8 validators - Input schemas for create/update operations
  - Task 9 DTO types - Response types to return
  - `docs/queue_system_refactor_prompt_v_2.md:169-181` - Session API response contract

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle query API: https://orm.drizzle.team/docs/query-apis/find
  - Drizzle update API: https://orm.drizzle.team/docs/update
  - Drizzle transaction API: https://orm.drizzle.team/docs/transaction

  **WHY Each Reference Matters** (explain the relevance):
  - Existing batch service shows patterns to follow for DB operations and SSE broadcasts
  - Other services demonstrate error handling and response patterns
  - Validators and DTOs provide exact input/output contracts
  - Drizzle docs ensure correct query syntax for all operations

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `batch.service.ts` renamed to `session.service.ts`
  - [ ] `getAllSessions()` function exists with queueId, status filters
  - [ ] `getSessionById(id)` function exists
  - [ ] `createSession(input)` function exists with session_number auto-increment logic
  - [ ] `updateSession(id, input)` function exists
  - [ ] `deleteSession(id)` function implements soft delete (sets deleted_at)
  - [ ] `getSessionStatuses(id)` function exists
  - [ ] All queries use queue_sessions table (no queue_batches)
  - [ ] All functions use snake_case property names
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds
  - [ ] SSE broadcasts use `session_created`, `session_updated`, `session_deleted`

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - session service compiles and exports functions
    Tool: Bash (ts-node or TypeScript)
    Preconditions: session.service.ts exists
    Steps:
      1. Run `cd be && npx tsx -e "import { createSession } from './src/services/session.service.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-12-session-service-import.log

  Scenario: Edge case - verify soft delete implementation
    Tool: Bash (grep)
    Preconditions: session.service.ts exists
    Steps:
      1. Run `grep -i "deleted_at" be/src/services/session.service.ts`
    Expected Result: deleted_at is set to timestamp (not hard DELETE)
    Failure Indicators: Hard DELETE statement used, deleted_at not set
    Evidence: .sisyphus/evidence/task-12-soft-delete-check.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-12-session-service-import.log`: TypeScript import test output
  - [ ] `task-12-soft-delete-check.log`: grep results for deleted_at usage

  **Commit**: NO (part of Wave 4 group commit)

- [ ] 13. **Update queue-item.service.ts for sessions**

  **What to do**:
  - Update `be/src/services/queue-item.service.ts` to work with sessions
  - Rename all `batchId` references to `sessionId`
  - Update function signatures to accept sessionId instead of batchId:
    - `getQueueItems(batchId)` → `getQueueItems(sessionId)`
    - `createQueueItem(input)` - input should include sessionId, update validation
    - `updateQueueItem(id, input)` - no changes needed
    - `deleteQueueItem(id)` - no changes needed
    - `getQueueItemsByStatus(batchId, statusId)` → `getQueueItemsByStatus(sessionId, statusId)`
  - Implement queue number auto-increment per session:
    - When creating item, query max queue_number for session (as integer)
    - Increment by 1, default to 1 if no items in session
    - Convert to string and assign to new item
    - Use transaction to prevent race conditions
  - Update SQL queries to use queue_sessions table
  - Update SSE broadcasts to use `item_*` event types
  - Add `item_status_changed` event when item status is updated

  **Must NOT do**:
  - Keep batchId references in function signatures or DB queries
  - Remove existing item functionality
  - Create mapping layer (return DB rows directly, snake_case)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Complex service with DB operations, queue numbering logic, transaction handling
  - **Skills**: None required
    - Drizzle ORM patterns and service patterns are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 14, 15, 16)
  - **Blocks**: Tasks 18, 23 (routes use queue-item service)
  - **Blocked By**: Tasks 7, 8, 9, 10 (migration, validators, DTOs, types must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/services/queue-item.service.ts` - Existing queue-item service to update
  - `be/src/services/batch.service.ts` - Batch service patterns for query structure

  **API/Type References** (contracts to implement against):
  - Task 8 validators - Queue item input schemas
  - Task 9 DTO types - Queue item response type
  - `docs/queue_system_refactor_prompt_v_2.md:206-222` - Queue item API response contract

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle query API: https://orm.drizzle.team/docs/query-apis/find
  - Drizzle transaction API: https://orm.drizzle.team/docs/transaction

  **WHY Each Reference Matters** (explain the relevance):
  - Existing queue-item service shows patterns to follow for DB operations
  - Validators and DTOs provide exact input/output contracts
  - Drizzle docs ensure correct query and transaction syntax

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] All `batchId` references renamed to `sessionId`
  - [ ] `getQueueItems(sessionId)` function exists
  - [ ] `createQueueItem(input)` function includes sessionId parameter
  - [ ] Queue number auto-increment per session implemented (integer + 1)
  - [ ] Queue number converted to string before storage
  - [ ] Transaction used for createQueueItem to prevent race conditions
  - [ ] All queries use sessionId FK
  - [ ] SSE broadcasts use `item_created`, `item_updated`, `item_deleted`, `item_status_changed`
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - queue-item service compiles and exports functions
    Tool: Bash (ts-node or TypeScript)
    Preconditions: queue-item.service.ts updated
    Steps:
      1. Run `cd be && npx tsx -e "import { createQueueItem } from './src/services/queue-item.service.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-13-queueitem-service-import.log

  Scenario: Edge case - verify sessionId replaces batchId
    Tool: Bash (grep)
    Preconditions: queue-item.service.ts updated
    Steps:
      1. Run `grep "batchId" be/src/services/queue-item.service.ts`
    Expected Result: No matches found (all replaced with sessionId)
    Failure Indicators: batchId still present
    Evidence: .sisyphus/evidence/task-13-batchid-gone.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-13-queueitem-service-import.log`: TypeScript import test output
  - [ ] `task-13-batchid-gone.log`: grep results showing batchId removed

  **Commit**: NO (part of Wave 4 group commit)

- [ ] 14. **Update queue.service.ts for sessions**

  **What to do**:
  - Update `be/src/services/queue.service.ts` to work with sessions
  - Update function signatures to use session terminology:
    - `getActiveBatch(queueId)` → `getActiveSession(queueId)`
    - `resetQueue(queueId, input)` → Update to use new session service
  - Update queue queries to work with session relationships
  - Update `getQueueById()` to return queue with session information if needed
  - Update SSE broadcasts to use correct event types
  - Ensure all function names and variables use session terminology

  **Must NOT do**:
  - Keep batch terminology in function names
  - Change queue creation/update logic (only session-related changes)
  - Create mapping layer

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Moderate complexity with DB operations and session integration
  - **Skills**: None required
    - Drizzle ORM patterns and service patterns are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13, 15, 16)
  - **Blocks**: Tasks 17, 18 (routes use queue service)
  - **Blocked By**: Tasks 7, 8, 9, 10, 12 (migration, validators, DTOs, types, session service must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/services/queue.service.ts` - Existing queue service to update
  - `be/src/services/session.service.ts` - New session service patterns

  **API/Type References** (contracts to implement against):
  - Task 8 validators - Queue input schemas
  - Task 9 DTO types - Queue response type
  - `docs/queue_system_refactor_prompt_v_2.md:153-164` - Queue API response contract

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle query API: https://orm.drizzle.team/docs/query-apis/find
  - Drizzle relations API: https://orm.drizzle.team/docs/queries/relations

  **WHY Each Reference Matters** (explain the relevance):
  - Existing queue service shows patterns to follow for DB operations
  - Session service provides new patterns to integrate
  - Validators and DTOs provide exact input/output contracts

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `getActiveBatch()` renamed to `getActiveSession()`
  - [ ] All batch terminology replaced with session terminology
  - [ ] `getQueueById()` returns queue with correct session info
  - [ ] SSE broadcasts use `queue_created`, `queue_updated`, `queue_deleted`
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - queue service compiles and exports functions
    Tool: Bash (ts-node or TypeScript)
    Preconditions: queue.service.ts updated
    Steps:
      1. Run `cd be && npx tsx -e "import { getQueueById } from './src/services/queue.service.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-14-queue-service-import.log

  Scenario: Edge case - verify batch terminology is gone
    Tool: Bash (grep)
    Preconditions: queue.service.ts updated
    Steps:
      1. Run `grep -i "batch" be/src/services/queue.service.ts | head -10`
    Expected Result: No matches found (all replaced with session)
    Failure Indicators: batch terminology still present
    Evidence: .sisyphus/evidence/task-14-batch-terminology-gone.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-14-queue-service-import.log`: TypeScript import test output
  - [ ] `task-14-batch-terminology-gone.log`: grep results for batch terminology

  **Commit**: NO (part of Wave 4 group commit)

- [ ] 15. **Update status.service.ts for session statuses**

  **What to do**:
  - Update `be/src/services/status.service.ts` to work with session statuses
  - Update function signatures to use session terminology:
    - `getStatusesByBatch(batchId)` → `getStatusesBySession(sessionId)`
    - `createStatus(input)` - Update to use sessionId instead of batchId
    - `updateStatus(id, input)` - No changes needed
    - `deleteStatus(id)` - No changes needed
  - Update SQL queries to use queue_session_statuses table
  - Update SSE broadcasts to use `session_status_created`, `session_status_updated`, `session_status_deleted`

  **Must NOT do**:
  - Keep batchId references
  - Change status CRUD logic beyond table name changes
  - Create mapping layer

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple renaming and query updates
  - **Skills**: None required
    - Drizzle ORM patterns and service patterns are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13, 14, 16)
  - **Blocks**: Task 19 (routes use status service)
  - **Blocked By**: Tasks 7, 8, 9, 10 (migration, validators, DTOs, types must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/services/status.service.ts` - Existing status service to update
  - `be/src/services/queue.service.ts` - Queue service patterns for query structure

  **API/Type References** (contracts to implement against):
  - Task 8 validators - Status input schemas
  - Task 9 DTO types - Session status response type
  - `docs/queue_system_refactor_prompt_v_2.md:189-199` - Session status API response contract

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle query API: https://orm.drizzle.team/docs/query-apis/find

  **WHY Each Reference Matters** (explain the relevance):
  - Existing status service shows patterns to follow for DB operations
  - Validators and DTOs provide exact input/output contracts

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] All `batchId` references renamed to `sessionId` in status service
  - [ ] `getStatusesBySession(sessionId)` function exists
  - [ ] All queries use queue_session_statuses table
  - [ ] SSE broadcasts use `session_status_created`, `session_status_updated`, `session_status_deleted`
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - status service compiles and exports functions
    Tool: Bash (ts-node or TypeScript)
    Preconditions: status.service.ts updated
    Steps:
      1. Run `cd be && npx tsx -e "import { createStatus } from './src/services/status.service.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-15-status-service-import.log

  Scenario: Edge case - verify queue_session_statuses table used
    Tool: Bash (grep)
    Preconditions: status.service.ts updated
    Steps:
      1. Run `grep "queue_session_statuses" be/src/services/status.service.ts`
    Expected Result: Table name present in queries
    Failure Indicators: Old table name (queue_statuses) still used
    Evidence: .sisyphus/evidence/task-15-session-status-table.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-15-status-service-import.log`: TypeScript import test output
  - [ ] `task-15-session-status-table.log`: grep results for table name

  **Commit**: NO (part of Wave 4 group commit)

- [ ] 16. **Update template.service.ts (if needed)**

  **What to do**:
  - Review `be/src/services/template.service.ts` for any batch/session dependencies
  - Update if any references to batches exist:
    - Replace with session terminology
    - Update queries if needed
  - Verify template statuses work correctly with session statuses
  - Ensure SSE broadcasts use `template_created`, `template_updated`, `template_deleted`

  **Must NOT do**:
  - Change template CRUD logic (only update if batch dependencies exist)
  - Add new functionality to template service

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Likely minimal changes, just review and minor updates
  - **Skills**: None required
    - Drizzle ORM patterns and service patterns are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with Tasks 12, 13, 14, 15)
  - **Blocks**: Task 23 (all services broadcast SSE events)
  - **Blocked By**: Tasks 7, 8, 9, 10 (migration, validators, DTOs, types must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/services/template.service.ts` - Existing template service to review

  **API/Type References** (contracts to implement against):
  - Task 9 DTO types - Template response type
  - `docs/queue_system_refactor_prompt_v_2.md:259-264` - Template API endpoints

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Drizzle query API: https://orm.drizzle.team/docs/query-apis/find

  **WHY Each Reference Matters** (explain the relevance):
  - Template service may have batch dependencies that need updating
  - DTOs provide exact output contracts

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] No batch terminology remains in template service (if any existed)
  - [ ] Template statuses work with session statuses
  - [ ] SSE broadcasts use `template_created`, `template_updated`, `template_deleted`
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - template service compiles and exports functions
    Tool: Bash (ts-node or TypeScript)
    Preconditions: template.service.ts updated (if changes needed)
    Steps:
      1. Run `cd be && npx tsx -e "import { getTemplateById } from './src/services/template.service.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-16-template-service-import.log

  Scenario: Edge case - verify no batch references remain
    Tool: Bash (grep)
    Preconditions: template.service.ts reviewed
    Steps:
      1. Run `grep -i "batch" be/src/services/template.service.ts`
    Expected Result: No matches found (if batch refs existed, they're removed)
    Failure Indicators: batch terminology still present
    Evidence: .sisyphus/evidence/task-16-no-batch-refs.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-16-template-service-import.log`: TypeScript import test output
  - [ ] `task-16-no-batch-refs.log`: grep results for batch references

  **Commit**: NO (part of Wave 4 group commit)

- [ ] 17. **Rename/Update batches.ts → sessions.ts routes**

  **What to do**:
  - Rename `be/src/routes/batches.ts` to `sessions.ts`
  - Update route paths from `/batches` to `/sessions`
  - Update all route handlers:
    - `GET /sessions` - Get all sessions (with queueId, status filters)
    - `GET /sessions/:id` - Get single session
    - `POST /sessions` - Create new session (use createSession validator)
    - `PATCH /sessions/:id` - Update session (use updateSession validator)
    - `DELETE /sessions/:id` - Soft delete session (use session service)
    - `GET /sessions/:id/statuses` - Get session statuses
  - Add new route: `PATCH /sessions/:id/lifecycle` - Update session lifecycle status
  - Update all service imports (session.service instead of batch.service)
  - Update all validator imports (session.validator instead of batch.validator)
  - Update SSE broadcasts to use `session_*` event types
  - Update response messages to use "session" instead of "batch"
  - Ensure all responses use snake_case (no mapping needed per user preference)

  **Must NOT do**:
  - Keep any /batches routes (no backward compatibility per user decision)
  - Use camelCase in responses (snake_case per user preference)
  - Create mapping layer (return DB rows directly)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Multiple route updates, new lifecycle endpoint, SSE integration
  - **Skills**: None required
    - Hono route patterns and service integration are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 18, 19, 20)
  - **Blocks**: Task 20 (index.ts route registration)
  - **Blocked By**: Tasks 8, 12 (validators and session service must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/routes/batches.ts:18-163` - Existing batch routes to rename and update
  - `be/src/routes/queues.ts:84-107` - Queue route patterns (POST, PUT, SSE broadcast)
  - `be/src/middleware/response.ts` - Response format {success, data, message}
  - `be/src/middleware/validation.ts` - Validation middleware usage

  **API/Type References** (contracts to implement against):
  - Task 8 validators - createSessionSchema, updateSessionSchema, lifecycleUpdateSchema
  - Task 9 DTO types - Session response type
  - `docs/queue_system_refactor_prompt_v_2.md:240-246` - Sessions API routes

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Hono route handlers: https://hono.dev/docs/api/routing
  - Hono c.json response: https://hono.dev/docs/api/context

  **WHY Each Reference Matters** (explain the relevance):
  - Existing batch routes show patterns to follow for route structure
  - Queue routes demonstrate SSE broadcast integration
  - Validators and DTOs provide exact input/output contracts
  - Refactor doc specifies exact API routes to implement

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `batches.ts` renamed to `sessions.ts`
  - [ ] `GET /sessions` route exists
  - [ ] `GET /sessions/:id` route exists
  - [ ] `POST /sessions` route exists (creates session with session_number)
  - [ ] `PATCH /sessions/:id` route exists
  - [ ] `PATCH /sessions/:id/lifecycle` route exists (updates lifecycle status)
  - [ ] `DELETE /sessions/:id` route exists (soft delete)
  - [ ] `GET /sessions/:id/statuses` route exists
  - [ ] No `/batches` routes remain
  - [ ] All SSE broadcasts use `session_*` events
  - [ ] All responses use snake_case
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - session routes compile and exports correctly
    Tool: Bash (ts-node or TypeScript)
    Preconditions: sessions.ts exists
    Steps:
      1. Run `cd be && npx tsx -e "import { sessionRoutes } from './src/routes/sessions.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-17-sessions-routes-import.log

  Scenario: Edge case - verify /batches routes are gone
    Tool: Bash (grep)
    Preconditions: sessions.ts exists
    Steps:
      1. Run `grep -c "batches" be/src/routes/sessions.ts`
    Expected Result: Count = 0 (no batch terminology)
    Failure Indicators: batch terminology still present
    Evidence: .sisyphus/evidence/task-17-no-batch-routes.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-17-sessions-routes-import.log`: TypeScript import test output
  - [ ] `task-17-no-batch-routes.log`: grep results showing batch routes removed

  **Commit**: NO (part of Wave 5 group commit)

- [ ] 18. **Update queue-items.ts routes for sessions**

  **What to do**:
  - Update `be/src/routes/queue-items.ts` to work with sessions
  - Add new route: `POST /sessions/:sessionId/items` - Create queue item for specific session
  - Update existing routes:
    - `GET /sessions/:sessionId/items` - Get all items for session (replace current /queues/:id/items)
    - `GET /items/:id` - Get single item (new)
    - `PATCH /items/:id` - Update item
    - `PATCH /items/:id/status` - Update item status only (new)
    - `DELETE /items/:id` - Delete item
  - Update service imports (queue-item.service)
  - Update validator imports (queue-item.validator)
  - Update all input validations to use sessionId
  - Update SSE broadcasts to use `item_created`, `item_updated`, `item_status_changed`, `item_deleted`
  - Remove deprecated route: `GET /queues/:id/items` (replaced by session-based routes)

  **Must NOT do**:
  - Keep batchId in route parameters or request bodies
  - Use camelCase in responses
  - Keep old `/queues/:id/items` route

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Multiple route updates, new session-scoped routes, SSE integration
  - **Skills**: None required
    - Hono route patterns and service integration are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 17, 19, 20)
  - **Blocks**: Task 20 (index.ts route registration)
  - **Blocked By**: Tasks 8, 13 (validators and queue-item service must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/routes/queue-items.ts` - Existing queue-item routes to update
  - `be/src/routes/queues.ts:199-220` - Current /queues/:id/items route to replace

  **API/Type References** (contracts to implement against):
  - Task 8 validators - Queue item input schemas
  - Task 9 DTO types - Queue item response type
  - `docs/queue_system_refactor_prompt_v_2.md:252-257` - Items API routes

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Hono route handlers: https://hono.dev/docs/api/routing
  - Hono c.param: https://hono.dev/docs/api/context

  **WHY Each Reference Matters** (explain the relevance):
  - Existing queue-item routes show patterns to follow for route structure
  - Validators and DTOs provide exact input/output contracts
  - Refactor doc specifies exact API routes to implement

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `POST /sessions/:sessionId/items` route exists
  - [ ] `GET /sessions/:sessionId/items` route exists
  - [ ] `GET /items/:id` route exists (new)
  - [ ] `PATCH /items/:id/status` route exists (new, updates status only)
  - [ ] `PATCH /items/:id` route exists
  - [ ] `DELETE /items/:id` route exists
  - [ ] All route handlers use sessionId parameter
  - [ ] SSE broadcasts use `item_*` events including `item_status_changed`
  - [ ] All responses use snake_case
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - queue-items routes compile and exports correctly
    Tool: Bash (ts-node or TypeScript)
    Preconditions: queue-items.ts updated
    Steps:
      1. Run `cd be && npx tsx -e "import { queueItemRoutes } from './src/routes/queue-items.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-18-queueitems-routes-import.log

  Scenario: Edge case - verify session-scoped routes exist
    Tool: Bash (grep)
    Preconditions: queue-items.ts updated
    Steps:
      1. Run `grep -c "/sessions/:sessionId/items" be/src/routes/queue-items.ts`
    Expected Result: Count > 0 (session-scoped routes exist)
    Failure Indicators: No session-scoped routes
    Evidence: .sisyphus/evidence/task-18-session-scoped-routes.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-18-queueitems-routes-import.log`: TypeScript import test output
  - [ ] `task-18-session-scoped-routes.log`: grep results for session-scoped routes

  **Commit**: NO (part of Wave 5 group commit)

- [ ] 19. **Update statuses.ts routes for session statuses**

  **What to do**:
  - Update `be/src/routes/statuses.ts` to work with session statuses
  - Update route paths:
    - `GET /statuses` → `GET /session-statuses` (or keep as /statuses if backward compatibility needed)
    - `GET /statuses/:id` → `GET /session-statuses/:id`
    - `POST /statuses` → Keep for template statuses (no change)
  - Update session status routes:
    - `GET /sessions/:sessionId/statuses` - Get all statuses for session (move from batches/:id/statuses)
    - `PATCH /session-statuses/:id` - Update session status
  - Update service imports (status.service)
  - Update validator imports (status.validator if exists)
  - Update SSE broadcasts to use `session_status_created`, `session_status_updated`, `session_status_deleted`

  **Must NOT do**:
  - Keep batchId references in route handlers
  - Use camelCase in responses

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple route updates following existing patterns
  - **Skills**: None required
    - Hono route patterns and service integration are established

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 17, 18, 20)
  - **Blocks**: Task 20 (index.ts route registration)
  - **Blocked By**: Tasks 8, 15 (validators and status service must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/routes/statuses.ts` - Existing status routes to update
  - `be/src/routes/batches.ts:66-80` - Current batches/:id/statuses route to adapt

  **API/Type References** (contracts to implement against):
  - Task 9 DTO types - Session status response type
  - `docs/queue_system_refactor_prompt_v_2.md:248-250` - Session statuses API routes

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Hono route handlers: https://hono.dev/docs/api/routing

  **WHY Each Reference Matters** (explain the relevance):
  - Existing status routes show patterns to follow for route structure
  - Batches routes show session status query patterns
  - DTOs provide exact output contracts
  - Refactor doc specifies exact API routes to implement

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `GET /sessions/:sessionId/statuses` route exists
  - [ ] `PATCH /session-statuses/:id` route exists
  - [ ] All SSE broadcasts use `session_status_*` events
  - [ ] All responses use snake_case
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - status routes compile and exports correctly
    Tool: Bash (ts-node or TypeScript)
    Preconditions: statuses.ts updated
    Steps:
      1. Run `cd be && npx tsx -e "import { statusRoutes } from './src/routes/statuses.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-19-status-routes-import.log

  Scenario: Edge case - verify session status route exists
    Tool: Bash (grep)
    Preconditions: statuses.ts updated
    Steps:
      1. Run `grep -c "/sessions/:sessionId/statuses" be/src/routes/statuses.ts`
    Expected Result: Count > 0 (session status route exists)
    Failure Indicators: No session status route
    Evidence: .sisyphus/evidence/task-19-session-status-route.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-19-status-routes-import.log`: TypeScript import test output
  - [ ] `task-19-session-status-route.log`: grep results for session status route

  **Commit**: NO (part of Wave 5 group commit)

- [ ] 20. **Update main index.ts route registration**

  **What to do**:
  - Update `be/src/index.ts` route registration
  - Remove old import: `import { batchRoutes } from './routes/batches.js';`
  - Add new import: `import { sessionRoutes } from './routes/sessions.js';`
  - Remove old route: `app.route('/batches', batchRoutes);`
  - Add new route: `app.route('/sessions', sessionRoutes);`
  - Verify all other route imports are correct:
    - queueRoutes (sessions.ts renamed, but queueRoutes stays)
    - queueItemRoutes (updated in Task 18)
    - statusRoutes (updated in Task 19)
    - templateRoutes (unchanged)
    - sseRoutes (to be updated in Task 22)
  - Verify route order is correct (no conflicts)

  **Must NOT do**:
  - Keep /batches route registered
  - Change route order that causes conflicts
  - Remove other necessary routes

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple import and route registration updates
  - **Skills**: None required
    - Hono route registration is straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 5 (with Tasks 17, 18, 19)
  - **Blocks**: Tasks 21, 22 (SSE updates use running server)
  - **Blocked By**: Tasks 17, 18, 19 (all route files must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/index.ts:6-14` - Current route imports
  - `be/src/index.ts:36-43` - Current route registration

  **API/Type References** (contracts to implement against):
  - N/A - Route registration, no API contracts

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Hono app.route: https://hono.dev/docs/api/routing

  **WHY Each Reference Matters** (explain the relevance):
  - Current index.ts shows exact pattern for route registration
  - Route imports show what needs to be changed

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] batchRoutes import removed
  - [ ] sessionRoutes import added
  - [ ] `/batches` route registration removed
  - [ ] `/sessions` route registration added
  - [ ] All other route imports remain (queueRoutes, queueItemRoutes, statusRoutes, templateRoutes, sseRoutes)
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds
  - [ ] Server starts: `pnpm dev:be` runs without errors

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - index.ts compiles and server starts
    Tool: Bash (pnpm)
    Preconditions: index.ts updated
    Steps:
      1. Run `cd be && pnpm build`
      2. Run `timeout 5 pnpm dev:be 2>&1 | head -20`
    Expected Result: Build succeeds, server starts without errors
    Failure Indicators: TypeScript errors, server startup errors
    Evidence: .sisyphus/evidence/task-20-server-startup.log

  Scenario: Edge case - verify /batches route is not registered
    Tool: Bash (grep)
    Preconditions: index.ts updated
    Steps:
      1. Run `grep "batches" be/src/index.ts`
    Expected Result: No matches found (batches import and route removed)
    Failure Indicators: batches import or route still present
    Evidence: .sisyphus/evidence/task-20-no-batches-route.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-20-server-startup.log`: Server startup output
  - [ ] `task-20-no-batches-route.log`: grep results showing batches removed

  **Commit**: NO (part of Wave 5 group commit)

- [ ] 21. **Update SSE broadcaster event types**

  **What to do**:
  - Update `be/src/sse/broadcaster.ts` SSE event type definitions
  - Rename event types in SSEEvent interface:
    - Remove: `batch_created`, `batch_updated`, `batch_deleted`
    - Add: `session_created`, `session_updated`, `session_deleted`
    - Add: `session_paused`, `session_resumed`, `session_closed` (lifecycle events)
    - Rename: `queue_status_*` → `session_status_created`, `session_status_updated`, `session_status_deleted`
    - Keep: `queue_created`, `queue_updated`, `queue_deleted`
    - Keep: `queue_item_created`, `queue_item_updated`, `queue_item_deleted` (keep queue_item prefix)
    - Keep: `template_created`, `template_updated`, `template_deleted`
    - Keep: `status_created`, `status_updated`, `status_deleted` (for template statuses)
    - Keep: `board_updated`, `board_deleted`
  - Update event type union to include all new session events
  - Ensure all event payloads use snake_case (no mapping needed per user preference)
  - Update event comments to reflect session terminology

  **Must NOT do**:
  - Keep any `batch_*` event types
  - Use camelCase in event payloads
  - Create mapping layer for event data

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: SSE event type system is core to real-time functionality
  - **Skills**: None required
    - SSE event patterns are established in codebase

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 22, 23, 24)
  - **Blocks**: Task 22 (SSE routes use updated event types)
  - **Blocked By**: Task 9 (DTO types provide snake_case structure)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/sse/broadcaster.ts:15-39` - Current SSE event type definitions
  - `be/src/sse/broadcaster.ts:143-207` - Broadcast function implementation

  **API/Type References** (contracts to implement against):
  - Task 11 SSE mapping doc - Documented SSE event types
  - `docs/queue_system_refactor_prompt_v_2.md:267-287` - SSE event specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - MDN SSE: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

  **WHY Each Reference Matters** (explain the relevance):
  - Existing SSE implementation shows event type patterns to follow
  - SSE mapping doc and refactor doc specify exact event types to implement

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `batch_created`, `batch_updated`, `batch_deleted` events removed
  - [ ] `session_created`, `session_updated`, `session_deleted` events added
  - [ ] `session_paused`, `session_resumed`, `session_closed` events added
  - [ ] `session_status_created`, `session_status_updated`, `session_status_deleted` events added
  - [ ] All event types in union
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - SSE broadcaster compiles and exports correctly
    Tool: Bash (ts-node or TypeScript)
    Preconditions: broadcaster.ts updated
    Steps:
      1. Run `cd be && npx tsx -e "import { sseBroadcaster } from './src/sse/broadcaster.js'; console.log('OK')"`
    Expected Result: No import errors, "OK" printed
    Failure Indicators: Import errors, TypeScript errors
    Evidence: .sisyphus/evidence/task-21-sse-broadcaster-import.log

  Scenario: Edge case - verify batch events are gone
    Tool: Bash (grep)
    Preconditions: broadcaster.ts updated
    Steps:
      1. Run `grep "batch_" be/src/sse/broadcaster.ts`
    Expected Result: No matches found (batch events removed)
    Failure Indicators: batch_* events still present
    Evidence: .sisyphus/evidence/task-21-no-batch-events.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-21-sse-broadcaster-import.log`: TypeScript import test output
  - [ ] `task-21-no-batch-events.log`: grep results showing batch events removed

  **Commit**: NO (part of Wave 6 group commit)

- [ ] 22. **Update SSE index.ts endpoint paths**

  **What to do**:
  - Update `be/src/sse/index.ts` SSE endpoint routes
  - Rename SSE endpoint paths:
    - `/batches/:batchId/stream` → `/sessions/:sessionId/stream`
    - `/items/:itemId/stream` - Add new endpoint (if not exists)
  - Update route parameter names: `batchId` → `sessionId`
  - Update broadcaster calls to use `sessionId` parameter
  - Update endpoint paths in route definitions
  - Ensure all SSE endpoints work with new session IDs

  **Must NOT do**:
  - Keep `/batches` SSE endpoint path
  - Use camelCase in route parameters
  - Remove existing item SSE endpoint (keep if exists)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `quick`
    - Reason: Simple endpoint path updates following existing patterns
  - **Skills**: None required
    - SSE endpoint patterns are established in codebase

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 21, 23, 24)
  - **Blocks**: Task 24 (integration testing uses SSE endpoints)
  - **Blocked By**: Task 21 (SSE event types must be updated)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/sse/index.ts` - Current SSE endpoint routes
  - `be/src/sse/broadcaster.ts:56-97` - addConnection method showing session ID usage

  **API/Type References** (contracts to implement against):
  - Task 11 SSE mapping doc - Documented SSE endpoints
  - `docs/queue_system_refactor_prompt_v_2.md:267-287` - SSE endpoint specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - Hono SSE: https://hono.dev/docs/helpers/streaming
  - MDN SSE: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

  **WHY Each Reference Matters** (explain the relevance):
  - Existing SSE endpoints show patterns to follow for route structure
  - SSE mapping doc and refactor doc specify exact endpoint paths

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `/batches/:batchId/stream` renamed to `/sessions/:sessionId/stream`
  - [ ] `/items/:itemId/stream` endpoint exists (if new)
  - [ ] All route parameters use `sessionId` instead of `batchId`
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds
  - [ ] Server starts: `pnpm dev:be` runs without errors

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - SSE routes compile and server starts
    Tool: Bash (pnpm)
    Preconditions: sse/index.ts updated
    Steps:
      1. Run `cd be && pnpm build`
      2. Run `timeout 5 pnpm dev:be 2>&1 | head -20`
    Expected Result: Build succeeds, server starts without errors
    Failure Indicators: TypeScript errors, SSE route errors
    Evidence: .sisyphus/evidence/task-22-sse-routes-startup.log

  Scenario: Edge case - verify /batches SSE endpoint is gone
    Tool: Bash (grep)
    Preconditions: sse/index.ts updated
    Steps:
      1. Run `grep "/batches" be/src/sse/index.ts`
    Expected Result: No matches found (/batches endpoint removed)
    Failure Indicators: /batches endpoint still present
    Evidence: .sisyphus/evidence/task-22-no-batches-sse.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-22-sse-routes-startup.log`: Server startup output
  - [ ] `task-22-no-batches-sse.log`: grep results showing /batches SSE removed

  **Commit**: NO (part of Wave 6 group commit)

- [ ] 23. **Update all services to broadcast session events**

  **What to do**:
  - Review all service files (`session.service.ts`, `queue-item.service.ts`, `queue.service.ts`, `status.service.ts`, `template.service.ts`)
  - Update all SSE broadcasts to use renamed event types:
    - `batch_created` → `session_created`
    - `batch_updated` → `session_updated`
    - `batch_deleted` → `session_deleted`
    - `status_created` → `session_status_created` (for session statuses)
    - `status_updated` → `session_status_updated`
    - `status_deleted` → `session_status_deleted`
  - Add new lifecycle broadcasts:
    - `session_paused` when status changes to 'paused' (if added)
    - `session_resumed` when status changes from 'paused' to 'active' (if added)
    - `session_closed` when status changes to 'closed'
  - Add item status change broadcast:
    - `item_status_changed` when item status is updated (in addition to item_updated)
  - Verify all broadcasts include correct IDs (sessionId, itemId, queueId)
  - Verify all broadcasts use snake_case payloads

  **Must NOT do**:
  - Keep any `batch_*` broadcasts
  - Use camelCase in broadcast payloads
  - Miss any status change events

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Multiple service updates, SSE integration across services
  - **Skills**: None required
    - SSE broadcast patterns are established in codebase

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 6 (with Tasks 21, 22, 24)
  - **Blocks**: Task 24 (integration testing depends on correct SSE events)
  - **Blocked By**: Tasks 12, 13, 14, 15, 16, 21 (all services and SSE types must be ready)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/services/batch.service.ts` (now session.service.ts) - Batch broadcast patterns
  - `be/src/routes/batches.ts:96-100, 124-128, 151-155` - Broadcast examples in routes

  **API/Type References** (contracts to implement against):
  - Task 11 SSE mapping doc - Documented SSE event types and payloads
  - `docs/queue_system_refactor_prompt_v_2.md:267-287` - SSE event specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - SSE broadcaster usage (from broadcaster.ts)

  **WHY Each Reference Matters** (explain the relevance):
  - Existing service broadcasts show patterns to follow for SSE integration
  - SSE mapping doc specifies exact event types to broadcast
  - Refactor doc specifies SSE events to emit

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] No `batch_created`, `batch_updated`, `batch_deleted` broadcasts in services
  - [ ] `session_created`, `session_updated`, `session_deleted` broadcasts exist
  - [ ] `session_paused`, `session_resumed`, `session_closed` broadcasts exist (if applicable)
  - [ ] `session_status_created`, `session_status_updated`, `session_status_deleted` broadcasts exist
  - [ ] `item_status_changed` broadcast exists when item status changes
  - [ ] All broadcasts use snake_case payloads
  - [ ] TypeScript compiles: `pnpm --filter @antree/backend build` succeeds

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - all services compile without errors
    Tool: Bash (pnpm)
    Preconditions: All services updated
    Steps:
      1. Run `cd be && pnpm build`
    Expected Result: Build succeeds with no TypeScript errors
    Failure Indicators: TypeScript errors, broadcast errors
    Evidence: .sisyphus/evidence/task-23-services-build.log

  Scenario: Edge case - verify no batch broadcasts remain
    Tool: Bash (grep)
    Preconditions: All services updated
    Steps:
      1. Run `grep -r "batch_created\|batch_updated\|batch_deleted" be/src/services/`
    Expected Result: No matches found (batch broadcasts removed)
    Failure Indicators: batch broadcasts still present
    Evidence: .sisyphus/evidence/task-23-no-batch-broadcasts.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-23-services-build.log`: pnpm build output
  - [ ] `task-23-no-batch-broadcasts.log`: grep results showing batch broadcasts removed

  **Commit**: NO (part of Wave 6 group commit)

- [ ] 24. **Verify end-to-end integration**

  **What to do**:
  - Start the backend server: `pnpm dev:be`
  - Wait for server to fully start (check for "Server is running" message)
  - Test database connectivity: Query `queue_sessions` table via Docker
  - Test basic API operations:
    - Create a session via `POST /sessions`
    - Verify session_number is auto-incremented
    - Verify response uses snake_case
    - Get session via `GET /sessions/:id`
    - Update session via `PATCH /sessions/:id`
    - Update lifecycle via `PATCH /sessions/:id/lifecycle`
    - Create item via `POST /sessions/:sessionId/items`
    - Verify queue_number is auto-incremented
    - Get items via `GET /sessions/:sessionId/items`
    - Update item status via `PATCH /items/:id/status`
  - Test SSE endpoints:
    - Connect to `/sse/sessions/:sessionId/stream`
    - Verify `session_created` event is emitted
    - Verify `item_created` event is emitted
    - Verify payloads use snake_case
  - Verify soft delete: Delete session, check `deleted_at` is set
  - Verify old routes return 404: `/batches`, `/batches/:id`

  **Must NOT do**:
  - Skip any API endpoint verification
  - Skip SSE event verification
  - Use manual testing only (all verification via commands)

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `deep`
    - Reason: Complex end-to-end testing across database, API, and SSE
  - **Skills**: None required
    - Integration patterns are straightforward with existing tools

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 6 (with Tasks 21, 22, 23)
  - **Blocks**: Tasks F1-F4 (final verification depends on integration)
  - **Blocked By**: Tasks 17-23 (all routes, services, SSE must be updated)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/index.ts:45-57` - Server startup patterns
  - `be/src/routes/` - All route files for endpoint testing
  - `be/src/sse/` - SSE endpoint for stream testing

  **API/Type References** (contracts to implement against):
  - Task 2 migration SQL - Database structure for queries
  - Task 4 OpenAPI spec - API endpoint contracts
  - Task 11 SSE mapping doc - SSE event contracts

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - curl for API testing: https://curl.se/docs/
  - PostgreSQL \d command for schema verification: https://www.postgresql.org/docs/current/app-psql.html#APP-PSQL-meta-commands

  **WHY Each Reference Matters** (explain the relevance):
  - Server startup shows expected success message
  - Routes provide exact endpoints to test
  - SSE endpoints show stream URLs to connect
  - Migration SQL provides table structure for verification
  - curl and psql commands provide verification tools

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] Server starts successfully: "Server is running" message appears
  - [ ] `queue_sessions` table exists and is queryable
  - [ ] `POST /sessions` creates session with session_number
  - [ ] Session response uses snake_case (session_number, not sessionNumber)
  - [ ] `POST /sessions/:sessionId/items` creates item with queue_number
  - [ ] Item response uses snake_case (queue_number, not queueNumber)
  - [ ] `PATCH /items/:id/status` updates status
  - [ ] SSE `/sessions/:sessionId/stream` connects and emits events
  - [ ] SSE events use `session_created`, `item_created` (not batch_*)
  - [ ] SSE payloads use snake_case
  - [ ] Session soft delete sets `deleted_at` timestamp
  - [ ] `/batches` routes return 404

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - API and SSE integration works end-to-end
    Tool: Bash (curl, docker-compose)
    Preconditions: Server running
    Steps:
      1. Run `curl -s http://localhost:3001/sessions | jq '.data | length'`
      2. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "SELECT COUNT(*) FROM queue_sessions WHERE deleted_at IS NULL;"`
      3. Run `curl -N http://localhost:3001/sse/test-session-id/stream 2>&1 | head -10`
    Expected Result: API returns sessions, DB query returns count, SSE connects
    Failure Indicators: API errors, DB errors, SSE connection errors
    Evidence: .sisyphus/evidence/task-24-e2e-integration.log

  Scenario: Edge case - verify old /batches routes return 404
    Tool: Bash (curl)
    Preconditions: Server running
    Steps:
      1. Run `curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/batches`
    Expected Result: HTTP code 404
    Failure Indicators: 200, 500, or other codes
    Evidence: .sisyphus/evidence/task-24-batches-404.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-24-e2e-integration.log`: curl and psql output
  - [ ] `task-24-batches-404.log`: HTTP code for /batches endpoint

  **Commit**: NO (part of Wave 6 group commit)

- [ ] F1. **Database Schema Verification**

  **What to do**:
  - Connect to database via Docker: `docker-compose exec -T postgres psql -U antree_user -d antree_db -U antree_user -d antree_db`
  - Verify all tables exist with correct schema:
    - `\d queue_sessions` - Check for session_number, started_at, ended_at, deleted_at, status columns
    - `\d queue_session_statuses` - Check for session_id FK (not queue_id)
    - `\d queue_items` - Check for session_id FK (not batch_id)
    - `\d queue_templates` - Verify unchanged
    - `\d queue_template_statuses` - Verify unchanged
    - `\d queues` - Verify unchanged
    - `\d users` - Verify unchanged
  - Verify foreign key relationships:
    - queue_sessions → queues (queue_id FK)
    - queue_sessions → queue_templates (template_id FK)
    - queue_session_statuses → queue_sessions (session_id FK)
    - queue_session_statuses → queue_template_statuses (template_status_id FK)
    - queue_items → queues (queue_id FK)
    - queue_items → queue_sessions (session_id FK)
    - queue_items → queue_session_statuses (status_id FK)
  - Verify indexes exist:
    - Index on queue_sessions.session_number
    - Index on queue_sessions.deleted_at (for filtering)
    - Index on queue_sessions.status (for filtering)
  - Verify cascade behaviors:
    - queue_sessions cascade to queue_session_statuses
    - queue_sessions cascade to queue_items
    - queue_session_statuses restrict delete when referenced by queue_items
  - Verify old tables don't exist:
    - `\dt queue_batches` - Should return "No relations found"
    - `\dt queue_statuses` - Should return "No relations found"
  - Count records in queue_sessions table

  **Must NOT do**:
  - Modify database schema
  - Create or drop tables
  - Skip any table verification

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `oracle`
    - Reason: Comprehensive schema verification requires deep analysis
  - **Skills**: None required
    - PostgreSQL \d command is standard

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: FINAL Wave (with F2, F3, F4)
  - **Blocks**: None (final verification tasks are independent)
  - **Blocked By**: Task 24 (all implementation must be complete)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/db/schema.ts:60-180` - Schema definitions for verification
  - `docs/queue_system_refactor_prompt_v_2.md:105-148` - Target schema specification

  **API/Type References** (contracts to implement against):
  - N/A - Database schema verification, no API contracts

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - PostgreSQL \d command: https://www.postgresql.org/docs/current/app-psql.html#APP-PSQL-meta-commands

  **WHY Each Reference Matters** (explain the relevance):
  - Schema definitions provide exact table and column structure to verify
  - Refactor doc specifies target schema to compare against
  - PostgreSQL docs ensure correct \d command usage

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] queue_sessions table exists
  - [ ] queue_sessions has session_number column (integer)
  - [ ] queue_sessions has started_at column (timestamp, nullable)
  - [ ] queue_sessions has ended_at column (timestamp, nullable)
  - [ ] queue_sessions has deleted_at column (timestamp, nullable)
  - [ ] queue_sessions.status is enum (draft | active | closed)
  - [ ] queue_session_statuses table exists
  - [ ] queue_session_statuses has session_id FK pointing to queue_sessions.id
  - [ ] queue_items has session_id FK pointing to queue_sessions.id
  - [ ] All foreign keys have correct cascade behavior
  - [ ] Index exists on queue_sessions.session_number
  - [ ] Index exists on queue_sessions.deleted_at
  - [ ] queue_batches table does NOT exist
  - [ ] queue_statuses table does NOT exist

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - all tables exist with correct schema
    Tool: Bash (docker-compose exec psql)
    Preconditions: Database running, migrations applied
    Steps:
      1. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_sessions"`
      2. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_session_statuses"`
      3. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\d queue_items"`
      4. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\di queue_sessions"`
    Expected Result: All tables exist with correct columns and indexes
    Failure Indicators: Tables missing, columns missing, indexes missing
    Evidence: .sisyphus/evidence/task-F1-tables-schema.log

  Scenario: Edge case - verify old tables are gone
    Tool: Bash (docker-compose exec psql)
    Preconditions: Database running, migrations applied
    Steps:
      1. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\dt queue_batches"`
      2. Run `docker-compose exec -T postgres psql -U antree_user -d antree_db -c "\dt queue_statuses"`
    Expected Result: "No relations found" for both queries
    Failure Indicators: Old tables still exist
    Evidence: .sisyphus/evidence/task-F1-old-tables-gone.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-F1-tables-schema.log`: \d commands output
  - [ ] `task-F1-old-tables-gone.log`: \dt commands showing old tables removed

  **Commit**: NO (part of FINAL Wave verification)

- [ ] F2. **API Routes Verification**

  **What to do**:
  - Test all API endpoints with curl:
    - `GET /sessions` - Verify response structure and snake_case
    - `GET /sessions/:id` - Verify single session response
    - `POST /sessions` - Create session, verify session_number
    - `PATCH /sessions/:id` - Update session name
    - `PATCH /sessions/:id/lifecycle` - Update lifecycle status
    - `DELETE /sessions/:id` - Soft delete session, verify deleted_at
    - `GET /sessions/:sessionId/statuses` - Get session statuses
    - `POST /sessions/:sessionId/items` - Create item in session
    - `GET /items/:id` - Get single item
    - `PATCH /items/:id` - Update item
    - `PATCH /items/:id/status` - Update item status only
    - `DELETE /items/:id` - Delete item
  - Verify old routes return 404:
    - `GET /batches` - Should return 404
    - `POST /batches` - Should return 404
  - Verify all responses use snake_case (session_number, not sessionNumber)
  - Verify all responses include {success, data, message} structure
  - Check for any 500 errors

  **Must NOT do**:
  - Skip any endpoint verification
  - Accept camelCase responses (verify snake_case)
  - Ignore 500 errors

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: Comprehensive API testing across multiple endpoints
  - **Skills**: None required
    - curl and jq are standard tools

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: FINAL Wave (with F1, F3, F4)
  - **Blocks**: None (final verification tasks are independent)
  - **Blocked By**: Task 24 (all implementation must be complete)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/routes/sessions.ts` - Session route definitions
  - `be/src/routes/queue-items.ts` - Queue item route definitions
  - `be/src/middleware/response.ts` - Response format {success, data, message}

  **API/Type References** (contracts to implement against):
  - Task 4 OpenAPI spec - API endpoint contracts
  - `docs/queue_system_refactor_prompt_v_2.md:232-264` - API routes specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - curl manual: https://curl.se/docs/
  - jq manual: https://stedolan.github.io/jq/

  **WHY Each Reference Matters** (explain the relevance):
  - Route files provide exact endpoints to test
  - Response middleware shows expected structure
  - OpenAPI spec provides expected response shapes
  - curl and jq provide testing tools

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `GET /sessions` returns 200 with snake_case properties
  - [ ] `POST /sessions` creates session with session_number
  - [ ] `PATCH /sessions/:id/lifecycle` updates lifecycle status
  - [ ] `POST /sessions/:sessionId/items` creates item with queue_number
  - [ ] `GET /items/:id` returns item with snake_case properties
  - [ ] `PATCH /items/:id/status` updates item status
  - [ ] `GET /batches` returns 404
  - [ ] `POST /batches` returns 404
  - [ ] All successful responses include {success, data, message}
  - [ ] All responses use snake_case (no camelCase)

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - all session and item routes work correctly
    Tool: Bash (curl)
    Preconditions: Server running, data exists
    Steps:
      1. Run `curl -s http://localhost:3001/sessions | jq '.success, .data[0].session_number'`
      2. Run `curl -s -X POST http://localhost:3001/sessions -H "Content-Type: application/json" -d '{"queue_id":"test","name":"Test Session"}' | jq '.success, .data.session_number'`
      3. Run `curl -s http://localhost:3001/items/test-item-id | jq '.success, .data.queue_number'`
    Expected Result: All requests return success=true, snake_case properties present
    Failure Indicators: 404 errors, 500 errors, camelCase properties
    Evidence: .sisyphus/evidence/task-F2-api-routes-test.log

  Scenario: Negative - old /batches routes return 404
    Tool: Bash (curl)
    Preconditions: Server running
    Steps:
      1. Run `curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/batches`
      2. Run `curl -s -w "%{http_code}" -o /dev/null -X POST http://localhost:3001/batches -H "Content-Type: application/json" -d '{}'`
    Expected Result: Both return 404
    Failure Indicators: 200, 500, or other codes
    Evidence: .sisyphus/evidence/task-F2-old-routes-404.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-F2-api-routes-test.log`: curl and jq output
  - [ ] `task-F2-old-routes-404.log`: HTTP codes for old routes

  **Commit**: NO (part of FINAL Wave verification)

- [ ] F3. **SSE Events Verification**

  **What to do**:
  - Connect to SSE streams and verify events:
    - Connect to `/sse/sessions/:sessionId/stream` for a valid session ID
    - Verify `session_created` event is emitted when session is created
    - Verify `session_updated` event is emitted when session is updated
    - Verify `session_deleted` event is emitted when session is soft-deleted
    - Verify `session_closed` event is emitted when lifecycle changes to 'closed'
    - Connect to `/sse/items/:itemId/stream` for a valid item ID
    - Verify `item_created` event is emitted when item is created
    - Verify `item_status_changed` event is emitted when item status is updated
    - Verify `item_deleted` event is emitted when item is deleted
  - Verify no `batch_*` events are emitted:
    - Ensure `batch_created`, `batch_updated`, `batch_deleted` are not present
  - Verify all SSE payloads use snake_case (session_number, not sessionNumber)
  - Verify event data structure is correct

  **Must NOT do**:
  - Accept `batch_*` events (verify they don't exist)
  - Accept camelCase in payloads (verify snake_case)
  - Skip any event type verification

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `unspecified-high`
    - Reason: SSE event testing across multiple event types
  - **Skills**: None required
    - curl is standard for SSE testing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: FINAL Wave (with F1, F2, F4)
  - **Blocks**: None (final verification tasks are independent)
  - **Blocked By**: Task 24 (all implementation must be complete)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/sse/broadcaster.ts:143-207` - Broadcast function implementation
  - `be/src/sse/index.ts` - SSE endpoint routes
  - Task 11 SSE mapping doc - Documented SSE event types

  **API/Type References** (contracts to implement against):
  - `docs/queue_system_refactor_prompt_v_2.md:267-287` - SSE events specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - MDN SSE: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

  **WHY Each Reference Matters** (explain the relevance):
  - SSE broadcaster shows event type patterns to verify
  - SSE routes provide endpoint URLs to connect
  - SSE mapping doc specifies exact events to verify
  - Refactor doc specifies SSE events to emit

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `/sse/sessions/:sessionId/stream` connects successfully
  - [ ] `session_created` event is emitted with snake_case payload
  - [ ] `session_updated` event is emitted with snake_case payload
  - [ ] `session_deleted` event is emitted with snake_case payload
  - [ ] `session_closed` event is emitted when lifecycle changes
  - [ ] `item_created` event is emitted with snake_case payload
  - [ ] `item_status_changed` event is emitted when status updates
  - [ ] No `batch_created`, `batch_updated`, `batch_deleted` events in stream
  - [ ] All event payloads use snake_case (no camelCase)

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BEJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - session and item SSE events work correctly
    Tool: Bash (curl)
    Preconditions: Server running, session and item data exists
    Steps:
      1. Run `curl -N http://localhost:3001/sse/test-session-id/stream 2>&1 | timeout 5 cat | head -20`
      2. Create a session: `curl -s -X POST http://localhost:3001/sessions -H "Content-Type: application/json" -d '{"queue_id":"test","name":"Test"}' > /dev/null`
      3. Check SSE stream for session_created event
    Expected Result: SSE stream connects, session_created event with snake_case payload appears
    Failure Indicators: Connection errors, no events, camelCase in payload
    Evidence: .sisyphus/evidence/task-F3-sse-events.log

  Scenario: Negative - no batch_* events are emitted
    Tool: Bash (grep)
    Preconditions: SSE stream connected
    Steps:
      1. Capture SSE stream output to file: `curl -N http://localhost:3001/sse/test-session-id/stream 2>&1 | timeout 5 tee /tmp/sse-output.log > /dev/null`
      2. Run `grep "batch_" /tmp/sse-output.log`
    Expected Result: No matches found (batch events not emitted)
    Failure Indicators: batch_* events present
    Evidence: .sisyphus/evidence/task-F3-no-batch-events.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-F3-sse-events.log`: SSE stream output
  - [ ] `task-F3-no-batch-events.log`: grep results showing no batch events

  **Commit**: NO (part of FINAL Wave verification)

- [ ] F4. **Documentation Completeness Check**

  **What to do**:
  - Verify all deliverables exist:
    - `docs/queue-session-migration.sql` exists
    - `docs/queue-session-erd.png` exists and is valid PNG
    - `docs/queue-session-openapi.yaml` exists and is valid YAML
    - `docs/sse-mapping.md` exists and documents all events
    - `be/src/types/session.dto.ts` exists and exports all types
  - Verify AGENTS.md is updated with new terminology:
    - Check for queue_sessions references
    - Check for session terminology instead of batch
  - Verify README.md is updated if it has API documentation
  - Run SQL migration to ensure it's valid and can be applied
  - Verify ERD diagram matches database schema
  - Verify OpenAPI spec matches API routes
  - Verify SSE mapping matches SSE broadcaster events

  **Must NOT do**:
  - Create missing deliverables (verify and report issues only)
  - Modify deliverables unless they're clearly incorrect

  **Recommended Agent Profile**:
  > Select category + skills based on task domain. Justify each choice.
  - **Category**: `deep`
    - Reason: Comprehensive documentation verification across multiple deliverables
  - **Skills**: None required
    - File verification and validation are straightforward

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: FINAL Wave (with F1, F2, F3)
  - **Blocks**: None (final verification tasks are independent)
  - **Blocked By**: Task 24 (all implementation must be complete)

  **References** (CRITICAL - Be Exhaustive):

  > The executor has NO context from your interview. References are their ONLY guide.
  > Each reference must answer: "What should I look at and WHY?"

  **Pattern References** (existing code to follow):
  - `be/src/db/schema.ts` - Database schema for ERD verification
  - `be/src/routes/` - API routes for OpenAPI verification
  - `be/src/sse/broadcaster.ts` - SSE events for SSE mapping verification
  - `docs/` - Existing documentation structure

  **API/Type References** (contracts to implement against):
  - Task 2-4 deliverables - Reference for completeness
  - `docs/queue_system_refactor_prompt_v_2.md:289-298` - Deliverables specification

  **Test References** (testing patterns to follow):
  - N/A - No test infrastructure

  **External References** (libraries and frameworks):
  - YAML spec: https://yaml.org/spec/

  **WHY Each Reference Matters** (explain the relevance):
  - Schema and routes provide actual implementation to compare with docs
  - Deliverable tasks provide expected content to verify
  - Refactor doc specifies required deliverables

  **Acceptance Criteria**:

  > **AGENT-EXECUTABLE VERIFICATION ONLY** — No human action permitted.
  > Every criterion MUST be verifiable by running a command or using a tool.

  - [ ] `docs/queue-session-migration.sql` exists
  - [ ] `docs/queue-session-erd.png` exists and is valid PNG
  - [ ] `docs/queue-session-openapi.yaml` exists and is valid YAML
  - [ ] `docs/sse-mapping.md` exists and documents all events
  - [ ] `be/src/types/session.dto.ts` exists and exports types
  - [ ] Migration SQL runs successfully via docker-compose exec
  - [ ] All required deliverables present

  **QA Scenarios (MANDATORY — task is INCOMPLETE without these):**

  > **This is NOT optional. A task without QA scenarios WILL BE REJECTED.**
  >
  > Write scenario tests that verify the ACTUAL BEHAVIOR of what you built.
  > Minimum: 1 happy path + 1 failure/edge case per task.
  > Each scenario = exact tool + exact steps + exact assertions + evidence path.

  \`\`\`
  Scenario: Happy path - all deliverables exist and are valid
    Tool: Bash (file, grep)
    Preconditions: All implementation complete
    Steps:
      1. Run `ls -lh docs/queue-session-* docs/sse-mapping.md`
      2. Run `file docs/queue-session-erd.png`
      3. Run `python -c "import yaml; yaml.safe_load(open('docs/queue-session-openapi.yaml'))"`
      4. Run `ls -lh be/src/types/session.dto.ts`
    Expected Result: All files exist, ERD is PNG, OpenAPI is valid YAML
    Failure Indicators: Files missing, invalid file formats
    Evidence: .sisyphus/evidence/task-F4-deliverables-check.log

  Scenario: Edge case - verify documentation completeness
    Tool: Bash (grep)
    Preconditions: All documentation exists
    Steps:
      1. Run `grep -c "session_created" docs/sse-mapping.md`
      2. Run `grep -c "/sessions" docs/queue-session-openapi.yaml`
      3. Run `grep "queue_sessions" docs/queue-session-migration.sql`
    Expected Result: All references present (count > 0)
    Failure Indicators: Missing references, incomplete documentation
    Evidence: .sisyphus/evidence/task-F4-doc-completeness.log
  \`\`\`

  **Evidence to Capture**:
  - [ ] `task-F4-deliverables-check.log`: File listing and validation output
  - [ ] `task-F4-doc-completeness.log`: grep results for key references

  **Commit**: NO (part of FINAL Wave verification)

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Database Schema Verification** — `oracle`
  Connect to database via Docker. Verify all tables exist with correct schema:
  - `queue_sessions` has `session_number`, `started_at`, `ended_at`, `deleted_at`, `status` (lifecycle)
  - `queue_session_statuses` renamed from `queue_statuses`
  - `queue_items` has `session_id` FK
  - Verify foreign key relationships and cascade behavior
  - Verify indexes exist on `session_number`, `is_active`, `deleted_at`
  Output: `Tables [N/N] | Columns [N/N] | FKs [N/N] | Indexes [N/N] | VERDICT`

- [ ] F2. **API Routes Verification** — `unspecified-high`
  Test all API endpoints with curl:
  - GET/POST/PATCH/DELETE `/sessions` work correctly
  - `PATCH /sessions/:id/lifecycle` works
  - `POST /sessions/:sessionId/items` creates items
  - `GET /items/:id` returns single item
  - `PATCH /items/:id/status` updates status
  - Old `/batches` routes return 404
  - All responses use snake_case
  - All responses include {success, data, message}
  Output: `Endpoints [N/N] | Responses [N/N snake_case] | OldRoutes [404] | VERDICT`

- [ ] F3. **SSE Events Verification** — `unspecified-high`
  Connect to SSE streams and verify events:
  - `/sessions/:sessionId/stream` emits `session_created`, `session_updated`, `session_deleted`
  - Lifecycle events: `session_paused`, `session_resumed`, `session_closed`
  - `/items/:itemId/stream` emits item events
  - Event payloads use snake_case
  - No `batch_*` events emitted
  Output: `SessionEvents [N/N] | ItemEvents [N/N] | Payloads [snake_case] | VERDICT`

- [ ] F4. **Documentation Completeness Check** — `deep`
  Verify all deliverables exist and are accurate:
  - `docs/queue-session-migration.sql` exists and runs successfully
  - `docs/queue-session-erd.png` exists with all tables/relationships
  - `docs/queue-session-openapi.yaml` has all endpoints and types
  - `docs/sse-mapping.md` documents all SSE events
  - `be/src/types/session.dto.ts` has all DTO types
  - AGENTS.md and README.md updated for new terminology
  Output: `Deliverables [N/N] | Documentation [N/N] | VERDICT`

---

## Commit Strategy

- **1**: `feat(refactor): commit existing system before session refactor` — no files
- **2**: `feat(refactor): create session migration and documentation` — docs/*.sql, docs/*.png, docs/*.yaml, docs/*.md
- **3**: `feat(refactor): update database schema to session-based` — be/src/db/schema.ts
- **4**: `feat(refactor): apply migration to database` — drizzle migration files
- **5**: `feat(refactor): add session validators and DTO types` — be/src/validators/*.ts, be/src/types/*.ts
- **6**: `feat(refactor): update services for session architecture` — be/src/services/*.ts
- **7**: `feat(refactor): rename and update session routes` — be/src/routes/sessions.ts, be/src/routes/queue-items.ts, be/src/routes/index.ts
- **8**: `feat(refactor): update SSE for session events` — be/src/sse/*.ts
- **9**: `docs(refactor): update documentation for sessions` — AGENTS.md, README.md

---

## Success Criteria

### Verification Commands

```bash
# Database schema verification
docker-compose exec -T postgres psql -U antree_user -d antree_db -U antree_user -d antree_db -c "\d queue_sessions"
# Expected: Columns include session_number, started_at, ended_at, deleted_at, status

docker-compose exec -T postgres psql -U antree_user -d antree_db -U antree_user -d antree_db -c "\d queue_session_statuses"
# Expected: Table exists (renamed from queue_statuses)

docker-compose exec -T postgres psql -U antree_user -d antree_db -U antree_user -d antree_db -c "\d queue_items"
# Expected: Has session_id FK (not batch_id)

# API routes verification
curl -s http://localhost:3001/sessions | jq '.data[0].session_number'
# Expected: Integer value exists

curl -s -X PATCH http://localhost:3001/sessions/test-id/lifecycle \
  -H "Content-Type: application/json" \
  -d '{"status":"closed"}' | jq '.data.status'
# Expected: "closed"

curl -s -w "%{http_code}" -o /dev/null http://localhost:3001/batches
# Expected: 404

# SSE events verification
curl -N http://localhost:3001/sse/sessions/test-id/stream | grep "session_created"
# Expected: session_created event emitted

curl -N http://localhost:3001/sse/sessions/test-id/stream | grep "batch_"
# Expected: No batch_* events
```

### Final Checklist
- [ ] All `queueBatches` references renamed to `queue_sessions`
- [ ] All `queueStatuses` references renamed to `queue_session_statuses`
- [ ] Session numbering auto-increments per queue
- [ ] Queue numbering auto-increments per session
- [ ] Soft delete with `deleted_at` timestamp implemented
- [ ] Items soft-delete when session soft-deletes
- [ ] All API routes use `/sessions` (no `/batches`)
- [ ] SSE events use `session_*` (no `batch_*`)
- [ ] API responses use snake_case
- [ ] All documentation deliverables created
- [ ] All QA scenarios pass
- [ ] Database migration successful
