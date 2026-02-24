import { Hono } from "hono";
import { client } from "../../db/index.js";
import { metricsCollector } from "../../lib/metrics.js";
import { sseBroadcaster } from "../../sse/broadcaster.js";

// Track server start time for uptime calculation
const SERVER_START_TIME = Date.now();

export const healthCheckRoutes = new Hono();

healthCheckRoutes.get("/", (c) => {
	return c.json({
		status: "ok",
		message: "Antree Backend API",
		version: process.env.npm_package_version || "1.0.0",
		timestamp: new Date().toISOString(),
	});
});

healthCheckRoutes.get("/health", async (c) => {
	const uptime = Date.now() - SERVER_START_TIME;
	const apiMetrics = metricsCollector.getMetrics();
	const sseConnections = sseBroadcaster.getTotalConnectionCount();
	const sseSessions = sseBroadcaster.getActiveSessionCount();

	let dbStatus = "connected";
	let dbError: string | undefined;

	try {
		// Simple database connection check with timing
		const dbStart = Date.now();
		await client`SELECT 1`;
		const dbDuration = Date.now() - dbStart;

		// Log slow database connections
		if (dbDuration > 100) {
			console.warn(`[Health] Slow database connection: ${dbDuration}ms`);
		}
	} catch (error) {
		dbStatus = "disconnected";
		dbError = error instanceof Error ? error.message : "Unknown error";
	}

	const isHealthy = dbStatus === "connected";

	return c.json(
		{
			status: isHealthy ? "healthy" : "unhealthy",
			uptime: Math.floor(uptime / 1000), // Uptime in seconds
			timestamp: new Date().toISOString(),
			checks: {
				database: {
					status: dbStatus,
					error: dbError,
				},
			},
			metrics: {
				sse: {
					connections: sseConnections,
					sessions: sseSessions,
				},
				requests: {
					total: apiMetrics.totalRequests,
					recent: apiMetrics.recentRequests,
					errors: apiMetrics.errorCount,
					errorRate:
						apiMetrics.totalRequests > 0
							? `${((apiMetrics.errorCount / apiMetrics.totalRequests) * 100).toFixed(2)}%`
							: "0%",
				},
				performance: {
					avgResponseTime: `${apiMetrics.avgResponseTime}ms`,
					p50ResponseTime: `${apiMetrics.p50ResponseTime}ms`,
					p95ResponseTime: `${apiMetrics.p95ResponseTime}ms`,
					p99ResponseTime: `${apiMetrics.p99ResponseTime}ms`,
				},
			},
		},
		isHealthy ? 200 : 503,
	);
});
