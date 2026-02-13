# Task 0.4: Create API Contract Documentation

**Status**: ✅ COMPLETED
**Date**: 2026-02-13
**File Created**: `/docs/api-contract.md`

## Summary
Created comprehensive API contract documentation defining QueueService and StatusService endpoints with complete request/response schemas and examples.

## Documentation Structure

### Data Models
- **QueueItem**: id, queueNumber, name, service?, statusId, createdAt, updatedAt, customPayload?
- **QueueStatus**: id, label, color, order

### QueueService Endpoints
1. GET /queues - Get all queues
2. POST /queues - Create new queue
3. PUT /queues/:id - Update queue
4. DELETE /queues/:id - Delete queue

### StatusService Endpoints
1. GET /statuses - Get all statuses
2. POST /statuses - Create status
3. PUT /statuses/:id - Update status
4. DELETE /statuses/:id - Delete status

## Key Features
1. **Complete CRUD**: Both services support full Create, Read, Update, Delete operations
2. **Custom Payload**: QueueItem includes flexible `customPayload?: Record<string, any>` for extensibility
3. **Response Consistency**: All responses follow consistent structure with `success`, `data`, and `message` fields
4. **Error Handling**: Defined error responses with validation details
5. **Status References**: Prevents deletion of statuses referenced by queues (409 Conflict)
6. **Order Management**: Status order determines Kanban column sequence

## Example Data
- Indonesian names in examples (Ahmad Santoso, Siti Rahayu, Budi Hartono)
- UUID v4 format for IDs
- ISO 8601 timestamps
- Hex color codes for status colors

## Documentation Details
- HTTP method and path for each endpoint
- Request schemas with required/optional field annotations
- Response schemas with example JSON
- Error responses (400, 404, 409)
- HTTP status code reference table
- Error response format interface
- Implementation status section (frontend mock vs future backend)
- Notes on customPayload, status references, order management, timestamps, ID format
- Version history

## Files Created
- `/docs/api-contract.md` - Complete API contract documentation (462 lines)

## Verification
✅ File exists in /docs folder
✅ QueueService API contract with all 4 CRUD endpoints
✅ StatusService API contract with all 4 CRUD endpoints
✅ Each endpoint has HTTP method, path, request schema, response schema, example
✅ QueueItem schema includes all required fields (id, queueNumber, name, service?, statusId, createdAt, updatedAt, customPayload?)
✅ QueueStatus schema includes all required fields (id, label, color, order)
✅ Document includes note about frontend mock services vs future backend implementation

## Next Steps
- Task 1: Initialize Vite + React + TypeScript project in /fe directory
