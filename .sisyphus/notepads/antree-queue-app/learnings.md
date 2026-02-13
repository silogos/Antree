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
