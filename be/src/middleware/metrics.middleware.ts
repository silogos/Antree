/**
 * Metrics Collection Middleware
 * Tracks request duration and response codes for performance monitoring
 */

import type { Context, Next } from "hono";
import { metricsCollector } from "../lib/metrics.js";

export async function metricsMiddleware(c: Context, next: Next) {
  const startTime = Date.now();

  // Wait for the request to complete
  await next();

  const duration = Date.now() - startTime;
  const statusCode = c.res.status;

  // Record the request metrics
  metricsCollector.recordRequest(duration, statusCode);

  // Add metrics header to response (useful for debugging)
  c.res.headers.set("X-Response-Time", `${duration}ms`);
}
