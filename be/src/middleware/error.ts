/**
 * Error Handling Middleware and Utilities
 */

import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import {
	databaseErrorResponse,
	errorResponse,
	generateRequestId,
	internalErrorResponse,
	validationErrorResponse,
	type ApiResponse,
} from "./response.js";

/**
 * Error types for better error classification
 */
export enum ErrorType {
	Validation = "ValidationError",
	Database = "DatabaseError",
	NotFound = "NotFoundError",
	Conflict = "ConflictError",
	Auth = "AuthError",
	RateLimit = "RateLimitError",
	Internal = "InternalError",
}

/**
 * Custom application error class
 */
export class AppError extends Error {
	public readonly type: ErrorType;
	public readonly statusCode: number;
	public readonly isOperational: boolean;
	public readonly details?: Record<string, unknown>;

	constructor(
		message: string,
		type: ErrorType,
		statusCode: number = 500,
		isOperational: boolean = true,
		details?: Record<string, unknown>,
	) {
		super(message);
		this.name = this.constructor.name;
		this.type = type;
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.details = details;

		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Specific error types
 */
export class ValidationError extends AppError {
	constructor(message: string, details?: Record<string, unknown>) {
		super(message, ErrorType.Validation, 400, true, details);
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string, id: string) {
		super(`${resource} with id "${id}" not found`, ErrorType.NotFound, 404, true, {
			resource,
			id,
		});
	}
}

export class ConflictError extends AppError {
	constructor(message: string, details?: Record<string, unknown>) {
		super(message, ErrorType.Conflict, 409, true, details);
	}
}

export class DatabaseError extends AppError {
	constructor(message: string, details?: Record<string, unknown>) {
		super(message, ErrorType.Database, 500, true, details);
	}
}

export class RateLimitError extends AppError {
	constructor(message: string = "Rate limit exceeded") {
		super(message, ErrorType.RateLimit, 429, true);
	}
}

/**
 * Structured error logger
 */
interface ErrorLogEntry {
	timestamp: string;
	requestId: string;
	level: "error" | "warn";
	type: string;
	message: string;
	stackTrace?: string;
	details?: Record<string, unknown>;
	context?: {
		method?: string;
		path?: string;
		statusCode?: number;
		duration?: number;
	};
}

function logError(entry: ErrorLogEntry): void {
	const logEntry = {
		...entry,
		// Only include stack trace in development
		...(process.env.NODE_ENV === "development" && entry.stackTrace && {
			stackTrace: entry.stackTrace,
		}),
	};

	// In production, you might want to send this to a logging service
	console.error(JSON.stringify(logEntry));
}

/**
 * Global error handler middleware
 */
export const errorHandler = async (c: Context, next: Next) => {
	const requestId = generateRequestId();
	c.set("requestId", requestId);

	const startTime = Date.now();

	try {
		await next();
	} catch (error) {
		const duration = Date.now() - startTime;

		// Log the error
		if (error instanceof Error) {
			logError({
				timestamp: new Date().toISOString(),
				requestId,
				level: "error",
				type: error instanceof AppError ? error.type : ErrorType.Internal,
				message: error.message,
				stackTrace: error.stack,
				details: error instanceof AppError ? error.details : undefined,
				context: {
					method: c.req.method,
					path: c.req.path,
					statusCode: error instanceof AppError ? error.statusCode : 500,
					duration,
				},
			});
		}

		// Handle known HTTP exceptions from Hono
		if (error instanceof HTTPException) {
			const response: ApiResponse = {
				success: false,
				error: error.message,
				errorCode: "HTTP_EXCEPTION",
				message: error.message,
				requestId,
			};
			return c.json(response, error.status);
		}

		// Handle operational application errors
		if (error instanceof AppError) {
			let response: ApiResponse;

			switch (error.type) {
				case ErrorType.Validation:
					response = validationErrorResponse(error.message, requestId, error.details);
					break;
				case ErrorType.NotFound:
					response = errorResponse(
						"NOT_FOUND",
						error.message,
						requestId,
						error.details,
					);
					break;
				case ErrorType.Conflict:
					response = errorResponse(
						"CONFLICT",
						error.message,
						requestId,
						error.details,
					);
					break;
				case ErrorType.Database:
					response = databaseErrorResponse(error, requestId);
					break;
				case ErrorType.RateLimit:
					response = errorResponse("RATE_LIMIT_EXCEEDED", error.message, requestId);
					break;
				default:
					response = internalErrorResponse(error, requestId);
			}

			return c.json(response, error.statusCode);
		}

		// Handle unknown errors
		return c.json(internalErrorResponse(error, requestId), 500);
	}
};

/**
 * Check if error is a foreign key constraint violation
 */
export function isForeignKeyError(error: unknown): boolean {
	if (error instanceof Error) {
		return (
			error.message.includes("violates foreign key constraint") ||
			error.message.includes("foreign key violation")
		);
	}
	return false;
}

/**
 * Check if error is a unique constraint violation
 */
export function isUniqueConstraintError(error: unknown): boolean {
	if (error instanceof Error) {
		return (
			error.message.includes("duplicate key") ||
			error.message.includes("unique constraint")
		);
	}
	return false;
}

/**
 * Check if error is a not null constraint violation
 */
export function isNotNullError(error: unknown): boolean {
	if (error instanceof Error) {
		return (
			error.message.includes("not-null constraint") ||
			error.message.includes("null value in column")
		);
	}
	return false;
}

/**
 * Get user-friendly error message from database error
 */
export function getDatabaseErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		if (isForeignKeyError(error)) {
			return "This record is referenced by other records and cannot be deleted";
		}
		if (isUniqueConstraintError(error)) {
			return "A record with this value already exists";
		}
		if (isNotNullError(error)) {
			return "Required field is missing";
		}
	}
	return "Database error occurred";
}
