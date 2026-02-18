
# Task 5: Issues Encountered

## Date
2026-02-19

## Build Errors (Expected)

### Context
After updating schema.ts, `pnpm --filter @antree/backend build` fails with TypeScript errors in dependent files.

### Root Cause
Multiple files still reference the old table/field names:
- Scripts (simulate-banking-queue-http.ts, simulate-queue-simple.ts, clean-database.ts, seed*.ts)
- Services (batch.service.ts, queue-item.service.ts, queue.service.ts, status.service.ts)
- SSE (sse/index.ts)

### Example Errors
```
src/scripts/clean-database.ts(2,22): error TS2305: Module '"../db/schema.js"' has no exported member 'queueStatuses'.
src/scripts/clean-database.ts(2,37): error TS2305: Module '"../db/schema.js"' has no exported member 'queueBatches'.
src/services/queue-item.service.ts(24,37): error TS2339: Property 'batchId' does not exist on type 'PgTableWithColumns<...>'.
src/services/batch.service.ts(7,10): error TS2305: Module '"../db/schema.js"' has no exported member 'queueBatches'.
```

### Resolution Strategy
- **Not a bug**: This is expected behavior for an incremental refactor
- **Will be fixed in**: Tasks 12-24 (services, routes, SSE updates)
- **Acceptance criteria note**: Schema.ts file itself is syntactically correct; errors are in dependent files

### Verification
1. Verified new fields exist: `session_number`, `started_at`, `ended_at`, `is_deleted`
2. Verified table renames: `queue_sessions`, `queue_session_statuses`
3. Verified field renames: `sessionId` in queueItems
4. Verified FK updates point to correct tables
5. Verified all relations updated correctly
6. Verified type exports renamed correctly

### Decision
Consider Task 5 complete despite build errors. The schema file is correct. Dependent files will be updated in later tasks following the dependency matrix in the plan.

