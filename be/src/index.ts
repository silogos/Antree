import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { healthCheckRoutes } from './routes/health.js'
import { boardRoutes } from './routes/boards.js'
import { statusRoutes } from './routes/statuses.js'
import { queueRoutes as queueItemRoutes } from './routes/queues.js'
import { queueListRoutes } from './routes/queue-list.js'
import { templateRoutes } from './routes/templates.js'
import { batchRoutes } from './routes/batches.js'
import { sseRoutes } from './sse/index.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Routes
app.route('/', healthCheckRoutes)
app.route('/boards', boardRoutes)
app.route('/statuses', statusRoutes)
app.route('/queues', queueListRoutes)
app.route('/queue-items', queueItemRoutes)
app.route('/templates', templateRoutes)
app.route('/batches', batchRoutes)
app.route('/sse', sseRoutes)

const port = parseInt(process.env.PORT || '3001')

console.log(`🚀 Server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`)
})
