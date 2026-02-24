import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { closeDb } from "./db/index.js";
import { logger as structuredLogger } from "./lib/logger.js";

import { healthCheckRoutes } from "./routes/health.js";
import { queuesRoutes } from "./routes/queues.js";
import { sessionRoutes } from "./routes/sessions.js";
import { templateRoutes } from "./routes/templates.js";
import { sseBroadcaster } from "./sse/broadcaster.js";
import { sseRoutes } from "./sse/index.js";
import { itemRoutes, sessionItemRoutes } from "./routes/items.js";
import { errorHandler } from "./middleware/error.js";
import { metricsMiddleware } from "./middleware/metrics.js";

const app = new Hono();

// Middleware
app.use("*", errorHandler);
app.use("*", metricsMiddleware);
app.use("*", logger());
app.use(
	"*",
	cors({
		origin: [
			"http://localhost:5173",
			"http://localhost:3000",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:3000",
		],
		credentials: true,
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
	}),
);

// Routes
app.route("/", healthCheckRoutes);
app.route("/queues", queuesRoutes);
app.route("/sessions", sessionRoutes);
app.route("/sessions", sessionItemRoutes);
app.route("/templates", templateRoutes);
app.route("/items", itemRoutes);
app.route("/", sseRoutes);

const port = parseInt(process.env.PORT || "3001", 10);

structuredLogger.info({ port }, "🚀 Server starting");

const server = serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		structuredLogger.info({ port: info.port }, "✅ Server is running");
	},
);

// Start periodic cleanup of idle connections (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_IDLE_TIME = 5 * 60 * 1000; // 5 minutes

const cleanupInterval = setInterval(() => {
	sseBroadcaster.cleanupIdleConnections(MAX_IDLE_TIME);
}, CLEANUP_INTERVAL);

/**
 * Graceful shutdown handler
 * Closes all SSE connections and database connections before exiting
 */
async function gracefulShutdown(signal: string) {
	structuredLogger.info({ signal }, "Starting graceful shutdown");

	// Clear cleanup interval
	clearInterval(cleanupInterval);

	// Close all SSE connections
	structuredLogger.info("Closing SSE connections");
	sseBroadcaster.closeAllConnections();

	// Close database connections
	structuredLogger.info("Closing database connections");
	await closeDb();

	// Close HTTP server
	structuredLogger.info("Closing HTTP server");
	server.close((err) => {
		if (err) {
			structuredLogger.error({ err }, "Error closing server");
			process.exit(1);
		}

		structuredLogger.info("✅ Graceful shutdown completed");
		process.exit(0);
	});

	// Force exit after 10 seconds if graceful shutdown fails
	setTimeout(() => {
		structuredLogger.error("⚠️  Graceful shutdown timeout, forcing exit");
		process.exit(1);
	}, 10000);
}

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
	structuredLogger.error({ error }, "Uncaught exception");
	gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
	structuredLogger.error({ reason, promise }, "Unhandled rejection");
	gracefulShutdown("UNHANDLED_REJECTION");
});
