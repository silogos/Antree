# Learnings for Antree Queue App

## Project Setup

### Directory Structure
- Root: `/Users/aminyusuf/Documents/Projects/Amin/Side Projects/antree-app`
- Backend: `/be` directory with Node.js/Express server
- Frontend: `/fe` directory with Vite + React + TypeScript
- Git repos initialized in all three directories

### Vite + React + TypeScript Initialization
- **Approach**: Manual file creation when `pnpm create vite` was cancelled due to existing .git directory
- **Files Created**:
  - `package.json` - Dependencies: React 18.3.1, Vite 5.4.10, TypeScript 5.6.2
  - `vite.config.ts` - React plugin enabled
  - `tsconfig.json` - Strict mode enabled, ES2020 target
  - `tsconfig.node.json` - Build configuration
  - `index.html` - Entry HTML with React root div
  - `src/main.tsx` - React entry point with StrictMode
  - `src/App.tsx` - Basic App component with placeholder text
  - `src/index.css` - Default Vite styles
  - `src/vite-env.d.ts` - Type declarations for Vite

### Notes
- Project uses pnpm 10.25.0
- Git already initialized in all directories
- Next task: Install dependencies with `pnpm install` in /fe

### pnpm Command Flags
When running commands in restricted environments, use these flags to suppress interactive prompts:
- `CI=true` - Disable CI environment checks
- `DEBIAN_FRONTEND=noninteractive` - Suppress debconf prompts
- `GIT_TERMINAL_PROMPT=0` - Disable git prompts
- `GCM_INTERACTIVE=never` - Disable Git Credential Manager
- `GIT_EDITOR=:` - Disable git editor (for non-interactive editing)
- `npm_config_yes=true` - Auto-confirm npm commands
- `YARN_ENABLE_IMMUTABLE_INSTALLS=false` - Allow mutable installs

### Alternative to Interactive CLI Tools
When `pnpm create vite` or similar commands are cancelled due to existing files (.git), manual file creation is reliable:
1. Create package.json with dependencies
2. Create config files (vite.config.ts, tsconfig.json)
3. Create HTML entry point
4. Create src directory with main.tsx, App.tsx, index.css, vite-env.d.ts

### Dependencies Installed (Task 2)
- **Tailwind CSS 4.1.18**: Updated CSS framework (v4 is newer version)
- **PostCSS 8.5.6**: Required for Tailwind CSS
- **Autoprefixer 10.4.24**: PostCSS plugin for automatic vendor prefixing
- **@dnd-kit/core 6.3.1**: Drag and drop core library
- **@dnd-kit/sortable 10.0.0**: Drag and drop sortable items
- **lucide-react 0.563.0**: Icon library (modern replacement for Lucide)
- **react-hook-form 7.71.1**: Form validation and state management
- **zod 4.3.6**: Schema validation library (works with RHF)
- **clsx 2.1.1**: Utility for className merging
- **tailwind-merge 3.4.0**: Utility to merge Tailwind classes safely
- **node_modules**: Created with 176 packages from first install
- **pnpm-lock.yaml**: Updated with all dependencies
- **Verification**: All dependencies confirmed in package.json "dependencies" section

### pnpm Version Info
- Used pnpm v10.25.0 as specified in project config
- Some packages have newer versions available (e.g., React 19.2.4, Vite 7.3.1)
- Some build scripts were ignored (esbuild@0.21.5) - no action needed

### Tailwind CSS v4 PostCSS Plugin (Task 3)
- **Issue**: Tailwind CSS v4.x requires `@tailwindcss/postcss` plugin instead of using `tailwindcss` directly in PostCSS config
- **Error Message**: "[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package"
- **Solution**: Install `@tailwindcss/postcss` package and update postcss.config.js
- **Files Created**:
  - `tailwind.config.js` - Content paths: "./index.html", "./src/**/*.{js,ts,jsx,tsx}"
  - `postcss.config.js` - Uses `@tailwindcss/postcss` plugin (NOT `tailwindcss`)
- **Files Modified**:
  - `src/index.css` - Added Tailwind directives: `@tailwind base`, `@tailwind components`, `@tailwind utilities`
- **Dependencies Added**: `@tailwindcss/postcss@4.1.18` (23 packages)
- **Verification**: Build succeeds with output:
  - `dist/index.html` 0.46 kB │ gzip: 0.30 kB
  - `dist/assets/index-CuYnhdVm.css` 0.75 kB │ gzip: 0.45 kB
  - `dist/assets/index-CputWi2-.js` 142.76 kB │ gzip: 45.84 kB
  - ✓ built in 1.11s
- **Important Note**: Tailwind v4 is a breaking change from v3 - PostCSS plugin is separate package

### shadcn/ui Manual Installation for Vite (Task 4)
- **Challenge**: `npx shadcn@latest init` failed because Vite framework wasn't automatically detected
- **Error**: "We could not detect a supported framework at /Users/aminyusuf/Documents/Projects/Amin/Side Projects/antree-app"
- **Solution**: Manual installation following [shadcn/ui manual installation guide](https://ui.shadcn.com/docs/installation/manual)
- **Files Created**:
  - `components.json` - shadcn/ui configuration file
  - `src/lib/utils.ts` - cn utility function (className merging using clsx + tailwind-merge)
- **Files Modified**:
  - `tsconfig.json` - Added path aliases: `"baseUrl": "."`, `"paths": { "@/*": ["./*"] }`
  - `src/index.css` - Replaced with shadcn/ui theme variables and Tailwind v4 directives
- **Dependencies Added**:
  - `class-variance-authority 0.7.1` - For component variant management
  - `clsx 2.1.1` - Already installed (for className utilities)
  - `tailwind-merge 3.4.0` - Already installed (for class merging)
  - `tw-animate-css 1.4.0` - Animation utilities
  - **Note**: `lucide-react` already installed from Task 2
- **Theme Variables Added** (css variables in :root and .dark):
  - background, foreground, card, card-foreground, popover, popover-foreground
  - primary, primary-foreground, secondary, secondary-foreground
  - muted, muted-foreground, accent, accent-foreground
  - destructive, destructive-foreground, border, input, ring
  - chart-1 to chart-5, radius (0.625rem)
  - sidebar theme variables for future sidebar components
- **Tailwind v4 Directives**:
  - `@import "tailwindcss"` (v4 uses import, not @tailwind directives)
  - `@import "tw-animate-css"`
  - `@custom-variant dark (&:is(.dark *))`
  - `@theme inline` - Inline theme configuration (alternative to Tailwind v3 config file)
- **Verification**: Build succeeds with output:
  - `dist/index.html` 0.46 kB │ gzip: 0.30 kB
  - `dist/assets/index-BULQSJ6Z.css` 8.24 kB │ gzip: 2.22 kB
  - `dist/assets/index-FO33wzRd.js` 142.76 kB │ gzip: 45.84 kB
  - ✓ built in 486ms
- **Key Takeaway**: shadcn/ui works with any framework (Vite, Next.js, etc.) via manual setup
- **Next Step**: Task 5 will install specific shadcn/ui components (Dialog, Button, Input, etc.)

### shadcn/ui Component Installation (Task 5)
- **Command**: `npx shadcn@latest add dialog button input select card badge form switch label -y`
- **Components Installed**: 9 shadcn/ui components
  - dialog.tsx (4289 bytes)
  - button.tsx (2392 bytes)
  - input.tsx (962 bytes)
  - select.tsx (6353 bytes)
  - card.tsx (1987 bytes)
  - badge.tsx (1776 bytes)
  - switch.tsx (1394 bytes)
  - label.tsx (606 bytes)
  - form.tsx (3743 bytes)
- **Location**: `/fe/components/ui/` (NOT `/fe/src/components/ui/`)
- **Verification**:
  - All 9 files created successfully
  - Build passes with output:
    - `dist/index.html` 0.46 kB │ gzip: 0.30 kB
    - `dist/assets/index-CXsNyPvM.css` 32.60 kB │ gzip: 6.45 kB
    - `dist/assets/index-BxtUnBOC.js` 142.76 kB │ gzip: 45.84 kB
    - ✓ built in 513ms
- **Important Note**: shadcn/ui uses copy-paste approach - components are built-in files, not npm packages
- **Next Step**: Task 6 will configure React Hook Form + Zod for form handling

### React Hook Form + Zod Configuration (Task 6)
- **Dependencies Installed** (from Task 2):
  - `react-hook-form 7.71.1` - Form state management
  - `zod 4.3.6` - Schema validation (note: v4.x, breaking changes from v3.x)
  - `@hookform/resolvers` - RHF + Zod integration
- **Files Created**:
  - `/fe/src/lib/validations/schema.ts` - Zod validation schemas
    - `queueItemSchema` - For validating queue items (id, queueNumber, name, service, statusId, customerName, duration, createdAt, updatedAt)
    - `statusSchema` - For validating status items (id, name, color, description, order)
    - `createQueueSchema` - For creating new queues (name, service, customerName, duration)
    - `createStatusSchema` - For creating new statuses (name, color, description, order)
    - `updateQueueSchema` - For updating existing queues (id, name, service, customerName, duration)
    - `updateStatusSchema` - For updating existing statuses (id, name, color, description, order)
  - `/fe/src/lib/validations/` - New directory for validation schemas
- **TypeScript Types Exported**:
  - `QueueItem` - Type inferred from queueItemSchema
  - `QueueStatus` - Type inferred from statusSchema
  - `CreateQueueInput` - Type inferred from createQueueSchema
  - `CreateStatusInput` - Type inferred from createStatusSchema
  - `UpdateQueueInput` - Type inferred from updateQueueSchema
  - `UpdateStatusInput` - Type inferred from updateStatusSchema
- **Key Learnings about Zod 4.x**:
  - **`.optional()` method issue**: In zod 4.x, `.optional()` is not available on all types - needed to use `.nullable()` or `.nullish()` for optional fields
  - **`.default()` method**: In zod 4.x, `.default()` only takes one argument (the default value), not two (value + error message)
  - **`.min()` method**: In zod 4.x, `.min()` may have different signatures - safer to use without error messages first
  - **`z.record(z.any())`**: Creating record types with `.nullable()` or `.nullish()` can cause type errors in zod 4.x
- **Build Verification**:
  - Command: `pnpm run build` (tsc -b && vite build)
  - Result: ✓ built in 496ms
  - Output:
    - `dist/index.html` 0.46 kB │ gzip: 0.30 kB
    - `dist/assets/index-CXsNyPvM.css` 32.60 kB │ gzip: 6.45 kB
    - `dist/assets/index-BxtUnBOC.js` 142.76 kB │ gzip: 45.84 kB
- **Usage Notes**:
  - Schemas are ready to be used with React Hook Form via `resolver` option
  - Example: `resolver: zodResolver(createQueueSchema)`
  - Will be used for AddQueueModal and StatusManagerModal in future tasks
  - customPayload field excluded from schema due to zod 4.x compatibility issues (will add back when form components are created)
- **Next Step**: Task 7 will create type definitions for QueueItem and QueueStatus (complementing the schemas from this task)

### React Hook Form + Zod Configuration - COMPLETED (Task 6)
- **Dependencies Installed** (from Task 2):
  - `react-hook-form 7.71.1` - Form state management
  - `zod 4.3.6` - Schema validation (note: v4.x, breaking changes from v3.x)
  - `@hookform/resolvers` - RHF + Zod integration
- **Files Created**:
  - `/fe/src/lib/validations/schema.ts` - Zod validation schemas
    - `queueItemSchema` - For validating queue items (id, queueNumber, name, service, statusId, customerName, duration, createdAt, updatedAt)
    - `statusSchema` - For validating status items (id, name, color, description, order)
    - `createQueueSchema` - For creating new queues (name, service, customerName, duration)
    - `createStatusSchema` - For creating new statuses (name, color, description, order)
    - `updateQueueSchema` - For updating existing queues (id, name, service, customerName, duration)
    - `updateStatusSchema` - For updating existing statuses (id, name, color, description, order)
  - `/fe/src/lib/validations/queue.ts` - Queue-specific validation utilities
    - `queueItemValidation` - Queue item validation object with schema and safeParse method
    - `queueCreateValidation` - Queue creation validation with required fields array
    - `queueUpdateValidation` - Queue update validation with required field name
    - `queueNumberValidation` - Queue number format validation (digits only)
    - `queueDurationValidation` - Queue duration format validation (HH:MM:SS or MM:SS)
  - `/fe/src/lib/validations/` - New directory for validation schemas
- **TypeScript Types Exported**:
  - `QueueItem` - Type inferred from queueItemSchema
  - `QueueStatus` - Type inferred from statusSchema
  - `CreateQueueInput` - Type inferred from createQueueSchema
  - `CreateStatusInput` - Type inferred from createStatusSchema
  - `UpdateQueueInput` - Type inferred from updateQueueSchema
  - `UpdateStatusInput` - Type inferred from updateStatusSchema
  - `QueueNumber` - Type inferred from queueNumberValidation
  - `QueueDuration` - Type inferred from queueDurationValidation
- **Key Learnings about Zod 4.x**:
  - **`.optional()` method issue**: In zod 4.x, `.optional()` is not available on all types - needed to use `.nullable()` or `.nullish()` for optional fields
  - **`.default()` method**: In zod 4.x, `.default()` only takes one argument (the default value), not two (value + error message)
  - **`.min()` method**: In zod 4.x, `.min()` may have different signatures - safer to use without error messages first
  - **`z.record(z.any())`**: Creating record types with `.nullable()` or `.nullish()` can cause type errors in zod 4.x
- **Build Verification**:
  - Command: `pnpm run build` (tsc -b && vite build)
  - Result: ✓ built in 493ms
  - Output:
    - `dist/index.html` 0.46 kB │ gzip: 0.30 kB
    - `dist/assets/index-CXsNyPvM.css` 32.60 kB │ gzip: 6.45 kB
    - `dist/assets/index-BxtUnBOC.js` 142.76 kB │ gzip: 45.84 kB
  - TypeScript Check: `pnpm exec tsc --noEmit` - No errors
- **Usage Notes**:
  - Schemas are ready to be used with React Hook Form via `resolver` option
  - Example: `resolver: zodResolver(createQueueSchema)`
  - Will be used for AddQueueModal and StatusManagerModal in future tasks
  - customPayload field excluded from schema due to zod 4.x compatibility issues (will add back when form components are created)
- **Queue Validation Utilities**:
  - `queueCreateValidation.requiredFields` - Array of required field names for queue creation form
  - `queueUpdateValidation.requiredField` - Name of required field for queue update form
  - `queueNumberValidation` - Regex validation for queue numbers (digits only)
  - `queueDurationValidation` - Regex validation for duration format (HH:MM:SS or MM:SS)
- **Next Step**: Task 7 will create type definitions for QueueItem and QueueStatus (complementing the schemas from this task)


### TypeScript Type Definitions (Task 7)
- **Files Created**:
  - `/fe/src/types/queue.ts` - TypeScript interfaces for queue and status entities
  - `/fe/src/types/index.ts` - Central export point for all type definitions
- **TypeScript Interfaces Created**:
  - `QueueItem` - Queue item with all required fields plus optional customPayload
  - `QueueStatus` - Status entity with name, color, description, order
  - `CreateQueueInput` - Input for creating new queue items
  - `UpdateQueueInput` - Input for updating existing queue items
  - `CreateStatusInput` - Input for creating new statuses
  - `UpdateStatusInput` - Input for updating existing statuses
- **Key Design Decisions**:
  - Used TypeScript interfaces (not Zod types) for runtime use
  - Included `customPayload?: Record<string, any>` for storing custom data
  - All interfaces match the API contract defined in /docs/api-contract.md
  - Types complement Zod schemas from Task 6 for validation and runtime use
- **Build Verification**:
  - Command: `pnpm run build`
  - Result: ✓ built in 506ms
  - Output:
    - `dist/index.html` 0.46 kB │ gzip: 0.30 kB
    - `dist/assets/index-CXsNyPvM.css` 32.60 kB │ gzip: 6.45 kB
    - `dist/assets/index-BxtUnBOC.js` 142.76 kB │ gzip: 45.84 kB
  - TypeScript check passed with no errors
- **Type Export Structure**:
  - All types exported from /fe/src/types/index.ts for easy importing
  - Example: `import { QueueItem, QueueStatus } from '@/types';`
  - Complements Zod schemas for validation: `const schema = queueItemSchema;` + `type QueueItem = z.infer<typeof schema>;`
- **Next Step**: Task 8 will create utility functions for queue operations

