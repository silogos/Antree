import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { healthCheckRoutes } from './routes/health.js'
import { boardRoutes } from './routes/boards.js'
import { statusRoutes } from './routes/statuses.js'
import { queueRoutes } from './routes/queues.js'
import { sseRoutes } from './sse/index.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Routes
app.route('/', healthCheckRoutes)
app.route('/boards', boardRoutes)
app.route('/statuses', statusRoutes)
app.route('/queues', queueRoutes)
app.route('/sse', sseRoutes)

const port = parseInt(process.env.PORT || '3001')

console.log(`🚀 Server starting on port ${port}`)

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Server is running on http://localhost:${info.port}`)
})
