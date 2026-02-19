import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { closeDb } from "./db/index.js";
import { boardRoutes } from "./routes/boards.js";
import { healthCheckRoutes } from "./routes/health.js";
import { queueItemRoutes } from "./routes/queue-items.js";
import { sessionRoutes } from "./routes/sessions.js";
import { templateRoutes } from "./routes/templates.js";
import { sseBroadcaster } from "./sse/broadcaster.js";
import { sseRoutes } from "./sse/index.js";

const app = new Hono();

// Middleware
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
app.route("/boards", boardRoutes);
app.route("/queue-items", queueItemRoutes);
app.route("/sessions", sessionRoutes);
app.route("/templates", templateRoutes);
app.route("/sse", sseRoutes);

const port = parseInt(process.env.PORT || "3001", 10);

console.log(`🚀 Server starting on port ${port}`);

const server = serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(`✅ Server is running on http://localhost:${info.port}`);
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
	console.log(`\n${signal} received. Starting graceful shutdown...`);

	// Clear cleanup interval
	clearInterval(cleanupInterval);

	// Close all SSE connections
	console.log("Closing SSE connections...");
	sseBroadcaster.closeAllConnections();

	// Close database connections
	console.log("Closing database connections...");
	await closeDb();

	// Close HTTP server
	console.log("Closing HTTP server...");
	server.close((err) => {
		if (err) {
			console.error("Error closing server:", err);
			process.exit(1);
		}

		console.log("✅ Graceful shutdown completed");
		process.exit(0);
	});

	// Force exit after 10 seconds if graceful shutdown fails
	setTimeout(() => {
		console.error("⚠️  Graceful shutdown timeout, forcing exit");
		process.exit(1);
	}, 10000);
}

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught errors
process.on("uncaughtException", (error) => {
	console.error("Uncaught exception:", error);
	gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled rejection at:", promise, "reason:", reason);
	gracefulShutdown("UNHANDLED_REJECTION");
});
