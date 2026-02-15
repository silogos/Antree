# Antree

A real-time queue management system for service businesses. Manage multiple queue boards with drag-and-drop status tracking, live updates via SSE, and support for hospitals, banks, customer service centers, and more.

![Antree](https://img.shields.io/badge/Antree-Queue%20Management-blue)

## Features

- 🎯 **Multiple Queue Boards** - Create and manage separate queue boards for different services
- 📊 **Drag-and-Drop Status Tracking** - Visual Kanban-style queue management
- ⚡ **Real-Time Updates** - Server-Sent Events (SSE) for instant queue status updates
- 👥 **Queue Item Management** - Add, update, and remove queue items with ease
- 🎨 **Customizable Statuses** - Define queue stages with custom labels and colors
- 🔐 **User Management** - Basic user authentication and management

## Tech Stack

### Backend
- **Hono** - Fast, lightweight web framework
- **Drizzle ORM** - Type-safe SQL toolkit
- **PostgreSQL** - Relational database
- **TypeScript** - Type-safe JavaScript

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **@dnd-kit** - Drag-and-drop utilities
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Zod** - Schema validation

## Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/silogos/Antree.git
cd Antree
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` with your database configuration:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/antree
PORT=3001
```

4. **Run database migrations**

```bash
pnpm db:generate
pnpm db:push
```

5. **Seed the database (optional)**

```bash
pnpm db:seed
```

## Usage

### Development

Run both backend and frontend in parallel:

```bash
pnpm dev
```

Run only backend:

```bash
pnpm dev:be
```

Run only frontend:

```bash
pnpm dev:fe
```

### Production Build

```bash
pnpm build
```

Start production server:

```bash
pnpm start
```

### Database Management

Generate migrations:

```bash
pnpm db:generate
```

Run migrations:

```bash
pnpm db:migrate
```

Push schema changes:

```bash
pnpm db:push
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

## API Endpoints

### Health
- `GET /` - Health check

### Boards
- `GET /boards` - Get all boards
- `GET /boards/:id` - Get single board
- `POST /boards` - Create board
- `PUT /boards/:id` - Update board
- `DELETE /boards/:id` - Delete board

### Statuses
- `GET /statuses` - Get all statuses
- `GET /statuses/:id` - Get single status
- `POST /statuses` - Create status
- `PUT /statuses/:id` - Update status
- `DELETE /statuses/:id` - Delete status

### Queues
- `GET /queues` - Get all queues (filterable by board/status)
- `GET /queues/:id` - Get single queue
- `POST /queues` - Create queue
- `PUT /queues/:id` - Update queue
- `DELETE /queues/:id` - Delete queue

### Real-Time
- `GET /sse` - SSE connection for real-time updates

## Project Structure

```
Antree/
├── be/                 # Backend (Hono + Drizzle)
│   ├── src/
│   │   ├── db/        # Database schema & connection
│   │   ├── routes/    # API routes
│   │   ├── sse/       # Server-Sent Events
│   │   └── index.ts   # Main server file
│   └── package.json
├── fe/                # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── main.tsx
│   └── package.json
├── package.json
└── pnpm-workspace.yaml
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

Made with ❤️ by [silogos](https://github.com/silogos)
