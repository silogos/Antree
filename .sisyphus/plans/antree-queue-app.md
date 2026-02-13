# Antree Queue Management Web App

## TL;DR

> **Quick Summary**: Build a responsive queue management app with Kanban board, two view modes (Display/Operator), auto-refresh, and auto-movement simulation using Vite + React + TypeScript + Tailwind CSS + shadcn/ui + React Hook Form.
>
> **Deliverables**:
> - Vite + React + TypeScript project initialized in `/fe` directory
> - shadcn/ui components configured and installed
> - React Hook Form (RHF) + Zod validation setup
> - Kanban board with dynamic status columns
> - Queue cards displaying number, name, service, duration, status, customPayload
> - Responsive design for mobile, tablet, desktop, and TV/large screens
> - Display Mode (TV-optimized, fullscreen, auto-refresh)
> - Operator Mode (CRUD for queues, status management, drag & drop, sound toggle)
> - Mock service layer simulating API calls
> - 15-25 dummy queue items with Indonesian names
> - Auto-movement every 15 seconds (stops when all Done)
> - Optional sound effects on queue movement (off by default)
>
> **Estimated Effort**: Large
> **Parallel Execution**: NO - sequential build with some parallel setup
> **Critical Path**: Git init → OpenCode config → API contract docs → Project init → shadcn setup → RHF setup → Types → Data/Services → Core Components → View Modes → Auto-features → Sound effects

---

## Context

### Original Request
Build a Queue Management Web App called "Antree" with Kanban Board layout, optimized for large monitor/TV display. Use Vite + React + TypeScript with dummy/local data (no backend yet). Structure code for easy API integration later.

### Updated Requirements
- **shadcn/ui**: UI component library (Dialog, Button, Input, Select, Card, Badge, Form components)
- **React Hook Form (RHF)**: Form validation with Zod schemas
- **Responsive Design**: Support mobile (< 640px), tablet (640-1024px), desktop (1024-1920px), TV (> 1920px)
- **Custom Payload**: QueueItem has flexible `customPayload?: Record<string, any>` for customization
- **Sound Effects**: Optional sound on queue movement (simple beep, off by default, toggle in Operator Mode)

### Interview Summary

**Key Discussions**:
- **Project Location**: Frontend in `/fe` folder, backend in `/be` folder (future)
- **Drag & Drop**: Library-based (react-beautiful-dnd or dnd-kit)
- **CSS Approach**: Tailwind CSS (via shadcn/ui)
- **UI Library**: shadcn/ui - All components (Dialog, Button, Input, Select, Card, Badge, Form, Switch, Label)
- **Form Validation**: React Hook Form (RHF) + Zod schemas
- **Auto-Movement**: Stop when all queues reach Done status
- **Status Management**: Full CRUD UI included (create, edit, reorder, delete)
- **Empty States**: Display "No queues waiting" message with illustration
- **Package Manager**: pnpm (not npm)
- **Auto-Refresh**: Enabled by default in Display Mode
- **Auto-Movement Interval**: Every 15 seconds
- **Testing Strategy**: No tests needed
- **Default View Mode**: Display Mode on app load
- **Git Initialization**: Initialize git repos in root, `/be`, and `/fe` folders
- **OpenCode Config**: Configure OpenCode for local pnpm usage
- **API Contract**: Define API contract in `/docs/api-contract.md` before implementation
- **Responsive Design**: Must be responsive for all screen sizes
- **Custom Payload**: Single `customPayload?: Record<string, any>` object on QueueItem
- **Sound Effects**: Off by default, simple beep, toggle in Operator Mode

**Research Findings**:
- Project directory is empty except for pre-existing `/fe`, `/be`, and `docs` folders
- Tailwind CSS works well with Vite + React + TypeScript
- shadcn/ui uses copy-paste components with Tailwind styling
- react-beautiful-dnd is widely used for React drag & drop but has TypeScript compatibility; dnd-kit is more modern with better TS support
- Indonesian name data available through open-source datasets

### Metis Review

**Identified Gaps (addressed in plan)**:
- **Project initialization location**: Confirmed `/fe` directory, with Vite project created inside it
- **Drag & drop library selection**: Recommended dnd-kit (better TS support) over react-beautiful-dnd
- **Auto-movement behavior**: Defined - stops when all queues reach Done, manual reset required
- **Status management scope**: Full CRUD UI included, with validation for at least one status
- **Empty state handling**: Message + illustration in both Display and Operator modes
- **Auto-refresh interval**: Set to same as auto-movement (15 seconds) for consistency
- **shadcn/ui setup**: Components use copy-paste, not npm install
- **RHF integration**: Zod schemas for TypeScript safety
- **Responsive breakpoints**: Mobile (< 640px), tablet (640-1024px), desktop (1024-1920px), TV (> 1920px)
- **Custom payload structure**: Single flexible object for extensibility
- **Sound effect implementation**: Browser Audio API for simple beep, toggle control

**Guardrails Applied (Must NOT Have)**:
- No authentication, users, permissions, or security features
- No localStorage, IndexedDB, or persistence (data resets on refresh)
- No real backend integration or external API calls
- No complex animations (particles,3D transforms)
- No multi-language support (English UI only)
- No advanced Kanban features (swimlanes, labels, subtasks)
- No analytics, statistics, or reporting
- No theming system (single high-contrast theme)
- No admin dashboard beyond Operator Mode

**Removed Guardrails (updated requirements)**:
- ~~No form validation libraries~~ - NOW using React Hook Form + Zod
- ~~No mobile-responsive layouts~~ - NOW must be responsive for all screen sizes
- ~~No sound effects or audio notifications~~ - NOW optional sound effects (off by default)

---

## Work Objectives

### Core Objective
Build a responsive queue management web application with Kanban board interface, supporting real-time queue progress display (Display Mode) and queue management operations (Operator Mode), using shadcn/ui components and React Hook Form for validation.

### Concrete Deliverables
- `/.git` - Git repository (root)
- `/.gitignore` - Git ignore patterns (root)
- `/be/.git` - Git repository (backend folder)
- `/be/.gitignore` - Git ignore patterns (backend)
- `/fe/.git` - Git repository (frontend folder)
- `/fe/.gitignore` - Git ignore patterns (frontend)
- `/opencode.config` or similar - OpenCode configuration for pnpm
- `/docs/api-contract.md` - API contract documentation
- `/fe/package.json` - Project dependencies and scripts
- `/fe/src/types/queue.ts` - QueueStatus and QueueItem type definitions (with customPayload)
- `/fe/src/types/index.ts` - Type exports
- `/fe/src/lib/utils.ts` - cn utility for className merging (shadcn/ui requirement)
- `/fe/src/components/ui/` - shadcn/ui components (dialog, button, input, select, card, badge, form, switch, label)
- `/fe/src/data/dummyQueues.ts` - 15-25 dummy queue items with Indonesian names and customPayload
- `/fe/src/data/defaultStatuses.ts` - Default status configuration
- `/fe/src/services/mockQueueService.ts` - Queue CRUD mock service
- `/fe/src/services/mockStatusService.ts` - Status CRUD mock service
- `/fe/src/services/index.ts` - Service exports
- `/fe/src/hooks/useQueues.ts` - Queue data fetching and management
- `/fe/src/hooks/useStatuses.ts` - Status data fetching and management
- `/fe/src/hooks/useAutoMovement.ts` - Auto-movement simulation hook
- `/fe/src/hooks/useAutoRefresh.ts` - Auto-refresh simulation hook
- `/fe/src/hooks/useViewMode.ts` - View mode toggle hook (Display/Operator)
- `/fe/src/hooks/useSound.ts` - Sound effect management hook (optional, off by default)
- `/fe/src/components/KanbanBoard.tsx` - Main Kanban board layout
- `/fe/src/components/StatusColumn.tsx` - Status column component
- `/fe/src/components/QueueCard.tsx` - Queue card display component
- `/fe/src/components/Topbar.tsx` - App title + clock topbar
- `/fe/src/components/Footer.tsx` - Optional footer info
- `/fe/src/components/EmptyState.tsx` - Empty state illustration and message
- `/fe/src/components/AddQueueModal.tsx` - Modal form for adding queues (RHF + Zod)
- `/fe/src/components/StatusManagerModal.tsx` - Modal for status CRUD operations (RHF + Zod)
- `/fe/src/components/ViewModeToggle.tsx` - Toggle button for Display/Operator modes
- `/fe/src/components/SoundToggle.tsx` - Toggle switch for sound effects (Operator Mode)
- `/fe/src/App.tsx` - Main app component with view routing
- `/fe/src/main.tsx` - React app entry point
- `/fe/src/index.css` - Global styles and Tailwind directives
- `/fe/tailwind.config.js` - Tailwind configuration
- `/fe/tsconfig.json` - TypeScript configuration
- `/fe/vite.config.ts` - Vite configuration
- `/fe/components.json` - shadcn/ui configuration

### Definition of Done
- [ ] Git repositories initialized in root, `/be`, and `/fe`
- [ ] .gitignore files created in all three locations
- [ ] OpenCode configured for pnpm package manager
- [ ] API contract documentation created in `/docs/api-contract.md`
- [ ] `cd /fe && pnpm install` - Dependencies installed successfully
- [ ] shadcn/ui components installed and configured (dialog, button, input, select, card, badge, form, switch, label)
- [ ] React Hook Form + Zod configured
- [ ] `cd /fe && pnpm run dev` - Dev server starts on http://localhost:5173
- [ ] Browser opens to localhost:5173 → Displays Kanban board with 15-25 queue items
- [ ] Default view is Display Mode (no edit controls visible)
- [ ] Responsive layout works on mobile, tablet, desktop, and TV sizes
- [ ] Click View Mode Toggle → Switches to Operator Mode (edit controls appear)
- [ ] Wait 15 seconds → Queue data refreshes (timestamp updates)
- [ ] Wait another 15 seconds → At least one queue moves to next status
- [ ] Repeat until all queues Done → Auto-movement stops
- [ ] In Operator Mode: Click "Add Queue" → Modal opens (shadcn Dialog), form validates (RHF + Zod), queue created
- [ ] In Operator Mode: Drag queue card → Card moves between columns
- [ ] In Operator Mode: Click "Manage Statuses" → CRUD UI opens, can add/edit/reorder
- [ ] In Operator Mode: Toggle sound → Sound plays on movement when on
- [ ] Delete all queues → Empty state displays "No queues waiting" with illustration
- [ ] `cd /fe && pnpm run build` - Production build succeeds
- [ ] `cd /fe && pnpm run preview` - Production build serves successfully

### Must Have
- Vite + React + TypeScript project in `/fe` directory
- shadcn/ui components configured (Dialog, Button, Input, Select, Card, Badge, Form, Switch, Label)
- React Hook Form (RHF) + Zod validation for all forms
- Kanban board with dynamic status columns
- Queue cards with: Queue Number (large), Customer Name, Service, Waiting Duration, Status Badge, customPayload
- Responsive design for mobile (< 640px), tablet (640-1024px), desktop (1024-1920px), TV (> 1920px)
- Display Mode: Fullscreen, auto-refresh, no edit controls, TV-optimized on large screens
- Operator Mode: Add queue, update status, drag & drop cards, status management UI, sound toggle
- Mock service layer with Promise + setTimeout
- 15-25 dummy queue items with Indonesian names and customPayload
- Auto-movement every 15 seconds (stops when all Done)
- Empty state with message + illustration
- Tailwind CSS styling (via shadcn/ui)
- Library-based drag & drop (dnd-kit)
- Optional sound effects (simple beep, off by default)

### Must NOT Have (Guardrails)
- Authentication, users, permissions, or security features
- localStorage, IndexedDB, or any persistence
- Real backend integration or external API calls
- Complex animations (particles, 3D transforms)
- Multi-language support (English UI only)
- Advanced Kanban features (swimlanes, labels, subtasks)
- Analytics, statistics, or reporting
- Theming system (single high-contrast theme)
- Admin dashboard beyond Operator Mode

---

## Verification Strategy (MANDATORY)

> **UNIVERSAL RULE: ZERO HUMAN INTERVENTION**
>
> ALL tasks in this plan MUST be verifiable WITHOUT any human action.
> This is NOT conditional — it applies to EVERY task, regardless of test strategy.
>
> **FORBIDDEN** — acceptance criteria that require:
> - "User manually tests..." / "사용자가 직접 테스트..."
> - "User visually confirms..." / "사용자가 눈으로 확인..."
> - "User interacts with..." / "사용자가 직접 조작..."
> - "Ask user to verify..." / "사용자에게 확인 요청..."
> - ANY step where a human must perform an action
>
> **ALL verification is executed by the agent** using tools (Playwright, interactive_bash, curl, etc.). No exceptions.

### Test Decision
- **Infrastructure exists**: NO (greenfield project)
- **Automated tests**: NO (user requested no tests)
- **Framework**: N/A

### Agent-Executed QA Scenarios (MANDATORY — ALL tasks)

> Since TDD is disabled, Agent-Executed QA Scenarios are the PRIMARY verification method.
> These describe how the executing agent DIRECTLY verifies the deliverable by running it.

**Verification Tool by Deliverable Type:**

| Type | Tool | How Agent Verifies |
|------|------|-------------------|
| **Frontend/UI** | Playwright (playwright skill) | Navigate, interact, assert DOM, screenshot, test responsive sizes |
| **TUI/CLI** | interactive_bash (tmux) | Run command, send keystrokes, validate output |
| **Build/Scripts** | Bash (pnpm commands) | Run build, install, check exit codes |
| **Config Files** | Read tool | Verify file contents and configuration |

**Each Scenario MUST Follow This Format:**

```
Scenario: [Descriptive name — what user action/flow is being verified]
  Tool: [Playwright / Bash / interactive_bash / Read]
  Preconditions: [What must be true before this scenario runs]
  Steps:
    1. [Exact action with specific selector/command/endpoint]
    2. [Next action with expected intermediate state]
    3. [Assertion with exact expected value]
  Expected Result: [Concrete, observable outcome]
  Failure Indicators: [What would indicate failure]
  Evidence: [Screenshot path / output capture / response body path]
```

---

## Execution Strategy

### Parallel Execution Waves

> Maximize throughput by grouping independent tasks into parallel waves.
> Each wave completes before the next begins.

```
Wave 0 (Start Immediately - Setup):
├── Task 0.1: Initialize git repositories (root, /be, /fe)
├── Task 0.2: Create .gitignore files
├── Task 0.3: Configure OpenCode for pnpm
└── Task 0.4: Create API contract documentation

Wave 1 (After Wave 0):
├── Task 1: Initialize Vite project
└── Task 2: Install dependencies (Tailwind, dnd-kit, icons, RHF, Zod, clsx, tailwind-merge)

Wave 2 (After Wave 1):
├── Task 3: Configure Tailwind CSS
└── Task 4: Initialize shadcn/ui

Wave 3 (After Wave 2):
├── Task 5: Install shadcn/ui components
└── Task 6: Configure React Hook Form + Zod

Wave 4 (After Wave 3):
├── Task 7: Create type definitions
└── Task 8: Create utility functions (cn for className merging)

Wave 5 (After Wave 4):
├── Task 9: Create dummy data
└── Task 10: Build mock services

Wave 6 (After Wave 5):
└── Task 11: Create custom hooks (useQueues, useStatuses, useAutoMovement, useAutoRefresh, useViewMode, useSound)

Wave 7 (After Wave 6):
├── Task 12: Build core components (QueueCard, StatusColumn, KanbanBoard)
└── Task 13: Build layout components (Topbar, Footer, EmptyState)

Wave 8 (After Wave 7):
├── Task 14: Build Operator Mode components (AddQueueModal, StatusManagerModal)
└── Task 15: Build control components (ViewModeToggle, SoundToggle)

Wave 9 (After Wave 8):
└── Task 16: Integrate App component with view modes and responsive design

Wave 10 (After Wave 9):
├── Task 17: Implement auto-refresh and auto-movement features
└── Task 18: Implement sound effects feature

Wave 11 (After Wave 10):
└── Task 19: Final integration and verification

Critical Path: Task 0.1 → 0.2 → 0.3 → 0.4 → 1 → 3 → 4 → 5 → 7 → 10 → 11 → 12 → 16 → 17 → 19
Parallel Speedup: ~30% faster than sequential (some tasks in Waves 2-9 can run in parallel)
```

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 0.1 | None | 0.2 | None |
| 0.2 | 0.1 | 0.3 | None |
| 0.3 | 0.2 | 0.4 | None |
| 0.4 | 0.3 | 1 | None |
| 1 | 0.4 | 2 | None |
| 2 | 1 | 3 | None |
| 3 | 2 | 4 | None |
| 4 | 3 | 5 | None |
| 5 | 4 | 6 | None |
| 6 | 5 | 7 | None |
| 7 | 6 | 8 | None |
| 8 | 7 | 9 | None |
| 9 | 8 | 10 | None |
| 10 | 9 | 11 | None |
| 11 | 10 | 12 | None |
| 12 | 11 | 13 | None |
| 13 | 7 | 16 | 12, 14, 15 |
| 14 | 11, 12 | 16 | 13, 15 |
| 15 | 11, 12 | 16 | 13, 14 |
| 16 | 12, 13, 14, 15 | 17 | None |
| 17 | 16 | 18 | None |
| 18 | 16 | 19 | None |
| 19 | 17, 18 | None | None (final) |

### Agent Dispatch Summary

| Wave | Tasks | Recommended Agents |
|------|-------|-------------------|
| 0 | 0.1, 0.2, 0.3, 0.4 | task(category="quick", load_skills=["git-master"], run_in_background=false) (sequential) |
| 1 | 1, 2 | task(category="quick", load_skills=[], run_in_background=false) |
| 2 | 3, 4 | task(category="quick", load_skills=[], run_in_background=false) (sequential for safety) |
| 3 | 5, 6 | task(category="quick", load_skills=[], run_in_background=false) (sequential) |
| 4 | 7, 8 | task(category="quick", load_skills=[], run_in_background=false) (sequential) |
| 5 | 9, 10 | task(category="quick", load_skills=[], run_in_background=false) (sequential) |
| 6 | 11 | task(category="quick", load_skills=[], run_in_background=false) (sequential) |
| 7 | 12, 13 | task(category="visual-engineering", load_skills=["frontend-ui-ux"], run_in_background=false) (sequential) |
| 8 | 14, 15 | task(category="visual-engineering", load_skills=["frontend-ui-ux"], run_in_background=false) (sequential) |
| 9 | 16 | task(category="visual-engineering", load_skills=["frontend-ui-ux"], run_in_background=false) (sequential) |
| 10 | 17, 18 | task(category="quick", load_skills=[], run_in_background=false) (sequential) |
| 11 | 19 | task(category="quick", load_skills=[], run_in_background=false) |

---

## TODOs

> Implementation + Test = ONE Task. Never separate.
> EVERY task MUST have: Recommended Agent Profile + Parallelization info.

- [x] 0.1. Initialize git repositories (root, /be, /fe)

  **What to do**:
  - Run `git init` in root directory (`/Users/aminyusuf/Documents/Projects/Amin/Side Projects/antree-app`)
  - Run `git init` in `/be` directory
  - Run `git init` in `/fe` directory
  - Verify all three repositories are initialized

  **Must NOT do**:
  - Do NOT create any commits yet
  - Do NOT add any files to git yet

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple git initialization commands
  - **Skills**: `git-master`
    - `git-master`: Required for git operations per OpenCode guidelines

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 0 - Setup)
  - **Blocks**: Task 0.2
  - **Blocked By**: None (can start immediately)

  **References**:
  - Git docs: `https://git-scm.com/docs/git-init` - git init command

  **Acceptance Criteria**:
  - [ ] Command `cd /Users/aminyusuf/Documents/Projects/Amin/Side\ Projects/antree-app && git status` → Shows "Initialized empty Git repository"
  - [ ] Command `cd /be && git status` → Shows "Initialized empty Git repository"
  - [ ] Command `cd /fe && git status` → Shows "Initialized empty Git repository"
  - [ ] Command `ls -la /Users/aminyusuf/Documents/Projects/Amin/Side\ Projects/antree-app/.git` → Directory exists
  - [ ] Command `ls -la /be/.git` → Directory exists
  - [ ] Command `ls -la /fe/.git` → Directory exists

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Git repositories initialized in all locations
    Tool: Bash (git)
    Preconditions: Working directory is root
    Steps:
      1. Run: `cd /Users/aminyusuf/Documents/Projects/Amin/Side\ Projects/antree-app && git init`
      2. Assert: Exit code is 0
      3. Assert: Output contains "Initialized empty Git repository"
      4. Run: `cd /be && git init`
      5. Assert: Exit code is 0
      6. Assert: Output contains "Initialized empty Git repository"
      7. Run: `cd /fe && git init`
      8. Assert: Exit code is 0
      9. Assert: Output contains "Initialized empty Git repository"
      10. Run: `cd /Users/aminyusuf/Documents/Projects/Amin/Side\ Projects/antree-app && ls -la | grep .git`
      11. Assert: .git directory exists
      12. Run: `cd /be && ls -la | grep .git`
      13. Assert: .git directory exists
      14. Run: `cd /fe && ls -la | grep .git`
      15. Assert: .git directory exists
    Expected Result: Git repositories initialized in root, /be, and /fe
    Evidence: Terminal output captured

  Scenario: Git status shows clean repositories
    Tool: Bash (git)
    Preconditions: Git repositories initialized
    Steps:
      1. Run: `cd /Users/aminyusuf/Documents/Projects/Amin/Side\ Projects/antree-app && git status`
      2. Assert: Output contains "No commits yet" or "On branch main"
      3. Run: `cd /be && git status`
      4. Assert: Output contains "No commits yet" or "On branch main"
      5. Run: `cd /fe && git status`
      6. Assert: Output contains "No commits yet" or "On branch main"
    Expected Result: All repositories show clean status
    Evidence: Terminal output captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Terminal output for all git init commands
  - [ ] Terminal output for git status checks

  **Commit**: NO (wait for wave completion)

- [x] 0.2. Create .gitignore files

  **What to do**:
  - Create `/Users/aminyusuf/Documents/Projects/Amin/Side Projects/antree-app/.gitignore` for root
  - Create `/be/.gitignore` for backend
  - Create `/fe/.gitignore` for frontend
  - Include common ignore patterns: node_modules, dist, .env, .DS_Store, *.log

  **Must NOT do**:
  - Do NOT add files to git yet
  - Do NOT ignore source files incorrectly

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Create .gitignore files with standard patterns
  - **Skills**: `git-master`
    - `git-master`: Required for git operations

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 0 - Setup)
  - **Blocks**: Task 0.3
  - **Blocked By**: Task 0.1

  **References**:
  - Git docs: `https://git-scm.com/docs/gitignore` - gitignore patterns
  - Node.js gitignore: `https://github.com/github/gitignore/blob/main/Node.gitignore` - Standard Node.js ignores

  **Acceptance Criteria**:
  - [ ] File `/Users/aminyusuf/Documents/Projects/Amin/Side Projects/antree-app/.gitignore` exists
  - [ ] File `/be/.gitignore` exists
  - [ ] File `/fe/.gitignore` exists
  - [ ] All .gitignore files contain: node_modules, dist, .env, .DS_Store, *.log
  - [ ] Frontend .gitignore contains: Vite-specific patterns (.vite, vite-env.d.ts)
  - [ ] Backend .gitignore contains: Common backend patterns

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: .gitignore files created with correct patterns
    Tool: Read
    Preconditions: Git repositories initialized
    Steps:
      1. Read: `/Users/aminyusuf/Documents/Projects/Amin/Side\ Projects/antree-app/.gitignore`
      2. Assert: Contains `node_modules`
      3. Assert: Contains `dist`
      4. Assert: Contains `.env`
      5. Assert: Contains `.DS_Store`
      6. Assert: Contains `*.log`
      7. Read: `/fe/.gitignore`
      8. Assert: Contains `node_modules`
      9. Assert: Contains `dist`
      10. Assert: Contains `.vite` (Vite-specific)
      11. Assert: Contains `vite-env.d.ts`
      12. Read: `/be/.gitignore`
      13. Assert: Contains `node_modules`
      14. Assert: Contains `.env`
    Expected Result: All .gitignore files exist with correct patterns
    Evidence: File contents captured

  Scenario: Git ignores node_modules correctly
    Tool: Bash (git)
    Preconditions: .gitignore files created
    Steps:
      1. Navigate to: `/fe` (or create node_modules if exists)
      2. Run: `git status`
      3. Assert: node_modules NOT in untracked files (if directory exists)
      4. Run: `git check-ignore node_modules`
      5. Assert: Output contains "node_modules" (is ignored)
    Expected Result: Git correctly ignores node_modules
    Evidence: Terminal output captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of all .gitignore files
  - [ ] Terminal output for git check-ignore command

  **Commit**: NO (wait for wave completion)

- [ ] 0.3. Configure OpenCode for local pnpm usage

  **What to do**:
  - Create OpenCode configuration file in root directory
  - Set package manager to pnpm for local operations
  - Configure for monorepo structure (root, /be, /fe)
  - Follow OpenCode configuration guidelines

  **Must NOT do**:
  - Do NOT use npm or yarn in config

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Create OpenCode config file
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 0 - Setup)
  - **Blocks**: Task 0.4
  - **Blocked By**: Task 0.2

  **References**:
  - OpenCode docs: Configuration guidelines (if available)
  - Task description: "add opencode config for local to using pnpm package manager"

  **Acceptance Criteria**:
  - [ ] OpenCode config file exists in root directory
  - [ ] Config specifies pnpm as package manager
  - [ ] Config supports monorepo structure (root, /be, /fe)

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: OpenCode config created with pnpm
    Tool: Read
    Preconditions: Working directory is root
    Steps:
      1. Identify: OpenCode config file name (e.g., `.opencode`, `opencode.json`, or similar)
      2. Read: Config file
      3. Assert: Contains package manager configuration
      4. Assert: Package manager is set to "pnpm"
      5. Assert: Config supports monorepo or multiple packages
    Expected Result: OpenCode configured with pnpm
    Evidence: Config file contents captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of OpenCode config file

  **Commit**: NO (wait for wave completion)

- [x] 0.4. Create API contract documentation in /docs folder

  **What to do**:
  - Create `/docs/api-contract.md` file
  - Define QueueService API contract:
    - GET /queues - Get all queues
    - POST /queues - Create new queue
    - PUT /queues/:id - Update queue
    - DELETE /queues/:id - Delete queue
  - Define StatusService API contract:
    - GET /statuses - Get all statuses
    - POST /statuses - Create status
    - PUT /statuses/:id - Update status
    - DELETE /statuses/:id - Delete status
  - Include request/response schemas for each endpoint
  - Include example requests and responses
  - Note: This is for future backend implementation (mock services in frontend only)

  **Must NOT do**:
  - Do NOT implement actual API yet
  - Do NOT use external API services
  - Do NOT implement backend in /be yet (future task)

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: Create API documentation in markdown
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 0 - Setup)
  - **Blocks**: Task 1 (project initialization)
  - **Blocked By**: Task 0.3

  **References**:
  - Task description: "for API contract u have to define it in /docs folder first in md file before actual implementation"
  - Data model from task: QueueStatus and QueueItem types (with customPayload)

  **Acceptance Criteria**:
  - [ ] File `/docs/api-contract.md` exists
  - [ ] Document contains QueueService API contract with all CRUD endpoints
  - [ ] Document contains StatusService API contract with all CRUD endpoints
  - [ ] Each endpoint has: HTTP method, path, request schema, response schema, example
  - [ ] Schemas match QueueStatus and QueueItem types from task description (including customPayload)
  - [ ] Document includes note: "This is contract for future backend implementation"

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: API contract documentation exists and is complete
    Tool: Read
    Preconditions: /docs folder exists
    Steps:
      1. Read: `/docs/api-contract.md`
      2. Assert: Document contains "API Contract" or "API Specification" title
      3. Assert: Contains "QueueService" section
      4. Assert: Contains GET /queues endpoint with schema
      5. Assert: Contains POST /queues endpoint with schema
      6. Assert: Contains PUT /queues/:id endpoint with schema
      7. Assert: Contains DELETE /queues/:id endpoint with schema
      8. Assert: Contains "StatusService" section
      9. Assert: Contains GET /statuses endpoint with schema
      10. Assert: Contains POST /statuses endpoint with schema
      11. Assert: Contains PUT /statuses/:id endpoint with schema
      12. Assert: Contains DELETE /statuses/:id endpoint with schema
      13. Assert: Schemas include QueueItem fields (id, queueNumber, name, service, statusId, createdAt, updatedAt, customPayload)
      14. Assert: Schemas include QueueStatus fields (id, label, color, order)
      15. Assert: Document contains "future backend implementation" note
    Expected Result: Complete API contract documentation
    Evidence: File contents captured

  Scenario: API contract matches data model
    Tool: Read, Bash (grep)
    Preconditions: API contract exists
    Steps:
      1. Read: `/docs/api-contract.md`
      2. Assert: QueueItem schema contains "id: string"
      3. Assert: QueueItem schema contains "queueNumber: string"
      4. Assert: QueueItem schema contains "name: string"
      5. Assert: QueueItem schema contains "service?: string"
      6. Assert: QueueItem schema contains "statusId: string"
      7. Assert: QueueItem schema contains "createdAt: string"
      8. Assert: QueueItem schema contains "updatedAt: string"
      9. Assert: QueueItem schema contains "customPayload?: Record<string, any>"
      10. Assert: QueueStatus schema contains "id: string"
      11. Assert: QueueStatus schema contains "label: string"
      12. Assert: QueueStatus schema contains "color: string"
      13. Assert: QueueStatus schema contains "order: number"
    Expected Result: API contract schemas match data model exactly
    Evidence: File contents captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Complete contents of `/docs/api-contract.md`

  **Commit**: NO (wait for wave completion)

- [x] 1. Initialize Vite + React + TypeScript project

  **What to do**:
  - Navigate to `/fe` directory
  - Run `pnpm create vite@latest . --template react-ts`
  - This creates Vite project in the current `/fe` directory
  - Verify `package.json`, `vite.config.ts`, `tsconfig.json` are created
  - Run `pnpm install` to install base dependencies

  **Must NOT do**:
  - Do NOT use npm or yarn (must use pnpm)
  - Do NOT create project in wrong location (must be `/fe`)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple project initialization with standard commands, no complex logic
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1)
  - **Blocks**: Task 2
  - **Blocked By**: Task 0.4

  **References**:
  - Task description above - Initial project setup requirements
  - `.sisyphus/drafts/antree-queue-app-updated.md` - Full requirement specification

  **External References**:
  - Official docs: `https://vitejs.dev/guide/` - Vite CLI commands
  - Official docs: `https://vitejs.dev/guide/#scaffolding-your-first-vite-project` - Project scaffolding

  **WHY Each Reference Matters**:
  - Task description: Confirms pnpm usage, React + TypeScript template, target location `/fe`
  - Draft document: Contains complete feature requirements including shadcn, RHF, responsive design, customPayload, sound effects
  - Vite docs: Correct CLI syntax for `pnpm create vite@latest . --template react-ts`

  **Acceptance Criteria**:
  - [ ] Command `ls /fe` → Shows `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `src/`
  - [ ] Command `cat /fe/package.json` → Contains `name: "fe"`, `"scripts": { "dev": "vite", "build": "tsc && vite build", "preview": "vite preview" }`
  - [ ] Command `cat /fe/tsconfig.json` → Contains `"compilerOptions": { "target": "ES2020", "useDefineForClassFields": true, "lib": ["ES2020", "DOM", "DOM.Iterable"], "module": "ESNext", "skipLibCheck": true, "moduleResolution": "bundler", "allowImportingTsExtensions": true, "resolveJsonModule": true, "isolatedModules": true, "noEmit": true, "jsx": "react-jsx", "strict": true, "noUnusedLocals": true, "noUnusedParameters": true, "noFallthroughCasesInSwitch": true }`
  - [ ] Command `cat /fe/vite.config.ts` → Contains `defineConfig({ plugins: [react()], })`
  - [ ] Command `pnpm install` in `/fe` → Installs dependencies successfully, `node_modules/` created

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Vite project initializes successfully
    Tool: Bash (pnpm)
    Preconditions: Working directory is `/fe`, pnpm is installed
    Steps:
      1. Run: `pnpm create vite@latest . --template react-ts`
      2. Assert: Exit code is 0
      3. Assert: File `package.json` exists
      4. Assert: File `vite.config.ts` exists
      5. Assert: File `tsconfig.json` exists
      6. Assert: Directory `src/` exists with `App.tsx`, `main.tsx`, `index.css`
      7. Run: `cat package.json | grep '"name"'`
      8. Assert: Output contains `"name": "fe"`
      9. Run: `pnpm install`
      10. Assert: Exit code is 0
      11. Assert: Directory `node_modules/` exists
    Expected Result: Vite project created with React + TypeScript template, dependencies installed
    Evidence: Terminal output captured

  Scenario: Project structure matches expected layout
    Tool: Bash (ls, cat)
    Preconditions: Project initialized
    Steps:
      1. Run: `ls -la /fe`
      2. Assert: Output contains `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `src/`
      3. Run: `ls -la /fe/src`
      4. Assert: Output contains `App.tsx`, `App.css`, `main.tsx`, `index.css`, `vite-env.d.ts`
      5. Run: `cat /fe/package.json`
      6. Assert: Contains `"dev": "vite"`, `"build": "tsc && vite build"`, `"preview": "vite preview"`
      7. Assert: Contains `"dependencies": { "react": "^18.x", "react-dom": "^18.x" }`
    Expected Result: All Vite project files present with correct configuration
    Evidence: Directory listings and file contents captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Terminal output for `pnpm create` command
  - [ ] Terminal output for `pnpm install` command
  - [ ] Directory listings showing project structure

  **Commit**: NO (wait for wave completion)

- [ ] 2. Install additional dependencies (Tailwind, dnd-kit, icons, RHF, Zod, clsx, tailwind-merge)

  **What to do**:
  - Install Tailwind CSS: `pnpm add -D tailwindcss postcss autoprefixer`
  - Initialize Tailwind: `pnpm tailwindcss init -p`
  - Install dnd-kit for drag & drop: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
  - Install lucide-react for icons: `pnpm add lucide-react`
  - Install React Hook Form: `pnpm add react-hook-form`
  - Install Zod for validation: `pnpm add zod`
  - Install @hookform/resolvers for RHF + Zod integration: `pnpm add @hookform/resolvers`
  - Install clsx and tailwind-merge for className utilities: `pnpm add clsx tailwind-merge`
  - Verify all packages in `package.json`

  **Must NOT do**:
  - Do NOT install form validation libraries beyond RHF + Zod
  - Do NOT install state management libraries (use React hooks)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard package installation with pnpm
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 1)
  - **Blocks**: Task 3
  - **Blocked By**: Task 1

  **References**:
  - Tailwind docs: `https://tailwindcss.com/docs/guides/vite` - Installation guide
  - dnd-kit docs: `https://docs.dndkit.com/` - Installation
  - lucide-react docs: `https://lucide.dev/guide/packages/lucide-react` - Icon library
  - RHF docs: `https://react-hook-form.com/` - React Hook Form
  - Zod docs: `https://zod.dev/` - Schema validation

  **Acceptance Criteria**:
  - [ ] Command `cat /fe/package.json` → Contains `tailwindcss`, `postcss`, `autoprefixer` in devDependencies
  - [ ] Command `cat /fe/package.json` → Contains `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` in dependencies
  - [ ] Command `cat /fe/package.json` → Contains `lucide-react`, `clsx`, `tailwind-merge` in dependencies
  - [ ] Command `cat /fe/package.json` → Contains `react-hook-form`, `zod`, `@hookform/resolvers` in dependencies
  - [ ] File `/fe/tailwind.config.js` exists
  - [ ] File `/fe/postcss.config.js` exists
  - [ ] Command `pnpm install` → All packages installed successfully

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: All required dependencies installed
    Tool: Bash (cat, pnpm)
    Preconditions: Project initialized, in /fe directory
    Steps:
      1. Run: `pnpm add -D tailwindcss postcss autoprefixer`
      2. Assert: Exit code is 0
      3. Run: `pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
      4. Assert: Exit code is 0
      5. Run: `pnpm add lucide-react clsx tailwind-merge`
      6. Assert: Exit code is 0
      7. Run: `pnpm add react-hook-form zod @hookform/resolvers`
      8. Assert: Exit code is 0
      9. Run: `cat package.json`
      10. Assert: Contains `"tailwindcss"`
      11. Assert: Contains `"@dnd-kit/core"`
      12. Assert: Contains `"lucide-react"`
      13. Assert: Contains `"react-hook-form"`
      14. Assert: Contains `"zod"`
    Expected Result: All dependencies installed and listed in package.json
    Evidence: Terminal output captured

  Scenario: Tailwind configuration files created
    Tool: Bash (ls, cat)
    Preconditions: Dependencies installed
    Steps:
      1. Run: `pnpm tailwindcss init -p`
      2. Assert: Exit code is 0
      3. Assert: File `tailwind.config.js` exists
      4. Assert: File `postcss.config.js` exists
      5. Run: `cat tailwind.config.js`
      6. Assert: Contains `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
    Expected Result: Tailwind config files with default setup
    Evidence: File contents captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Terminal output for all pnpm install commands
  - [ ] Contents of package.json showing installed packages
  - [ ] Contents of tailwind.config.js and postcss.config.js

  **Commit**: NO (wait for wave completion)

- [ ] 3. Configure Tailwind CSS

  **What to do**:
  - Update `/fe/tailwind.config.js` with content paths
  - Add Tailwind directives to `/fe/src/index.css`
  - Remove default CSS from `/fe/src/index.css` (keep only Tailwind directives)
  - Configure theme colors in `tailwind.config.js` for status colors
  - Configure responsive breakpoints for shadcn/ui: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
  - Verify Tailwind is working by adding test class to App.tsx

  **Must NOT do**:
  - Do NOT add complex theme customization beyond basic colors and breakpoints
  - Do NOT install additional Tailwind plugins

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard Tailwind configuration with responsive breakpoints
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2)
  - **Blocks**: Task 4
  - **Blocked By**: Task 2

  **References**:
  - Tailwind docs: `https://tailwindcss.com/docs/guides/vite` - Vite integration guide
  - Tailwind docs: `https://tailwindcss.com/docs/screens` - Responsive breakpoints
  - Task description - Tailwind CSS + responsive design requirement

  **Acceptance Criteria**:
  - [ ] File `/fe/tailwind.config.js` contains `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
  - [ ] File `/fe/tailwind.config.js` contains responsive breakpoints (sm, md, lg, xl, 2xl)
  - [ ] File `/fe/src/index.css` contains `@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`
  - [ ] File `/fe/src/App.tsx` uses Tailwind class (e.g., `<div className="p-4">`)
  - [ ] Command `cd /fe && pnpm run dev` → Server starts, Tailwind styles load

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Tailwind configured with responsive breakpoints
    Tool: Read, Bash
    Preconditions: Dependencies installed
    Steps:
      1. Read: `/fe/tailwind.config.js`
      2. Assert: Contains `content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
      3. Assert: Contains theme.screens with breakpoints (sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px')
      4. Read: `/fe/src/index.css`
      5. Assert: Contains `@tailwind base;`
      6. Assert: Contains `@tailwind components;`
      7. Assert: Contains `@tailwind utilities;`
      8. Assert: No other CSS rules (clean slate)
    Expected Result: Tailwind configured with responsive breakpoints
    Evidence: File contents captured

  Scenario: Tailwind styles load and responsive classes work
    Tool: Playwright
    Preconditions: Dev server running on localhost:5173
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for: page loaded (timeout: 5s)
      3. Assert: element with class "p-4" has padding applied (check computed style)
      4. Resize browser to: 500px width (mobile breakpoint)
      5. Assert: Responsive layout adapts (e.g., columns stack vertically)
      6. Resize browser to: 1200px width (desktop breakpoint)
      7. Assert: Responsive layout adapts (e.g., columns horizontal)
      8. Screenshot: .sisyphus/evidence/task-3-tailwind-responsive.png
    Expected Result: Tailwind styles and responsive classes work
    Evidence: Screenshot captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of `/fe/tailwind.config.js`
  - [ ] Contents of `/fe/src/index.css`
  - [ ] Screenshots showing responsive layouts at different breakpoints

  **Commit**: NO (wait for wave completion)

- [ ] 4. Initialize shadcn/ui

  **What to do**:
  - Run shadcn-ui init command: `npx shadcn-ui@latest init` in `/fe` directory
  - Select defaults during init (TypeScript, Tailwind CSS, yes to components directory, yes to utils)
  - This creates `/fe/src/lib/utils.ts` with `cn()` utility for className merging
  - This creates `/fe/components.json` for shadcn/ui configuration
  - Verify `src/lib/utils.ts` exists with `clsx` and `tailwind-merge` usage
  - Verify `components.json` exists

  **Must NOT do**:
  - Do NOT install shadcn as npm package (uses copy-paste)
  - Do NOT skip the init step

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Standard shadcn/ui initialization
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 2)
  - **Blocks**: Task 5
  - **Blocked By**: Task 3

  **References**:
  - shadcn/ui docs: `https://ui.shadcn.com/docs/installation` - Installation guide
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components` - Component list

  **Acceptance Criteria**:
  - [ ] File `/fe/src/lib/utils.ts` exists
  - [ ] File `/fe/src/lib/utils.ts` contains `cn()` function using `clsx` and `tailwind-merge`
  - [ ] File `/fe/components.json` exists
  - [ ] `components.json` contains shadcn/ui configuration
  - [ ] Command `cd /fe && pnpm run dev` → No errors from shadcn/ui setup

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: shadcn/ui initialized correctly
    Tool: Bash (npx), Read
    Preconditions: Tailwind configured, in /fe directory
    Steps:
      1. Run: `npx shadcn-ui@latest init`
      2. Answer prompts: TypeScript (yes), Tailwind CSS (yes), src/ directory (yes), utils.ts (yes)
      3. Assert: Exit code is 0
      4. Read: `/fe/src/lib/utils.ts`
      5. Assert: Contains `export function cn(...inputs: ClassValue[])`
      6. Assert: Uses `clsx` and `tailwind-merge`
      7. Read: `/fe/components.json`
      8. Assert: Contains `"style": "new-york"` or similar configuration
      9. Assert: Contains `"tailwind": {...}` with content paths
    Expected Result: shadcn/ui initialized with utils.ts and components.json
    Evidence: Terminal output and file contents captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Terminal output for shadcn-ui init command
  - [ ] Contents of `/fe/src/lib/utils.ts`
  - [ ] Contents of `/fe/components.json`

  **Commit**: NO (wait for wave completion)

- [ ] 5. Install shadcn/ui components

  **What to do**:
  - Install required shadcn/ui components using: `npx shadcn-ui@latest add [component]`
  - Components to install: dialog, button, input, select, card, badge, form, switch, label
  - Each command creates component files in `/fe/src/components/ui/`
  - Verify all component files exist
  - Components should be accessible and use Tailwind CSS

  **Must NOT do**:
  - Do NOT install more components than needed (keep list minimal)
  - Do NOT modify shadcn/ui components directly (use them as-is)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Install multiple shadcn/ui components
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Task 6
  - **Blocked By**: Task 4

  **References**:
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/dialog` - Dialog component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/button` - Button component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/input` - Input component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/select` - Select component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/card` - Card component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/badge` - Badge component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/form` - Form components
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/switch` - Switch component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/label` - Label component

  **Acceptance Criteria**:
  - [ ] File `/fe/src/components/ui/dialog.tsx` exists
  - [ ] File `/fe/src/components/ui/button.tsx` exists
  - [ ] File `/fe/src/components/ui/input.tsx` exists
  - [ ] File `/fe/src/components/ui/select.tsx` exists
  - [ ] File `/fe/src/components/ui/card.tsx` exists
  - [ ] File `/fe/src/components/ui/badge.tsx` exists
  - [ ] File `/fe/src/components/ui/form.tsx` exists (with FormControl, FormField, FormItem, FormLabel, FormMessage)
  - [ ] File `/fe/src/components/ui/switch.tsx` exists
  - [ ] File `/fe/src/components/ui/label.tsx` exists
  - [ ] Command `cd /fe && pnpm run dev` → No component import errors
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: All shadcn/ui components installed
    Tool: Bash (npx), Read
    Preconditions: shadcn/ui initialized
    Steps:
      1. Run: `npx shadcn-ui@latest add dialog`
      2. Assert: Exit code is 0
      3. Run: `npx shadcn-ui@latest add button`
      4. Assert: Exit code is 0
      5. Run: `npx shadcn-ui@latest add input`
      6. Assert: Exit code is 0
      7. Run: `npx shadcn-ui@latest add select`
      8. Assert: Exit code is 0
      9. Run: `npx shadcn-ui@latest add card`
      10. Assert: Exit code is 0
      11. Run: `npx shadcn-ui@latest add badge`
      12. Assert: Exit code is 0
      13. Run: `npx shadcn-ui@latest add form`
      14. Assert: Exit code is 0
      15. Run: `npx shadcn-ui@latest add switch`
      16. Assert: Exit code is 0
      17. Run: `npx shadcn-ui@latest add label`
      18. Assert: Exit code is 0
      19. Run: `ls /fe/src/components/ui`
      20. Assert: Contains dialog.tsx, button.tsx, input.tsx, select.tsx, card.tsx, badge.tsx, form.tsx, switch.tsx, label.tsx
    Expected Result: All 9 shadcn/ui components installed
    Evidence: Terminal output and directory listing captured

  Scenario: Components compile without errors
    Tool: Bash (tsc, pnpm dev)
    Preconditions: All components installed
    Steps:
      1. Run: `cd /fe && pnpm exec tsc --noEmit`
      2. Assert: Exit code is 0
      3. Assert: No error messages in output
      4. Run: `cd /fe && timeout 10 pnpm run dev` (or use background process)
      5. Wait: 5 seconds
      6. Check: Process is still running (no errors)
      7. Stop: dev process
    Expected Result: Components compile successfully
    Evidence: Compilation output captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Terminal output for all shadcn-ui add commands
  - [ ] Directory listing of `/fe/src/components/ui`
  - [ ] TypeScript compilation output

  **Commit**: NO (wait for wave completion)

- [ ] 6. Configure React Hook Form + Zod

  **What to do**:
  - Create `/fe/src/lib/schemas.ts` for Zod validation schemas
  - Define queueItemSchema with Zod for: queueNumber, name, service, statusId
  - Define statusSchema with Zod for: label, color, order
  - Create example form components using shadcn/ui form components + RHF
  - Use @hookform/resolvers for Zod + RHF integration

  **Must NOT do**:
  - Do NOT use other validation libraries (only Zod)
  - Do NOT create complex validation logic

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Set up RHF + Zod integration with schemas
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 3)
  - **Blocks**: Task 7
  - **Blocked By**: Task 5

  **References**:
  - RHF docs: `https://react-hook-form.com/` - React Hook Form documentation
  - Zod docs: `https://zod.dev/` - Zod schema validation
  - @hookform/resolvers: `https://github.com/react-hook-form/resolvers` - Zod integration
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/form` - Form components

  **Acceptance Criteria**:
  - [ ] File `/fe/src/lib/schemas.ts` exists
  - [ ] File `/fe/src/lib/schemas.ts` contains `queueItemSchema` with Zod validation
  - [ ] File `/fe/src/lib/schemas.ts` contains `statusSchema` with Zod validation
  - [ ] Schemas use `z.object`, `z.string`, `z.optional` etc.
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Zod schemas defined correctly
    Tool: Read
    Preconditions: RHF and Zod installed
    Steps:
      1. Read: `/fe/src/lib/schemas.ts`
      2. Assert: Contains `import { z } from "zod"`
      3. Assert: Contains `export const queueItemSchema`
      4. Assert: Uses `z.object({...})`
      5. Assert: Contains `name: z.string().min(1, "Name is required")`
      6. Assert: Contains `queueNumber: z.string()`
      7. Assert: Contains `service: z.string().optional()`
      8. Assert: Contains `statusId: z.string()`
      9. Assert: Contains `export const statusSchema`
      10. Assert: Uses `z.object({...})`
      11. Assert: Contains `label: z.string().min(1, "Label is required")`
      12. Assert: Contains `color: z.string()`
      13. Assert: Contains `order: z.number()`
    Expected Result: Zod schemas for queue and status defined
    Evidence: File contents captured

  Scenario: Schemas compile without errors
    Tool: Bash (tsc)
    Preconditions: Schemas file created
    Steps:
      1. Run: `cd /fe && pnpm exec tsc --noEmit`
      2. Assert: Exit code is 0
      3. Assert: No type errors for Zod schemas
    Expected Result: Zod schemas are TypeScript valid
    Evidence: Compilation output captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of `/fe/src/lib/schemas.ts`
  - [ ] TypeScript compilation output

  **Commit**: NO (wait for wave completion)

- [ ] 7. Create type definitions

  **What to do**:
  - Create `/fe/src/types/queue.ts`
  - Define `QueueStatus` type: `{ id: string; label: string; color: string; order: number; }`
  - Define `QueueItem` type: `{ id: string; queueNumber: string; name: string; service?: string; statusId: string; createdAt: string; updatedAt: string; customPayload?: Record<string, any>; }`
  - Create `/fe/src/types/index.ts` and export types
  - Use exact type definitions from task description with customPayload added

  **Must NOT do**:
  - Do NOT add extra fields not specified
  - Do NOT use interfaces instead of types (user specified type)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple type file creation with exact specifications
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: Task 8
  - **Blocked By**: Task 6

  **References**:
  - Task description - Data model section with exact type definitions
  - Draft document - Updated requirements with customPayload

  **Acceptance Criteria**:
  - [ ] File `/fe/src/types/queue.ts` exists with `QueueStatus` and `QueueItem` types
  - [ ] `QueueStatus` has fields: `id: string`, `label: string`, `color: string`, `order: number`
  - [ ] `QueueItem` has fields: `id: string`, `queueNumber: string`, `name: string`, `service?: string`, `statusId: string`, `createdAt: string`, `updatedAt: string`, `customPayload?: Record<string, any>`
  - [ ] File `/fe/src/types/index.ts` exists and exports both types
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Type definitions created correctly with customPayload
    Tool: Read
    Preconditions: Types file exists
    Steps:
      1. Read: `/fe/src/types/queue.ts`
      2. Assert: Contains `export type QueueStatus`
      3. Assert: Contains `id: string`
      4. Assert: Contains `label: string`
      5. Assert: Contains `color: string`
      6. Assert: Contains `order: number`
      7. Assert: Contains `export type QueueItem`
      8. Assert: Contains `id: string`
      9. Assert: Contains `queueNumber: string`
      10. Assert: Contains `name: string`
      11. Assert: Contains `service?: string`
      12. Assert: Contains `statusId: string`
      13. Assert: Contains `createdAt: string`
      14. Assert: Contains `updatedAt: string`
      15. Assert: Contains `customPayload?: Record<string, any>`
      16. Read: `/fe/src/types/index.ts`
      17. Assert: Contains `export type { QueueStatus, QueueItem } from './queue'`
    Expected Result: Both types defined with customPayload
    Evidence: File contents captured

  Scenario: TypeScript compilation succeeds
    Tool: Bash (tsc)
    Preconditions: Type files created
    Steps:
      1. Run: `cd /fe && pnpm exec tsc --noEmit`
      2. Assert: Exit code is 0
      3. Assert: No error messages in output
    Expected Result: No TypeScript compilation errors
    Evidence: Compilation output captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of `/fe/src/types/queue.ts`
  - [ ] Contents of `/fe/src/types/index.ts`
  - [ ] TypeScript compilation output

  **Commit**: NO (wait for wave completion)

- [ ] 8. Create utility functions (cn for className merging)

  **What to do**:
  - Verify `/fe/src/lib/utils.ts` exists (created by shadcn/ui init)
  - Verify `cn()` function uses `clsx` and `tailwind-merge`
  - This is used for merging Tailwind className strings with Tailwind conflicts resolution
  - No additional work needed if shadcn/ui init created it correctly

  **Must NOT do**:
  - Do NOT modify the `cn()` function (use as-is)
  - Do NOT add additional utility functions unless needed

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Verify shadcn/ui created utils.ts correctly
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 4)
  - **Blocks**: Task 9
  - **Blocked By**: Task 7

  **References**:
  - shadcn/ui docs: `https://ui.shadcn.com/docs/installation` - utils.ts creation
  - Task 4 - shadcn/ui init step

  **Acceptance Criteria**:
  - [ ] File `/fe/src/lib/utils.ts` exists
  - [ ] File `/fe/src/lib/utils.ts` contains `import { clsx, type ClassValue } from "clsx"`
  - [ ] File `/fe/src/lib/utils.ts` contains `import { twMerge } from "tailwind-merge"`
  - [ ] File `/fe/src/lib/utils.ts` contains `export function cn(...inputs: ClassValue[])`
  - [ ] Function uses `clsx` and `twMerge`

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: utils.ts created with cn function
    Tool: Read
    Preconditions: shadcn/ui initialized
    Steps:
      1. Read: `/fe/src/lib/utils.ts`
      2. Assert: Contains `import { clsx, type ClassValue } from "clsx"`
      3. Assert: Contains `import { twMerge } from "tailwind-merge"`
      4. Assert: Contains `export function cn(...inputs: ClassValue[])`
      5. Assert: Contains `return twMerge(clsx(inputs))` or similar
    Expected Result: cn utility function for className merging
    Evidence: File contents captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of `/fe/src/lib/utils.ts`

  **Commit**: NO (wait for wave completion)

- [ ] 9. Create dummy data

  **What to do**:
  - Create `/fe/src/data/dummyQueues.ts` with 15-25 queue items
  - Use Indonesian names (e.g., "Budi Santoso", "Siti Rahayu", "Ahmad Wijaya")
  - Auto-numbering format: A001, A002, A003...
  - Random status distribution across Pending, In Progress, Done
  - Include service field with realistic services (e.g., "General Consultation", "Payment", "Document Processing")
  - Include customPayload with sample data (e.g., `{ priority: 'high' }`, `{ tags: ['vip'] }`)
  - Create `/fe/src/data/defaultStatuses.ts` with default statuses
  - Default statuses: Pending (gray), In Progress (blue), Done (green)
  - Each status has id, label, color, order

  **Must NOT do**:
  - Do NOT use fewer than 15 or more than 25 queue items
  - Do NOT use non-Indonesian names in dummy data
  - Do NOT create duplicate queue numbers
  - Do NOT omit customPayload field

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Generate data following specified patterns
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5)
  - **Blocks**: Task 10
  - **Blocked By**: Task 8

  **References**:
  - Task description - Dummy data requirements
  - Draft document - Complete data specifications with customPayload

  **Acceptance Criteria**:
  - [ ] File `/fe/src/data/dummyQueues.ts` exists with 15-25 queue items
  - [ ] Queue items have Indonesian names (verify: contains "Budi", "Siti", "Ahmad", "Dewi", etc.)
  - [ ] Queue numbers follow A001, A002, A003... format
  - [ ] Status distribution includes items in Pending, In Progress, Done
  - [ ] Queue items include customPayload field with sample data
  - [ ] File `/fe/src/data/defaultStatuses.ts` exists with 3 statuses
  - [ ] Statuses have correct structure with id, label, color, order
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Dummy queues created with correct structure and customPayload
    Tool: Read
    Preconditions: Type definitions exist
    Steps:
      1. Read: `/fe/src/data/dummyQueues.ts`
      2. Assert: Contains `export const dummyQueues: QueueItem[]`
      3. Assert: Array length is between 15 and 25
      4. Assert: Contains Indonesian names (check for "Budi", "Siti", "Ahmad", "Dewi", "Rina", "Joko", "Agus", "Putri", "Bayu", "Lestari", etc.)
      5. Assert: Queue numbers match pattern A[0-9]{3} (e.g., A001, A002)
      6. Assert: Items have createdAt and updatedAt as ISO strings
      7. Assert: Items have customPayload field with sample data
      8. Assert: Some customPayload examples include different structures (e.g., { priority: 'high' }, { tags: ['vip'] })
    Expected Result: 15-25 queue items with Indonesian names, A-number format, and customPayload
    Evidence: File contents captured

  Scenario: Default statuses created correctly
    Tool: Read
    Preconditions: Type definitions exist
    Steps:
      1. Read: `/fe/src/data/defaultStatuses.ts`
      2. Assert: Contains `export const defaultStatuses: QueueStatus[]`
      3. Assert: Array length is 3
      4. Assert: Status with label "Pending" exists with order 1
      5. Assert: Status with label "In Progress" exists with order 2
      6. Assert: Status with label "Done" exists with order 3
      7. Assert: All statuses have color property (hex code or Tailwind color)
    Expected Result: 3 default statuses with correct structure
    Evidence: File contents captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of `/fe/src/data/dummyQueues.ts`
  - [ ] Contents of `/fe/src/data/defaultStatuses.ts`

  **Commit**: NO (wait for wave completion)

- [ ] 10. Build mock services

  **What to do**:
  - Create `/fe/src/services/mockQueueService.ts`
  - Implement `getAll()`: Returns array of queues with 500ms delay
  - Implement `create(queueData)`: Creates new queue with auto-number, 500ms delay
  - Implement `updateStatus(id, statusId)`: Updates queue status, 500ms delay
  - Implement `delete(id)`: Deletes queue, 500ms delay
  - Create `/fe/src/services/mockStatusService.ts`
  - Implement `getAll()`: Returns array of statuses, 500ms delay
  - Implement `create(statusData)`: Creates new status, 500ms delay
  - Implement `update(id, statusData)`: Updates status, 500ms delay
  - Implement `delete(id)`: Deletes status, 500ms delay
  - Use in-memory storage (arrays) for data
  - Create `/fe/src/services/index.ts` to export services

  **Must NOT do**:
  - Do NOT use real API calls or fetch
  - Do NOT persist data to localStorage
  - Do NOT simulate network errors
  - Do NOT use delay longer than 1000ms

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Service layer with Promise + setTimeout pattern
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 5)
  - **Blocks**: Task 11
  - **Blocked By**: Task 9

  **References**:
  - Task description - Mock service layer requirements
  - Draft document - Service method specifications

  **Acceptance Criteria**:
  - [ ] File `/fe/src/services/mockQueueService.ts` exists with getAll, create, updateStatus, delete methods
  - [ ] File `/fe/src/services/mockStatusService.ts` exists with getAll, create, update, delete methods
  - [ ] File `/fe/src/services/index.ts` exports both services
  - [ ] All methods return Promise with 500ms delay
  - [ ] `getAll` methods return arrays with correct types (QueueItem[], QueueStatus[])
  - [ ] `create` methods add items to in-memory storage
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Mock queue service methods work correctly
    Tool: Bash (node)
    Preconditions: Services created
    Steps:
      1. Create test script: test-queue-service.mjs
      2. Import: mockQueueService
      3. Run: `await mockQueueService.getAll()`
      4. Assert: Returns array with length > 0
      5. Assert: Returns QueueItem[] with customPayload field
      6. Run: `await mockQueueService.create({name: "Test", service: "Test Service", statusId: "1"})`
      7. Assert: Returns queue with id and queueNumber
      8. Assert: Returns queue with customPayload field
      9. Run: `await mockQueueService.getAll()`
      10. Assert: Array length increased by 1
    Expected Result: Service methods create and return data correctly with customPayload
    Evidence: Test script output captured

  Scenario: Mock status service methods work correctly
    Tool: Bash (node)
    Preconditions: Services created
    Steps:
      1. Create test script: test-status-service.mjs
      2. Import: mockStatusService
      3. Run: `await mockStatusService.getAll()`
      4. Assert: Returns array with 3 statuses
      5. Run: `await mockStatusService.create({label: "Review", color: "#FFA500", order: 2})`
      6. Assert: Returns status with id
      7. Run: `await mockStatusService.getAll()`
      8. Assert: Array length is 4
    Expected Result: Status CRUD operations work correctly
    Evidence: Test script output captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of `/fe/src/services/mockQueueService.ts`
  - [ ] Contents of `/fe/src/services/mockStatusService.ts`
  - [ ] Test script outputs

  **Commit**: NO (wait for wave completion)

- [ ] 11. Create custom hooks (useQueues, useStatuses, useAutoMovement, useAutoRefresh, useViewMode, useSound)

  **What to do**:
  - Create `/fe/src/hooks/useQueues.ts` - Hook for fetching and managing queues
    - State: queues, loading, error
    - Methods: fetchQueues, addQueue, updateQueueStatus, deleteQueue
  - Create `/fe/src/hooks/useStatuses.ts` - Hook for fetching and managing statuses
    - State: statuses, loading, error
    - Methods: fetchStatuses, addStatus, updateStatus, deleteStatus
  - Create `/fe/src/hooks/useAutoMovement.ts` - Auto-movement simulation
    - Interval: 15 seconds
    - Logic: Move pending queues to in-progress, in-progress to done
    - Stop when all queues reach Done status
    - Trigger sound on movement (if sound enabled)
  - Create `/fe/src/hooks/useAutoRefresh.ts` - Auto-refresh data
    - Interval: 15 seconds
    - Trigger: Refresh queue data
  - Create `/fe/src/hooks/useViewMode.ts` - View mode toggle
    - State: viewMode ('display' | 'operator')
    - Method: toggleViewMode
    - Default: 'display'
  - Create `/fe/src/hooks/useSound.ts` - Sound effect management
    - State: soundEnabled (boolean, default: false)
    - Methods: toggleSound, playSound
    - Sound type: Simple beep using browser Audio API
    - Sound plays when: Queue status changes, Queue created, Queue deleted
  - Use React hooks (useState, useEffect) throughout

  **Must NOT do**:
  - Do NOT persist view mode or sound preference to localStorage
  - Do NOT use complex state management libraries
  - Do NOT change intervals (hardcoded 15 seconds)
  - Do NOT use complex sound libraries (simple beep only)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: React hooks with state management
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 6)
  - **Blocks**: Task 12
  - **Blocked By**: Task 10

  **References**:
  - Task description - Hook requirements
  - React hooks docs: `https://react.dev/reference/react` - useState, useEffect hooks

  **Acceptance Criteria**:
  - [ ] File `/fe/src/hooks/useQueues.ts` exists with state and methods
  - [ ] File `/fe/src/hooks/useStatuses.ts` exists with state and methods
  - [ ] File `/fe/src/hooks/useAutoMovement.ts` exists with 15s interval
  - [ ] File `/fe/src/hooks/useAutoRefresh.ts` exists with 15s interval
  - [ ] File `/fe/src/hooks/useViewMode.ts` exists with default 'display'
  - [ ] File `/fe/src/hooks/useSound.ts` exists with default false
  - [ ] useSound hook plays simple beep using Audio API
  - [ ] useAutoMovement calls useSound.playSound on queue movement
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: useQueues hook fetches and manages data
    Tool: Playwright (browser console)
    Preconditions: App running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Open browser console
      3. Wait for app to load (5s)
      4. Check: React DevTools or console for queue state
      5. Assert: Queue state contains 15-25 items
      6. Assert: Queue items have customPayload field
      7. Assert: Loading state transitions from true to false
    Expected Result: Hook fetches queues correctly with customPayload
    Evidence: Console logs and React DevTools state captured

  Scenario: useSound hook plays sound and toggles
    Tool: Playwright (browser console)
    Preconditions: App running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Open browser console
      3. Wait for app to load (5s)
      4. Check: console for useSound state
      5. Assert: soundEnabled is false (default)
      6. Trigger: Queue status change (via console or UI)
      7. Assert: No sound plays (sound disabled)
      8. Enable sound via UI toggle
      9. Check: console for useSound state
      10. Assert: soundEnabled is true
      11. Trigger: Queue status change
      12. Assert: Sound plays (check console for "Sound played" or audio output)
    Expected Result: Sound hook toggles and plays beep on movement
    Evidence: Console logs and audio behavior captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of all hook files
  - [ ] Console logs showing state changes and sound behavior

  **Commit**: NO (wait for wave completion)

- [ ] 12. Build core components (QueueCard, StatusColumn, KanbanBoard)

  **What to do**:
  - Create `/fe/src/components/QueueCard.tsx`
    - Props: queue item data, view mode
    - Display: Queue number (large, bold), customer name, service, waiting duration, status badge
    - Style: Tailwind CSS, large typography for TV
    - Draggable in Operator mode only (using dnd-kit)
    - Responsive: Smaller text on mobile, larger on TV
  - Create `/fe/src/components/StatusColumn.tsx`
    - Props: status data, queues in this status, view mode
    - Display: Column header (label, color), queue cards container
    - Style: Column with background color, scrollable cards
    - Drop zone for drag & drop in Operator mode (using dnd-kit)
    - Responsive: Stacked vertically on mobile, horizontal on desktop
  - Create `/fe/src/components/KanbanBoard.tsx`
    - Props: view mode, queues, statuses, auto-movement status
    - Display: Grid of StatusColumn components
    - Layout: Responsive - stacked on mobile, horizontal scroll on tablet, full-width on desktop
    - Style: High contrast colors, large spacing, responsive breakpoints

  **Must NOT do**:
  - Do NOT add animations beyond basic transitions
  - Do NOT use complex drag libraries beyond dnd-kit
  - Do NOT add extra fields not specified
  - Do NOT build non-responsive layout (must support all screen sizes)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: UI component building with Tailwind CSS, dnd-kit, and responsive design
  - **Skills**: `frontend-ui-ux`
    - `frontend-ui-ux`: TV-optimized large typography, responsive breakpoints, high contrast design

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 7)
  - **Blocks**: Task 13
  - **Blocked By**: Tasks 9, 11

  **References**:
  - Task description - Component requirements
  - Draft document - UI specifications with responsive design
  - dnd-kit docs: `https://docs.dndkit.com/presets/sortable` - Drag and drop patterns
  - Tailwind docs: `https://tailwindcss.com/docs/typography` - Typography utilities
  - Tailwind docs: `https://tailwindcss.com/docs/responsive-design` - Responsive utilities

  **Acceptance Criteria**:
  - [ ] File `/fe/src/components/QueueCard.tsx` exists with correct props and display
  - [ ] Queue number is large and bold (text-4xl or larger on TV, smaller on mobile)
  - [ ] Waiting duration is calculated and displayed
  - [ ] File `/fe/src/components/StatusColumn.tsx` exists with column layout
  - [ ] Column header shows status label and color
  - [ ] Drop zone configured with dnd-kit for Operator mode
  - [ ] File `/fe/src/components/KanbanBoard.tsx` exists with responsive grid layout
  - [ ] Components render with dummy data
  - [ ] Responsive layout works: stacked on mobile (<640px), horizontal on tablet/desktop
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors
  - [ ] Drag & drop works in Operator mode only

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: QueueCard displays all required information with responsive typography
    Tool: Playwright
    Preconditions: App running with dummy data
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for app to load (5s)
      3. Find: First queue card in any column
      4. Resize browser to: 1920px width (TV/desktop)
      5. Assert: Queue number visible (large, bold, text-4xl or similar)
      6. Assert: Customer name visible
      7. Assert: Service visible (if present)
      8. Assert: Waiting duration visible (e.g., "5 min ago" or "00:05:00")
      9. Assert: Status badge visible with correct color
      10. Resize browser to: 500px width (mobile)
      11. Assert: Queue number still visible but smaller (text-xl or similar)
      12. Assert: All information still readable on mobile
      13. Screenshot: .sisyphus/evidence/task-12-queue-card-tv.png (1920px)
      14. Screenshot: .sisyphus/evidence/task-12-queue-card-mobile.png (500px)
    Expected Result: All card fields displayed correctly with responsive typography
    Evidence: Screenshots captured at different screen sizes

  Scenario: KanbanBoard displays responsive layout
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for app to load (5s)
      3. Resize browser to: 500px width (mobile)
      4. Assert: Columns stacked vertically
      5. Assert: Each column takes full width
      6. Screenshot: .sisyphus/evidence/task-12-kanban-mobile.png
      7. Resize browser to: 1024px width (desktop)
      8. Assert: Columns arranged horizontally
      9. Assert: Full-width layout (no horizontal scroll)
      10. Screenshot: .sisyphus/evidence/task-12-kanban-desktop.png
    Expected Result: Responsive layout works on mobile and desktop
    Evidence: Screenshots captured

  Scenario: Drag & drop works in Operator mode
    Tool: Playwright
    Preconditions: App in Operator mode
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: View mode toggle (switch to Operator)
      3. Find: Queue card in Pending column
      4. Drag: Card to In Progress column
      5. Drop: Card in In Progress column
      6. Assert: Card moved to In Progress column
      7. Screenshot: .sisyphus/evidence/task-12-drag-and-drop.png
    Expected Result: Card moves between columns in Operator mode
    Evidence: Screenshot captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of all component files
  - [ ] Screenshots of QueueCard at different screen sizes
  - [ ] Screenshots of KanbanBoard at mobile and desktop
  - [ ] Screenshot of drag & drop action

  **Commit**: NO (wait for wave completion)

- [ ] 13. Build layout components (Topbar, Footer, EmptyState)

  **What to do**:
  - Create `/fe/src/components/Topbar.tsx`
    - Display: App title "Antree" (large), real-time clock (HH:MM:SS)
    - Style: Fixed position at top, full width, high contrast background
    - Responsive: Smaller title and clock on mobile, larger on TV
  - Create `/fe/src/components/Footer.tsx`
    - Display: Optional info (can be empty for now)
    - Style: Fixed position at bottom, minimal design
  - Create `/fe/src/components/EmptyState.tsx`
    - Display: "No queues waiting" message, illustration (emoji or icon from lucide-react)
    - Use: Shown when no queues exist in any status
    - Style: Centered, friendly design, responsive

  **Must NOT do**:
  - Do NOT add complex footer content (optional/empty)
  - Do NOT add sound notifications to footer
  - Do NOT use complex illustrations (simple emoji or icon)
  - Do NOT build non-responsive layout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout components with Tailwind CSS and responsive design
  - **Skills**: `frontend-ui-ux`
    - `frontend-ui-ux`: TV-optimized large typography, responsive breakpoints

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 7)
  - **Blocks**: Task 16
  - **Blocked By**: Task 7

  **References**:
  - Task description - Layout requirements
  - Tailwind docs: `https://tailwindcss.com/docs/flexbox` - Flexbox layout
  - Tailwind docs: `https://tailwindcss.com/docs/typography` - Typography utilities

  **Acceptance Criteria**:
  - [ ] File `/fe/src/components/Topbar.tsx` exists with title and clock
  - [ ] Clock updates every second (real-time)
  - [ ] File `/fe/src/components/Footer.tsx` exists (can be empty)
  - [ ] File `/fe/src/components/EmptyState.tsx` exists with message and illustration
  - [ ] EmptyState uses lucide-react icon for illustration
  - [ ] All components are responsive (work on mobile and TV)
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors
  - [ ] Topbar is fixed at top, full width

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Topbar displays title and clock with responsive typography
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for app to load (5s)
      3. Find: Topbar element (fixed at top)
      4. Resize browser to: 1920px width (TV)
      5. Assert: App title "Antree" visible (large text)
      6. Assert: Clock visible (HH:MM:SS format)
      7. Wait 5 seconds
      8. Assert: Clock seconds value changed
      9. Resize browser to: 500px width (mobile)
      10. Assert: App title still visible but smaller
      11. Assert: Clock still visible but smaller
      12. Screenshot: .sisyphus/evidence/task-13-topbar-tv.png (1920px)
      13. Screenshot: .sisyphus/evidence/task-13-topbar-mobile.png (500px)
    Expected Result: Topbar shows title and real-time clock with responsive typography
    Evidence: Screenshots captured

  Scenario: EmptyState displays when no queues
    Tool: Playwright
    Preconditions: App running, all queues deleted
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for app to load (5s)
      3. Delete all queues (via browser console or Operator mode)
      4. Find: Empty state element
      5. Assert: Message "No queues waiting" visible
      6. Assert: Illustration (icon or emoji) visible
      7. Assert: Element centered on screen
      8. Resize browser to: 500px width
      9. Assert: Empty state still centered and readable
      10. Screenshot: .sisyphus/evidence/task-13-empty-state-display.png
    Expected Result: Empty state displays with message and illustration (responsive)
    Evidence: Screenshot captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of Topbar.tsx, Footer.tsx, EmptyState.tsx
  - [ ] Screenshots of Topbar at TV and mobile sizes
  - [ ] Screenshot of EmptyState

  **Commit**: NO (wait for wave completion)

- [ ] 14. Build Operator Mode components (AddQueueModal, StatusManagerModal)

  **What to do**:
  - Create `/fe/src/components/AddQueueModal.tsx`
    - Use shadcn/ui Dialog for modal
    - Use React Hook Form (RHF) + Zod for form validation
    - Form fields: Customer name (required), Service (optional)
    - Actions: Submit, Cancel
    - Behavior: Create queue with auto-number, assign to Pending status, close modal
    - Style: Modal dialog with shadcn/ui form components
  - Create `/fe/src/components/StatusManagerModal.tsx`
    - Use shadcn/ui Dialog for modal
    - Use React Hook Form (RHF) + Zod for form validation
    - List: All statuses with edit/delete buttons
    - Form: Add new status (label, color, order)
    - Actions: Create status, update status, delete status, reorder
    - Validation: At least one status must exist, prevent deletion if queues use it
    - Style: Modal dialog with list and shadcn/ui forms

  **Must NOT do**:
  - Do NOT use form validation libraries beyond RHF + Zod
  - Do NOT delete status if queues reference it (show error)
  - Do NOT allow empty status label

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Modal components with shadcn/ui and RHF forms
  - **Skills**: `frontend-ui-ux`
    - `frontend-ui-ux`: Form design and user-friendly modals

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 8)
  - **Blocks**: Task 16
  - **Blocked By**: Tasks 11, 12

  **References**:
  - Task description - Operator Mode requirements
  - Task description - Status Management requirements
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/dialog` - Dialog component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/form` - Form components with RHF
  - RHF docs: `https://react-hook-form.com/` - React Hook Form patterns
  - Draft document - RHF + Zod requirements

  **Acceptance Criteria**:
  - [ ] File `/fe/src/components/AddQueueModal.tsx` exists with shadcn Dialog and RHF form
  - [ ] Form has name (required) and service (optional) fields
  - [ ] Form uses Zod schema for validation
  - [ ] Submit creates queue in Pending status with auto-number
  - [ ] File `/fe/src/components/StatusManagerModal.tsx` exists
  - [ ] Modal lists all statuses with edit/delete options
  - [ ] Add status form uses Zod schema
  - [ ] Validation prevents deleting status with queues
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: AddQueueModal creates new queue with RHF validation
    Tool: Playwright
    Preconditions: App in Operator mode
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: View mode toggle (Operator)
      3. Click: "Add Queue" button
      4. Wait: Modal opens (3s)
      5. Find: Name input field
      6. Assert: Validation shows error for empty name (e.g., "Name is required")
      7. Fill: Customer name input → "Test Customer"
      8. Fill: Service input → "Test Service"
      9. Click: Submit button
      10. Wait: Modal closes (3s)
      11. Find: New queue in Pending column
      12. Assert: Queue with "Test Customer" visible
      13. Assert: Queue number auto-generated (e.g., A026)
      14. Screenshot: .sisyphus/evidence/task-14-add-queue.png
    Expected Result: Queue created with RHF validation and auto-number in Pending
    Evidence: Screenshot captured

  Scenario: StatusManagerModal prevents deleting status with queues
    Tool: Playwright
    Preconditions: App in Operator mode, queues exist
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: View mode toggle (Operator)
      3. Click: "Manage Statuses" button
      4. Wait: Modal opens (3s)
      5. Find: Status with queues (e.g., "Pending")
      6. Click: Delete button
      7. Assert: Error message visible ("Cannot delete status with queues")
      8. Assert: Status not deleted (still visible in list)
      9. Screenshot: .sisyphus/evidence/task-14-status-delete-error.png
    Expected Result: Error shown when deleting status with queues
    Evidence: Screenshot captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of AddQueueModal.tsx and StatusManagerModal.tsx
  - [ ] Screenshots of add queue with validation
  - [ ] Screenshot of delete error

  **Commit**: NO (wait for wave completion)

- [ ] 15. Build control components (ViewModeToggle, SoundToggle)

  **What to do**:
  - Create `/fe/src/components/ViewModeToggle.tsx`
    - Use shadcn/ui Button component
    - Button to toggle between Display and Operator modes
    - Visual indicator: Show current mode (e.g., "TV Display" / "Operator")
    - Style: Toggle button, high contrast, positioned in top-right of Topbar
    - Visible in both modes (allows toggling)
  - Create `/fe/src/components/SoundToggle.tsx`
    - Use shadcn/ui Switch component
    - Toggle: Sound on/off in Operator Mode
    - Default: Off (false)
    - Style: Switch with label "Sound Effects", positioned in Operator Mode controls

  **Must NOT do**:
  - Do NOT persist mode or sound preference (resets on page load)
  - Do NOT use complex toggle animations

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Simple toggle components with shadcn/ui
  - **Skills**: `frontend-ui-ux`
    - `frontend-ui-ux`: Button design and visual feedback

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 8)
  - **Blocks**: Task 16
  - **Blocked By**: Task 11

  **References**:
  - Task description - View Mode requirements
  - Task description - Sound effect requirements
  - useViewMode and useSound hook implementations
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/button` - Button component
  - shadcn/ui docs: `https://ui.shadcn.com/docs/components/switch` - Switch component

  **Acceptance Criteria**:
  - [ ] File `/fe/src/components/ViewModeToggle.tsx` exists
  - [ ] Button toggles between Display and Operator modes
  - [ ] Visual indicator shows current mode
  - [ ] Button positioned in top-right corner
  - [ ] File `/fe/src/components/SoundToggle.tsx` exists
  - [ ] Uses shadcn/ui Switch component
  - [ ] Default state is off (false)
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: ViewModeToggle switches modes correctly
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for app to load (5s)
      3. Find: View mode toggle button (top-right)
      4. Assert: Button shows current mode (e.g., "TV Display")
      5. Click: Toggle button
      6. Assert: View changes to Operator mode
      7. Assert: Button text changes to "Operator"
      8. Assert: Edit controls appear on screen (SoundToggle, Add Queue, Manage Statuses)
      9. Screenshot: .sisyphus/evidence/task-15-view-toggle-operator.png
      10. Click: Toggle button again
      11. Assert: View changes to Display mode
      12. Assert: Edit controls disappear
      13. Screenshot: .sisyphus/evidence/task-15-view-toggle-display.png
    Expected Result: Toggle switches modes correctly with visual feedback
    Evidence: Screenshots captured

  Scenario: SoundToggle enables/disables sound
    Tool: Playwright
    Preconditions: App in Operator mode
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: View mode toggle (Operator)
      3. Find: SoundToggle switch
      4. Assert: Switch is in "off" position (default)
      5. Assert: Label "Sound Effects" visible
      6. Click: Toggle switch to "on"
      7. Assert: Switch moves to "on" position
      8. Trigger: Queue status change (e.g., drag card)
      9. Assert: Sound plays (check console or listen for audio)
      10. Click: Toggle switch to "off"
      11. Trigger: Queue status change
      12. Assert: No sound plays (sound disabled)
      13. Screenshot: .sisyphus/evidence/task-15-sound-toggle.png
    Expected Result: Sound toggle enables/disables sound effects
    Evidence: Screenshot captured and console/audio behavior
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of ViewModeToggle.tsx and SoundToggle.tsx
  - [ ] Screenshots of both view modes
  - [ ] Screenshot of sound toggle with both states

  **Commit**: NO (wait for wave completion)

- [ ] 16. Integrate App component with view modes and responsive design

  **What to do**:
  - Update `/fe/src/App.tsx`
    - Integrate Topbar (with ViewModeToggle and SoundToggle), KanbanBoard, Footer components
    - Integrate AddQueueModal and StatusManagerModal (Operator mode only)
    - Integrate EmptyState (when no queues)
    - Use useQueues, useStatuses, useAutoMovement, useAutoRefresh, useViewMode, useSound hooks
    - Render conditionally based on view mode:
      - Display Mode: Show board, hide edit controls, enable auto-refresh, enable auto-movement
      - Operator Mode: Show board, show edit controls (Add Queue, Manage Statuses, Sound Toggle), disable auto-refresh, disable auto-movement
    - Update `/fe/src/index.css` with global Tailwind directives
    - Update `/fe/src/main.tsx` to render App
  - Style: Full height layout, no scroll on body (scroll within columns)
  - Responsive design: Use Tailwind responsive classes (sm, md, lg, xl, 2xl)
  - Mobile (< 640px): Stacked columns, simplified UI, small typography
  - Tablet (640-1024px): Horizontal scrollable columns, medium typography
  - Desktop (1024-1920px): Full-width Kanban board, large typography
  - TV (> 1920px): Extra large typography, high contrast, full width

  **Must NOT do**:
  - Do NOT enable auto-refresh/auto-movement in Operator mode
  - Do NOT show edit controls in Display mode
  - Do NOT add routing (single page app only)
  - Do NOT build non-responsive layout

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Main app integration with conditional rendering and responsive design
  - **Skills**: `frontend-ui-ux`
    - `frontend-ui-ux`: TV-optimized layout, responsive breakpoints, conditional UI

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 9)
  - **Blocks**: Task 17
  - **Blocked By**: Tasks 12, 13, 14, 15

  **References**:
  - Task description - App integration requirements
  - Task description - View Mode specifications
  - Draft document - Responsive design requirements
  - Tailwind docs: `https://tailwindcss.com/docs/responsive-design` - Responsive utilities

  **Acceptance Criteria**:
  - [ ] `/fe/src/App.tsx` integrates all components
  - [ ] Display Mode: Shows board, hides edit controls, enables auto-features
  - [ ] Operator Mode: Shows board, shows edit controls, disables auto-features
  - [ ] EmptyState shows when no queues exist
  - [ ] Default view is Display Mode on app load
  - [ ] `/fe/src/index.css` has Tailwind directives
  - [ ] `/fe/src/main.tsx` renders App component
  - [ ] Layout is responsive at all breakpoints (< 640px, 640-1024px, 1024-1920px, > 1920px)
  - [ ] Command `cd /fe && pnpm run dev` → App loads without errors
  - [ ] Command `cd /fe && pnpm exec tsc --noEmit` → No TypeScript errors

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: App loads in Display Mode by default with responsive layout
    Tool: Playwright
    Preconditions: Dev server running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait for app to load (5s)
      3. Resize browser to: 1920px width (TV)
      4. Assert: Kanban board visible (full width)
      5. Assert: Topbar visible with "Antree" title and clock
      6. Assert: ViewModeToggle button shows "TV Display" or similar
      7. Assert: No "Add Queue" button visible
      8. Assert: No "Manage Statuses" button visible
      9. Assert: No "Sound Toggle" visible
      10. Assert: Empty state NOT visible (queues exist)
      11. Screenshot: .sisyphus/evidence/task-16-display-mode-tv.png (1920px)
      12. Resize browser to: 500px width (mobile)
      13. Assert: Columns stacked vertically
      14. Assert: All content still readable
      15. Screenshot: .sisyphus/evidence/task-16-display-mode-mobile.png (500px)
    Expected Result: App loads in Display Mode with correct UI at all screen sizes
    Evidence: Screenshots captured at different breakpoints

  Scenario: Switching to Operator Mode shows edit controls
    Tool: Playwright
    Preconditions: App in Display Mode
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: ViewModeToggle
      3. Wait: UI updates (3s)
      4. Resize browser to: 1024px width (desktop)
      5. Assert: "Add Queue" button visible
      6. Assert: "Manage Statuses" button visible
      7. Assert: Sound Toggle visible (in Operator Mode controls)
      8. Assert: Queue cards become draggable (dnd-kit enabled)
      9. Screenshot: .sisyphus/evidence/task-16-operator-mode-desktop.png (1024px)
      10. Resize browser to: 500px width (mobile)
      11. Assert: Operator Mode controls still accessible
      12. Assert: Controls are responsive (stacked or smaller)
      13. Screenshot: .sisyphus/evidence/task-16-operator-mode-mobile.png (500px)
    Expected Result: Operator Mode shows edit controls responsively
    Evidence: Screenshots captured at different breakpoints

  Scenario: Auto-features disabled in Operator Mode
    Tool: Playwright
    Preconditions: App in Operator Mode
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: ViewModeToggle (Operator)
      3. Wait: 20 seconds
      4. Count: Queues in each column
      5. Assert: No queues moved (auto-movement disabled)
      6. Check: Network tab for API calls
      7. Assert: No new API calls after initial load (auto-refresh disabled)
      8. Screenshot: .sisyphus/evidence/task-16-operator-no-auto.png
    Expected Result: Auto-features disabled in Operator Mode
    Evidence: Screenshot and network logs captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of App.tsx, main.tsx, index.css
  - [ ] Screenshots of Display Mode at TV and mobile
  - [ ] Screenshots of Operator Mode at desktop and mobile
  - [ ] Screenshot showing auto-features disabled

  **Commit**: NO (wait for wave completion)

- [ ] 17. Implement auto-refresh and auto-movement features

  **What to do**:
  - Integrate useAutoRefresh hook into App component
    - Enable in Display Mode only
    - Disable in Operator Mode
    - Trigger queue data refresh every 15 seconds
  - Integrate useAutoMovement hook into App component
    - Enable in Display Mode only
    - Disable in Operator Mode
    - Move queues sequentially every 15 seconds
    - Call useSound.playSound() on queue movement (if sound enabled)
    - Stop when all queues reach Done
  - Ensure hooks use useViewMode to check current mode
  - Ensure hooks use useSound to play sounds when enabled

  **Must NOT do**:
  - Do NOT enable auto-refresh/auto-movement in Operator Mode
  - Do NOT change 15-second interval
  - Do NOT add complex refresh logic (simple data fetch)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Hook integration with useEffect
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 10)
  - **Blocks**: Task 19
  - **Blocked By**: Task 16

  **References**:
  - Task description - Auto-refresh and auto-movement requirements
  - Draft document - Updated requirements with sound effects
  - useAutoRefresh, useAutoMovement, useViewMode, useSound hook implementations

  **Acceptance Criteria**:
  - [ ] Auto-refresh triggers every 15s in Display Mode only
  - [ ] Auto-refresh is disabled in Operator Mode
  - [ ] Queue data refreshes without page reload
  - [ ] Clock in Topbar updates every second
  - [ ] Auto-movement moves queues sequentially every 15s in Display Mode only
  - [ ] Auto-movement stops when all queues reach Done
  - [ ] Auto-movement is disabled in Operator Mode
  - [ ] Sound plays on queue movement when enabled
  - [ ] Sound does NOT play when disabled

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Auto-refresh updates queue data every 15s in Display Mode
    Tool: Playwright
    Preconditions: App in Display Mode
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait: App loads (5s)
      3. Note: Queue data timestamp from API response
      4. Wait: 15 seconds
      5. Check: Network tab for new API call
      6. Assert: New API request made (mock service called)
      7. Assert: No page reload occurred
      8. Wait: Another 15 seconds
      9. Check: Network tab for another API call
      10. Assert: Another API request made
    Expected Result: Auto-refresh triggers data fetch every 15s
    Evidence: Network logs and timestamps captured

  Scenario: Auto-movement moves queues sequentially with sound
    Tool: Playwright
    Preconditions: App in Display Mode, queues in Pending
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: ViewModeToggle (ensure Display Mode)
      3. Find: SoundToggle (should be visible in both modes)
      4. Click: SoundToggle to "on"
      5. Wait: App loads (5s)
      6. Count: Queues in Pending (e.g., 10)
      7. Count: Queues in In Progress (e.g., 0)
      8. Count: Queues in Done (e.g., 0)
      9. Wait: 15 seconds
      10. Count: Queues in Pending (should be 9)
      11. Count: Queues in In Progress (should be 1)
      12. Count: Queues in Done (should be 0)
      13. Assert: Sound played (check console or listen for audio)
      14. Wait: 15 seconds
      15. Count: Queues in In Progress (should be 0-1)
      16. Count: Queues in Done (should be 1)
      17. Assert: Sound played again
      18. Screenshot: .sisyphus/evidence/task-17-auto-movement-1.png
      19. Wait: 15 seconds
      20. Count: Queues in Done (should be 2)
      21. Screenshot: .sisyphus/evidence/task-17-auto-movement-2.png
    Expected Result: Queues move sequentially every 15s with sound
    Evidence: Screenshots captured at each interval

  Scenario: Auto-movement stops when all queues Done
    Tool: Playwright
    Preconditions: App in Display Mode
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait until all queues reach Done status (may take multiple intervals)
      3. Count: Queues in Pending (should be 0)
      4. Count: Queues in In Progress (should be 0)
      5. Count: Queues in Done (should be 15-25)
      6. Wait: 30 seconds
      7. Count: Queues in each column again
      8. Assert: No change in counts (auto-movement stopped)
      9. Screenshot: .sisyphus/evidence/task-17-auto-movement-stopped.png
    Expected Result: Auto-movement stops when all Done
    Evidence: Screenshot captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Screenshots showing queue movement at each interval
  - [ ] Screenshot showing auto-movement stopped
  - [ ] Console logs showing movement events and sound plays
  - [ ] Network logs showing auto-refresh calls

  **Commit**: NO (wait for wave completion)

- [ ] 18. Implement sound effects feature

  **What to do**:
  - Verify useSound hook is complete from Task 11
  - Ensure useSound uses browser Audio API for simple beep
  - Sound should play when:
    - Queue status changes (drag & drop or auto-movement)
    - Queue created
    - Queue deleted
  - Default state: Off (false)
  - Toggle available in Operator Mode via SoundToggle component
  - Sound type: Simple beep using `new Audio('/beep.mp3')` or `AudioContext` oscillator
  - For simplicity, use browser oscillator beep (no audio file needed)

  **Must NOT do**:
  - Do NOT use sound by default (off by default)
  - Do NOT use complex sound libraries or files
  - Do NOT add sound effects to any feature except queue movement

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Sound effect implementation with browser Audio API
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 10)
  - **Blocks**: Task 19
  - **Blocked By**: Task 16

  **References**:
  - Task description - Sound effect requirements
  - Draft document - Updated requirements with sound effects
  - MDN docs: `https://developer.mozilla.org/en-US/docs/Web/API/AudioContext` - Browser Audio API

  **Acceptance Criteria**:
  - [ ] useSound hook creates simple beep sound using AudioContext
  - [ ] Sound plays on queue movement (when enabled)
  - [ ] Sound plays on queue creation (when enabled)
  - [ ] Sound plays on queue deletion (when enabled)
  - [ ] Default state is off (false)
  - [ ] SoundToggle in Operator Mode controls sound on/off

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Sound plays on queue movement when enabled
    Tool: Playwright
    Preconditions: App running, sound enabled
    Steps:
      1. Navigate to: http://localhost:5173
      2. Click: ViewModeToggle (Operator)
      3. Find: SoundToggle
      4. Click: Toggle to "on"
      5. Find: Queue card
      6. Drag: Card from Pending to In Progress
      7. Drop: Card in In Progress column
      8. Assert: Sound plays (check console for "Sound played" or listen for audio)
      9. Screenshot: .sisyphus/evidence/task-18-sound-on-movement.png
    Expected Result: Sound plays on queue movement when enabled
    Evidence: Screenshot and console/audio behavior captured

  Scenario: Sound does not play when disabled
    Tool: Playwright
    Preconditions: App running, sound disabled
    Steps:
      1. Navigate to: http://localhost:5173
      2. Ensure SoundToggle is "off" (default)
      3. Find: Queue card
      4. Drag: Card from Pending to In Progress
      5. Drop: Card in In Progress column
      6. Assert: No sound plays (check console or listen for audio)
      7. Screenshot: .sisyphus/evidence/task-18-no-sound.png
    Expected Result: No sound plays when disabled
    Evidence: Screenshot and console/audio behavior captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Contents of useSound hook
  - [ ] Screenshot of sound on movement
  - [ ] Screenshot of no sound when disabled

  **Commit**: NO (wait for wave completion)

- [ ] 19. Final integration and verification

  **What to do**:
  - Run full build: `cd /fe && pnpm run build`
  - Verify build succeeds with no errors
  - Run preview: `cd /fe && pnpm run preview`
  - Verify production build serves correctly
  - Test all features end-to-end across responsive breakpoints:
    - Mobile (< 640px): Display Mode, Operator Mode
    - Tablet (640-1024px): Display Mode, Operator Mode
    - Desktop (1024-1920px): Display Mode, Operator Mode
    - TV (> 1920px): Display Mode, Operator Mode
  - Test all features:
    - Display Mode: Board loads, auto-refresh works, auto-movement works, clock updates, responsive layout
    - Operator Mode: Add queue works, drag & drop works, status management works, sound toggle works
    - View toggle: Switches between modes correctly
    - Empty state: Displays when no queues
    - Edge cases: All queues Done → auto-movement stops
  - Check bundle size (optional but recommended)
  - Clean up any temporary files or console.log statements

  **Must NOT do**:
  - Do NOT deploy (this is a verification step only)
  - Do NOT add any new features

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Build verification and end-to-end testing
  - **Skills**: None required

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (Wave 11, final task)
  - **Blocks**: None (task complete)
  - **Blocked By**: Tasks 17, 18

  **References**:
  - Task description - Expected Result section
  - Definition of Done checklist

  **Acceptance Criteria**:
  - [ ] Command `cd /fe && pnpm run build` → Build succeeds with no errors
  - [ ] Command `cd /fe && pnpm run preview` → Production build serves on localhost:4173
  - [ ] All features tested and working correctly at all responsive breakpoints
  - [ ] No console errors in browser
  - [ ] Bundle size is reasonable (under 500KB gzipped recommended)

  **Agent-Executed QA Scenarios**:

  \`\`\`
  Scenario: Production build succeeds
    Tool: Bash
    Preconditions: All features implemented
    Steps:
      1. Run: `cd /fe && pnpm run build`
      2. Assert: Exit code is 0
      3. Assert: Output contains "dist/" directory created
      4. Assert: No error messages in output
      5. Run: `ls -la /fe/dist`
      6. Assert: Contains index.html, assets/
    Expected Result: Build succeeds with dist/ directory
    Evidence: Build output and dist/ listing captured

  Scenario: Production preview serves correctly with responsive layouts
    Tool: Playwright
    Preconditions: Production build exists
    Steps:
      1. Run: `cd /fe && pnpm run preview &`
      2. Wait: 5 seconds
      3. Navigate to: http://localhost:4173
      4. Resize browser to: 1920px (TV)
      5. Wait: Page loads (5s)
      6. Assert: Kanban board visible (full width)
      7. Assert: Queues displayed correctly
      8. Resize browser to: 500px (mobile)
      9. Assert: Columns stacked vertically
      10. Assert: All content readable
      11. Screenshot: .sisyphus/evidence/task-19-production-tv.png (1920px)
      12. Screenshot: .sisyphus/evidence/task-19-production-mobile.png (500px)
      13. Stop: preview process
    Expected Result: Production build serves and displays correctly at all sizes
    Evidence: Screenshots captured

  Scenario: Full end-to-end feature test at multiple breakpoints
    Tool: Playwright
    Preconditions: Production build or dev server running
    Steps:
      1. Navigate to: http://localhost:5173 (dev) or 4173 (preview)
      2. Resize browser to: 1024px (desktop)
      3. Wait: App loads (5s)
      4. Assert: Default view is Display Mode
      5. Assert: Kanban board with 3 columns visible
      6. Assert: 15-25 queues visible across columns
      7. Assert: Topbar shows "Antree" and clock
      8. Click: ViewModeToggle
      9. Assert: Switches to Operator Mode
      10. Assert: "Add Queue", "Manage Statuses", "Sound Toggle" buttons visible
      11. Click: "Add Queue"
      12. Fill: Name → "E2E Test Customer", Service → "E2E Service"
      13. Click: Submit
      14. Assert: New queue appears in Pending
      15. Drag: First queue from Pending to In Progress
      16. Assert: Queue moved to In Progress
      17. Find: SoundToggle
      18. Click: Toggle to "on"
      19. Drag: Queue from In Progress to Done
      20. Assert: Sound plays (check console)
      21. Click: ViewModeToggle
      22. Assert: Switches to Display Mode
      23. Wait: 15 seconds
      24. Assert: At least one queue moved to next status
      25. Resize browser to: 500px (mobile)
      26. Assert: Columns stacked vertically
      27. Assert: All controls accessible and readable
      28. Screenshot: .sisyphus/evidence/task-19-full-e2e-desktop.png (1024px)
      29. Screenshot: .sisyphus/evidence/task-19-full-e2e-mobile.png (500px)
    Expected Result: All features work end-to-end at multiple breakpoints
    Evidence: Screenshots captured

  Scenario: Edge case - All queues Done stops auto-movement
    Tool: Playwright
    Preconditions: App running with queues
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait until all queues reach Done status (may take multiple intervals)
      3. Count: Queues in Pending = 0, In Progress = 0, Done = 15-25
      4. Wait: 30 seconds
      5. Count: Queues in each column again
      6. Assert: No change in counts (auto-movement stopped)
      7. Screenshot: .sisyphus/evidence/task-19-all-done.png
    Expected Result: Auto-movement stops when all Done
    Evidence: Screenshot captured

  Scenario: No console errors in browser
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Navigate to: http://localhost:5173
      2. Wait: App loads (5s)
      3. Open: Browser console
      4. Check: For any red error messages
      5. Assert: No errors in console
      6. Interact: Click buttons, toggle views, add queue, drag cards
      7. Check: Console again
      8. Assert: No errors after interactions
    Expected Result: No console errors throughout app usage
    Evidence: Console logs captured
  \`\`\`

  **Evidence to Capture**:
  - [ ] Build output log
  - [ ] Production preview screenshot at TV size
  - [ ] Production preview screenshot at mobile size
  - [ ] Full E2E test screenshot at desktop and mobile
  - [ ] Edge case screenshot (all Done)
  - [ ] Browser console logs (no errors)
  - [ ] Bundle size report (if available)

  **Commit**: NO (plan complete, no commits specified)

---

## Commit Strategy

This is a greenfield project with no specified commit strategy. The executing agent may choose to create commits after each wave or at the end, based on best practices. No specific commit messages are required.

**Recommended Commits** (optional):
- After Wave 0: "chore: initialize git repositories and create API contract"
- After Wave 1: "chore: initialize Vite + React + TypeScript project"
- After Wave 2: "chore: add Tailwind CSS and shadcn/ui configuration"
- After Wave 3: "chore: install shadcn/ui components and configure RHF + Zod"
- After Wave 4: "chore: add types and utility functions"
- After Wave 5: "feat: add dummy data and mock services"
- After Wave 6: "feat: add custom hooks (queues, statuses, auto-movement, auto-refresh, view mode, sound)"
- After Wave 7: "feat: build core Kanban components (QueueCard, StatusColumn, KanbanBoard)"
- After Wave 8: "feat: build layout components (Topbar, Footer, EmptyState)"
- After Wave 9: "feat: add Operator Mode components (AddQueueModal, StatusManagerModal)"
- After Wave 10: "feat: add control components (ViewModeToggle, SoundToggle)"
- After Wave 11: "feat: integrate App with view modes and responsive design"
- After Wave 12: "feat: implement auto-refresh and auto-movement with sound effects"
- After Wave 13: "chore: final integration and verification"

---

## Success Criteria

### Verification Commands
```bash
# Build verification
cd /fe && pnpm run build
# Expected: Build succeeds, dist/ directory created

# Dev server
cd /fe && pnpm run dev
# Expected: Server starts on http://localhost:5173

# TypeScript check
cd /fe && pnpm exec tsc --noEmit
# Expected: No errors

# Production preview
cd /fe && pnpm run preview
# Expected: Preview server on http://localhost:4173
```

### Final Checklist

**Project Setup**:
- [ ] Vite + React + TypeScript initialized in `/fe`
- [ ] Tailwind CSS configured with responsive breakpoints
- [ ] shadcn/ui configured and components installed (dialog, button, input, select, card, badge, form, switch, label)
- [ ] React Hook Form (RHF) + Zod configured
- [ ] dnd-kit, lucide-react, clsx, tailwind-merge installed
- [ ] pnpm package manager used

**Core Features**:
- [ ] Kanban board with dynamic status columns
- [ ] Queue cards with number, name, service, duration, status badge, customPayload
- [ ] 15-25 dummy queue items with Indonesian names and customPayload
- [ ] Default statuses: Pending, In Progress, Done

**View Modes**:
- [ ] Display Mode: Fullscreen, auto-refresh (15s), auto-movement (15s), no edit controls
- [ ] Operator Mode: Add queue, update status, drag & drop, status management UI, sound toggle
- [ ] View mode toggle works correctly
- [ ] Default view: Display Mode on app load

**Responsive Design**:
- [ ] Mobile (< 640px): Stacked columns, readable UI, small typography
- [ ] Tablet (640-1024px): Horizontal scrollable columns, medium typography
- [ ] Desktop (1024-1920px): Full-width Kanban board, large typography
- [ ] TV (> 1920px): Extra large typography, high contrast, full-width layout

**Auto-Features**:
- [ ] Auto-refresh triggers every 15s in Display Mode only
- [ ] Auto-refresh is disabled in Operator Mode
- [ ] Auto-movement moves queues sequentially every 15s in Display Mode only
- [ ] Auto-movement stops when all queues reach Done
- [ ] Auto-movement is disabled in Operator Mode
- [ ] Sound plays on queue movement when enabled (off by default)
- [ ] Sound does not play when disabled

**CRUD Operations**:
- [ ] Add queue works (auto-number assigned, defaults to Pending, RHF validation)
- [ ] Update status works (drag & drop or status change)
- [ ] Status management works (create, edit, delete, reorder, RHF validation)
- [ ] Validation prevents deleting status with queues

**UI/UX**:
- [ ] TV/monitor optimized (large typography, high contrast, 1920px+ layout)
- [ ] Responsive layouts at all breakpoints (< 640px, 640-1024px, 1024-1920px, > 1920px)
- [ ] Topbar with app title "Antree" and real-time clock
- [ ] Empty state displays "No queues waiting" with illustration
- [ ] Fullscreen dashboard layout
- [ ] No horizontal scroll at 1920px width

**Technical**:
- [ ] TypeScript compiles without errors
- [ ] Build succeeds with no errors
- [ ] Production build serves correctly
- [ ] No console errors in browser
- [ ] Tailwind CSS styles applied correctly
- [ ] shadcn/ui components render correctly
- [ ] dnd-kit drag & drop works in Operator mode
- [ ] RHF + Zod validation works correctly
- [ ] useSound hook plays simple beep

**Guardrails (Must NOT Have)**:
- [ ] No authentication or security features
- [ ] No localStorage or persistence
- [ ] No real backend or external API calls
- [ ] No complex animations
- [ ] No multi-language support (English UI only)
- [ ] No advanced Kanban features (swimlanes, labels, subtasks)
- [ ] No analytics or statistics
- [ ] No theming system (single high-contrast theme)
- [ ] No admin dashboard beyond Operator Mode

---

## Notes

### Setup Tasks (Wave 0)

**Git Initialization**:
- Initialize git repositories in three locations: root, `/be`, `/fe`
- Each is a separate git repository (not git submodules)
- No commits required during setup

**.gitignore Files**:
- Root: Ignore node_modules, dist, .env, .DS_Store, *.log
- Frontend (`/fe`): Additional ignores: .vite, vite-env.d.ts, build/
- Backend (`/be`): Standard backend ignores

**OpenCode Configuration**:
- Configure package manager as pnpm for local operations
- Support monorepo structure (root, /be, /fe)
- Config file format depends on OpenCode requirements

**API Contract Documentation**:
- Located at `/docs/api-contract.md`
- Must be created BEFORE any implementation
- Serves as contract between frontend mock services and future backend
- Contains all CRUD endpoints for QueueService and StatusService
- Includes request/response schemas matching QueueItem and QueueStatus types (with customPayload)

### Tech Stack Details

**Vite + React + TypeScript**:
- Modern build tooling and UI library
- Type safety with TypeScript

**shadcn/ui**:
- Copy-paste components (not npm package install)
- Components: Dialog, Button, Input, Select, Card, Badge, Form (FormControl, FormField, FormItem, FormLabel, FormMessage), Switch, Label
- Built with Tailwind CSS
- Accessible and customizable

**React Hook Form (RHF) + Zod**:
- Form validation with RHF
- Zod schemas for TypeScript safety
- @hookform/resolvers for RHF + Zod integration

**Responsive Design**:
- Mobile (< 640px, sm): Stacked columns, small text, simplified UI
- Tablet (640-1024px, md-lg): Scrollable columns, medium text
- Desktop (1024-1920px, xl): Full-width layout, large text
- TV (> 1920px, 2xl): Extra large text, high contrast, full-width

**dnd-kit**:
- Modern drag & drop library with TypeScript support
- Better than react-beautiful-dnd for TS

**Custom Payload Object**:
- Single flexible object: `customPayload?: Record<string, any>`
- Examples: `{ priority: 'high' }`, `{ tags: ['vip'] }`, `{ channel: 'online' }`
- Extensible for any customization needs

**Sound Effects**:
- Optional feature (off by default)
- Simple beep using browser Audio API (AudioContext oscillator)
- Plays on: queue status change, queue created, queue deleted
- Toggle in Operator Mode

### Package Manager

**pnpm** for all package management:
- pnpm create
- pnpm install
- pnpm add
- pnpm add -D
- pnpm run

### Drag & Drop Library

Recommended: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- Modern and actively maintained
- Better TypeScript support than react-beautiful-dnd

### Indonesian Names

Examples: Budi Santoso, Siti Rahayu, Ahmad Wijaya, Dewi Lestari, Joko Susilo, Rina Kusuma, Agus Pratama, Putri Maharani, Bayu Nugraha, Wulan Sari, etc.

### Status Colors

Recommended Tailwind colors:
- Pending: `bg-gray-500` or `#6B7280`
- In Progress: `bg-blue-500` or `#3B82F6`
- Done: `bg-green-500` or `#10B981`

### Auto-Movement Logic

Simplified: Move 1 queue from Pending→In Progress AND 1 queue from In Progress→Done every 15 seconds
Stop when no queues in Pending OR In Progress (all queues Done)
Calls useSound.playSound() on each movement (if enabled)

### View Mode Persistence

No persistence - resets to Display Mode on page load (as per requirements)

### Tailwind Configuration

Content paths: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
Theme: Add custom colors for statuses if needed
Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

### Bundle Size

Target: Under 500KB gzipped for optimal performance
Check with: `pnpm run build` and inspect dist/ output
