import { Hono } from 'hono'
import { client } from '../db/index.js'

export const healthCheckRoutes = new Hono()

healthCheckRoutes.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Antree Backend API',
    timestamp: new Date().toISOString()
  })
})

healthCheckRoutes.get('/health', async (c) => {
  try {
    // Simple database connection check
    await client`SELECT 1`

    return c.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 503)
  }
})
