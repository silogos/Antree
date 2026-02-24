/**
 * Structured Logger Configuration
 * Provides structured logging with pino for production-ready logging
 */

import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";
const logLevel = process.env.LOG_LEVEL || "info";

export const logger = pino({
	level: logLevel,
	// Pretty print in development, JSON in production
	transport: isDevelopment
		? {
				target: "pino-pretty",
				options: {
					colorize: true,
					ignore: "pid,hostname",
				 translateTime: "HH:MM:ss Z",
				},
		  }
		: undefined,
	// Add timestamp to all logs
	timestamp: pino.stdTimeFunctions.isoTime,
	// Redact sensitive fields
	formatters: {
		level: (label) => {
			return { level: label };
		},
	},
});

/**
 * Create a child logger with additional context
 */
export function createChildLogger(context: Record<string, unknown>) {
	return logger.child(context);
}

/**
 * Log action with structured context
 */
export function logAction(
	action: string,
	data: Record<string, unknown>,
	level: "info" | "warn" | "error" = "info",
) {
	const logFn = level === "error" ? logger.error : level === "warn" ? logger.warn : logger.info;

	logFn({
		action,
		...data,
	}, `Action: ${action}`);
}

/**
 * Log API request with structured context
 */
export function logRequest(
	method: string,
	path: string,
	statusCode: number,
	duration: number,
	extra?: Record<string, unknown>,
) {
	logger.info({
		action: "api_request",
		method,
		path,
		statusCode,
		duration,
		...extra,
	}, `${method} ${path} ${statusCode} (${duration}ms)`);
}

/**
 * Log database query with structured context
 */
export function logQuery(
	query: string,
	duration: number,
	extra?: Record<string, unknown>,
) {
	logger.debug({
		action: "db_query",
		query: query.substring(0, 100), // Truncate long queries
		duration,
		...extra,
	}, `DB Query (${duration}ms)`);
}

/**
 * Log SSE events
 */
export function logSSEEvent(
	eventType: string,
	sessionId: string,
	extra?: Record<string, unknown>,
) {
	logger.debug({
		action: "sse_event",
		eventType,
		sessionId,
		...extra,
	}, `SSE: ${eventType} for session ${sessionId}`);
}
