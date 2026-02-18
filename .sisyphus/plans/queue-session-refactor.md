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
   - [ ] `task-F2-endpoints-test.log`: curl test output
   - [ ] `task-F2-old-routes-404.log`: HTTP codes for /batches routes
   - [ ] `task-F2-snake_case-check.log`: Verification of snake_case responses

   **Commit**: NO (part of FINAL Wave verification)

- [x] F2. **API Routes Verification**

- [ ] F3. **SSE Events Verification**

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

- [x] F4. **Documentation Completeness Check**

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

- [x] F3. **SSE Events Verification** — `unspecified-high`

- [x] F4. **Documentation Completeness Check** — `deep`
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
