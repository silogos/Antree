# Skill: Simulate Workflow

## Description

This skill enables agents to simulate a complete queue management workflow using curl commands. The agent will:

1. Fetch and display all available queues
2. Present queue list to user for selection
3. Fetch sessions for the selected queue
4. Present session list to user for selection
5. Simulate the full workflow for the selected session with configurable delays

## Prerequisites

- Backend API running at `http://localhost:3001`
- Frontend running at `http://localhost:5173` (optional, for verification)
- `curl` and `jq` installed on the system

## Workflow Steps

### Step 1: Fetch and Display Queues

```bash
# Get all queues
curl -s "http://localhost:3001/queues" | jq '.data[] | {id, name, description}'
```

**Expected Output Format**:
```
{
  "id": "019c6bd5-cbf2-7471-a6d8-b1fe7206f3f9",
  "name": "Customer Support - Priority",
  "description": "High priority support queue"
}
```

### Step 2: User Selects Queue

Use the `question` tool to present queues:

```typescript
question({
  questions: [{
    header: "Select Queue",
    question: "Which queue would you like to simulate workflow for?",
    options: [
      {
        label: "Customer Support - Priority",
        description: "Queue ID: 019c6bd5-cbf2-7471-a6d8-b1fe7206f3f9"
      },
      // ... more queues
    ]
  }]
})
```

### Step 3: Fetch Sessions for Selected Queue

```bash
# Get sessions for a specific queue
QUEUE_ID="019c6bd5-cbf2-7471-a6d8-b1fe7206f3f9"
curl -s "http://localhost:3001/sessions?queueId=${QUEUE_ID}" | jq '.data[] | {id, name, status, sessionNumber}'
```

**Expected Output Format**:
```
{
  "id": "019c8672-11cd-7312-bb7c-83a5893eb893",
  "name": "Test Session",
  "status": "active",
  "sessionNumber": 1
}
```

### Step 4: User Selects Session

Use the `question` tool to present sessions:

```typescript
question({
  questions: [{
    header: "Select Session",
    question: "Which session would you like to simulate workflow for?",
    options: [
      {
        label: "Test Session (#1)",
        description: "Status: active | Session ID: 019c8672-11cd-7312-bb7c-83a5893eb893"
      },
      // ... more sessions
    ]
  }]
})
```

### Step 5: Fetch Session Statuses

```bash
# Get statuses for the selected session
SESSION_ID="019c8672-11cd-7312-bb7c-83a5893eb893"
curl -s "http://localhost:3001/sessions/${SESSION_ID}/statuses" | jq '.data[] | {id, label, color, order}'
```

**Expected Output Format**:
```
{
  "id": "019c8672-11d7-73dd-983c-db2fb47f751e",
  "label": "Waiting",
  "color": "#F59E0B",
  "order": 1
}
```

### Step 6: Simulate Workflow

Create a shell script that:

1. Gets session details
2. Gets session statuses
3. Adds queue items to different statuses
4. Updates queue item statuses
5. Performs session lifecycle operations (pause, resume, complete, archive)

#### Example Simulation Script:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"
SESSION_ID="<selected_session_id>"
DELAY=5  # seconds between operations

# Step 1: Get session details
echo "Step 1: Getting session details..."
curl -s "$BASE_URL/sessions/$SESSION_ID" | jq '.'
sleep $DELAY

# Step 2: Get session statuses and extract IDs
echo "Step 2: Getting session statuses..."
STATUSES=$(curl -s "$BASE_URL/sessions/$SESSION_ID/statuses")
WAITING_ID=$(echo "$STATUSES" | jq -r '.data[0].id')
ASSIGNED_ID=$(echo "$STATUSES" | jq -r '.data[1].id')
IN_PROGRESS_ID=$(echo "$STATUSES" | jq -r '.data[2].id')
ESCALATED_ID=$(echo "$STATUSES" | jq -r '.data[3].id')
RESOLVED_ID=$(echo "$STATUSES" | jq -r '.data[4].id')
CLOSED_ID=$(echo "$STATUSES" | jq -r '.data[5].id')

echo "Status IDs:"
echo "  Waiting: $WAITING_ID"
echo "  Assigned: $ASSIGNED_ID"
echo "  In Progress: $IN_PROGRESS_ID"
echo "  Escalated: $ESCALATED_ID"
echo "  Resolved: $RESOLVED_ID"
echo "  Closed: $CLOSED_ID"
sleep $DELAY

# Step 3: Add queue item to Waiting
echo "Step 3: Adding 'John Doe' to Waiting status..."
curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/items" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"John Doe\",\"statusId\":\"$WAITING_ID\"}" | jq '.'
sleep $DELAY

# Step 4: Add queue item to Assigned
echo "Step 4: Adding 'Customer A' to Assigned status..."
curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/items" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Customer A\",\"statusId\":\"$ASSIGNED_ID\"}" | jq '.'
sleep $DELAY

# Step 5: Add queue item to Escalated
echo "Step 5: Adding 'Alice Williams' to Escalated status..."
curl -s -X POST "$BASE_URL/sessions/$SESSION_ID/items" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"Alice Williams\",\"statusId\":\"$ESCALATED_ID\"}" | jq '.'
sleep $DELAY

# Step 6: Get all queue items
echo "Step 6: Getting all queue items in session..."
curl -s "$BASE_URL/sessions/$SESSION_ID/items" | jq '.data | length, " items found"'
sleep $DELAY

# Step 7: Move first item to In Progress
echo "Step 7: Moving first item to In Progress..."
ITEM_ID=$(curl -s "$BASE_URL/sessions/$SESSION_ID/items" | jq -r '.data[0].id')
echo "Item ID: $ITEM_ID"
curl -s -X PATCH "$BASE_URL/items/$ITEM_ID" \
  -H 'Content-Type: application/json' \
  -d "{\"statusId\":\"$IN_PROGRESS_ID\"}" | jq '.'
sleep $DELAY

# Step 8: Pause session (if active)
echo "Step 8: Pausing the session..."
curl -s -X PATCH "$BASE_URL/sessions/$SESSION_ID/lifecycle" \
  -H 'Content-Type: application/json' \
  -d '{"status":"paused"}' | jq '.data.status'
sleep $DELAY

# Step 9: Resume session
echo "Step 9: Resuming the session..."
curl -s -X PATCH "$BASE_URL/sessions/$SESSION_ID/lifecycle" \
  -H 'Content-Type: application/json' \
  -d '{"status":"active"}' | jq '.data.status'
sleep $DELAY

# Step 10: Complete session
echo "Step 10: Completing the session..."
curl -s -X PATCH "$BASE_URL/sessions/$SESSION_ID/lifecycle" \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}' | jq '.data.status'

echo "========================================"
echo "Workflow Simulation Complete!"
echo "========================================"
```

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/queues` | GET | Get all queues |
| `/sessions?queueId={id}` | GET | Get sessions for a queue |
| `/sessions/{id}` | GET | Get session details |
| `/sessions/{id}/statuses` | GET | Get session-specific statuses |
| `/sessions/{id}/items` | GET | Get all queue items in session |
| `/sessions/{id}/items` | POST | Add queue item to session |
| `/items/{id}` | PATCH | Update queue item |
| `/sessions/{id}/lifecycle` | PATCH | Update session lifecycle |

## Session Lifecycle States

```
draft (initial state)
  ↓ Start
active  ─┬─ Pause ─→ paused
          │
          └─ Complete ─→ completed
                      ↓ Archive
                  archived
```

## Queue Item Status Flow

The default status flow (varies by template):

```
Waiting → Assigned → In Progress → Escalated → Resolved → Closed
```

## Example Usage

```typescript
// When user requests workflow simulation:
// 1. Fetch queues
const queues = await bash({ command: 'curl -s "http://localhost:3001/queues" | jq ".data"' });

// 2. Present to user for selection
const selectedQueue = await question({ questions: [{ header: "Select Queue", question: "Which queue?", options: queueOptions }] });

// 3. Fetch sessions for selected queue
const sessions = await bash({ command: `curl -s "http://localhost:3001/sessions?queueId=${selectedQueue.id}" | jq ".data"` });

// 4. Present to user for selection
const selectedSession = await question({ questions: [{ header: "Select Session", question: "Which session?", options: sessionOptions }] });

// 5. Simulate workflow
await simulateWorkflow(selectedSession.id);
```

## Notes

- Always verify the session is not in `archived` or `completed` state before simulation
- Use configurable delays (default 5 seconds) between operations
- Provide clear, labeled output for each step
- Include frontend URL at the end for manual verification
- Handle errors gracefully and provide meaningful error messages

## Expected Final Output

After completing the workflow, provide:

1. **Session Summary**: Name, status, ID
2. **Operations Performed**: Table of steps with results
3. **Current Queue Items**: Count and distribution by status
4. **Frontend URL**: Link to session detail page
5. **Quick Reference**: Common curl commands for the session
