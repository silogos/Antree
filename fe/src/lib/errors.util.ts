/**
 * Error Message Mapping and User-Friendly Error Handling
 */

/**
 * Backend error codes (should match backend ErrorCode enum)
 */
export enum ErrorCode {
	// Validation errors (400)
	VALIDATION_ERROR = "VALIDATION_ERROR",
	INVALID_INPUT = "INVALID_INPUT",
	MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",

	// Not found errors (404)
	NOT_FOUND = "NOT_FOUND",
	QUEUE_NOT_FOUND = "QUEUE_NOT_FOUND",
	SESSION_NOT_FOUND = "SESSION_NOT_FOUND",
	ITEM_NOT_FOUND = "ITEM_NOT_FOUND",
	TEMPLATE_NOT_FOUND = "TEMPLATE_NOT_FOUND",
	STATUS_NOT_FOUND = "STATUS_NOT_FOUND",

	// Conflict errors (409)
	ALREADY_EXISTS = "ALREADY_EXISTS",
	DUPLICATE_ENTRY = "DUPLICATE_ENTRY",
	CONFLICT = "CONFLICT",

	// Foreign key errors (409)
	FOREIGN_KEY_VIOLATION = "FOREIGN_KEY_VIOLATION",
	IN_USE = "IN_USE",

	// Rate limiting (429)
	RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",

	// Server errors (500)
	INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
	DATABASE_ERROR = "DATABASE_ERROR",
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

/**
 * Error severity levels for UI display
 */
export enum ErrorSeverity {
	Info = "info",
	Warning = "warning",
	Error = "error",
	Critical = "critical",
}

/**
 * User-friendly error message mappings
 */
const errorMessages: Record<ErrorCode, { title: string; message: string; severity: ErrorSeverity; suggestions?: string[] }> = {
	// Validation errors
	[ErrorCode.VALIDATION_ERROR]: {
		title: "Invalid Input",
		message: "Please check your input and try again.",
		severity: ErrorSeverity.Warning,
		suggestions: [
			"Make sure all required fields are filled in",
			"Check that values are in the correct format",
			"Remove any special characters that might not be allowed",
		],
	},
	[ErrorCode.INVALID_INPUT]: {
		title: "Invalid Input",
		message: "The information you entered is not valid.",
		severity: ErrorSeverity.Warning,
		suggestions: ["Double-check your input for typos", "Try refreshing the page and trying again"],
	},
	[ErrorCode.MISSING_REQUIRED_FIELD]: {
		title: "Missing Information",
		message: "Some required information is missing.",
		severity: ErrorSeverity.Warning,
		suggestions: ["Make sure all required fields are filled in"],
	},

	// Not found errors
	[ErrorCode.NOT_FOUND]: {
		title: "Not Found",
		message: "The requested resource could not be found.",
		severity: ErrorSeverity.Warning,
		suggestions: [
			"The resource may have been deleted",
			"Check the URL and try again",
			"Go back to the previous page",
		],
	},
	[ErrorCode.QUEUE_NOT_FOUND]: {
		title: "Queue Not Found",
		message: "The queue you're looking for doesn't exist or has been deleted.",
		severity: ErrorSeverity.Warning,
		suggestions: ["The queue may have been deleted", "Go back to the queues list"],
	},
	[ErrorCode.SESSION_NOT_FOUND]: {
		title: "Session Not Found",
		message: "The session you're looking for doesn't exist or has been deleted.",
		severity: ErrorSeverity.Warning,
		suggestions: ["The session may have been deleted", "Go back to the queue detail page"],
	},
	[ErrorCode.ITEM_NOT_FOUND]: {
		title: "Item Not Found",
		message: "The queue item you're looking for doesn't exist or has been deleted.",
		severity: ErrorSeverity.Warning,
		suggestions: ["The item may have been deleted", "Refresh the page to see the current items"],
	},
	[ErrorCode.TEMPLATE_NOT_FOUND]: {
		title: "Template Not Found",
		message: "The template you're looking for doesn't exist or has been deleted.",
		severity: ErrorSeverity.Warning,
		suggestions: ["The template may have been deleted", "Create a new template"],
	},
	[ErrorCode.STATUS_NOT_FOUND]: {
		title: "Status Not Found",
		message: "The status you're looking for doesn't exist or has been deleted.",
		severity: ErrorSeverity.Warning,
		suggestions: ["The status may have been deleted", "Refresh the page to see current statuses"],
	},

	// Conflict errors
	[ErrorCode.ALREADY_EXISTS]: {
		title: "Already Exists",
		message: "This record already exists.",
		severity: ErrorSeverity.Warning,
		suggestions: ["Check if this record already exists", "Use a different name or identifier"],
	},
	[ErrorCode.DUPLICATE_ENTRY]: {
		title: "Duplicate Entry",
		message: "A record with this information already exists.",
		severity: ErrorSeverity.Warning,
		suggestions: ["Use a unique name or identifier", "Check existing records for duplicates"],
	},
	[ErrorCode.CONFLICT]: {
		title: "Conflict",
		message: "There was a conflict with the current state of this resource.",
		severity: ErrorSeverity.Warning,
		suggestions: [
			"The resource may have been modified by someone else",
			"Refresh the page and try again",
		],
	},

	// Foreign key errors
	[ErrorCode.FOREIGN_KEY_VIOLATION]: {
		title: "Cannot Delete",
		message: "This item cannot be deleted because it is being used by other records.",
		severity: ErrorSeverity.Warning,
		suggestions: ["Remove or reassign any dependent records first", "You may need to delete related items first"],
	},
	[ErrorCode.IN_USE]: {
		title: "Item In Use",
		message: "This item is currently in use and cannot be modified.",
		severity: ErrorSeverity.Warning,
		suggestions: ["Wait for any ongoing operations to complete", "Close any open sessions using this item"],
	},

	// Rate limiting
	[ErrorCode.RATE_LIMIT_EXCEEDED]: {
		title: "Too Many Requests",
		message: "You're making too many requests. Please slow down.",
		severity: ErrorSeverity.Warning,
		suggestions: ["Wait a moment before trying again", "Reduce the frequency of your actions"],
	},

	// Server errors
	[ErrorCode.INTERNAL_SERVER_ERROR]: {
		title: "Server Error",
		message: "Something went wrong on our end. Please try again.",
		severity: ErrorSeverity.Error,
		suggestions: ["Wait a moment and try again", "If the problem persists, contact support"],
	},
	[ErrorCode.DATABASE_ERROR]: {
		title: "Database Error",
		message: "There was a problem accessing the database. Please try again.",
		severity: ErrorSeverity.Error,
		suggestions: ["Wait a moment and try again", "If the problem persists, contact support"],
	},
	[ErrorCode.UNKNOWN_ERROR]: {
		title: "Unknown Error",
		message: "An unexpected error occurred. Please try again.",
		severity: ErrorSeverity.Error,
		suggestions: ["Refresh the page and try again", "If the problem persists, contact support"],
	},
};

/**
 * Parse error from HTTP client or API response
 */
export interface ParsedError {
	title: string;
	message: string;
	severity: ErrorSeverity;
	errorCode?: string;
	requestId?: string;
	suggestions?: string[];
	originalError?: Error;
}

/**
 * Parse and convert an error into a user-friendly format
 */
export function parseError(error: unknown): ParsedError {
	// Default error info
	const defaultError: ParsedError = {
		title: "Error",
		message: "An unexpected error occurred. Please try again.",
		severity: ErrorSeverity.Error,
		suggestions: ["Refresh the page and try again", "If the problem persists, contact support"],
	};

	// If it's already a ParsedError, return it
	if (typeof error === "object" && error !== null && "title" in error) {
		return error as ParsedError;
	}

	// If it's a standard Error
	if (error instanceof Error) {
		const errorMessage = error.message;

		// Try to extract error code from message (format: "HTTP 403: VALIDATION_ERROR (...)")
		const errorCodeMatch = errorMessage.match(/\((\w+)\)/);
		const requestIdMatch = errorMessage.match(/\[Request ID: ([\w_-]+)\]/);

		const errorCode = errorCodeMatch?.[1] as ErrorCode | undefined;
		const requestId = requestIdMatch?.[1];

		// If we have a recognized error code, use the mapped message
		if (errorCode && errorCode in errorMessages) {
			const mappedError = errorMessages[errorCode];
			return {
				...mappedError,
				errorCode,
				requestId,
				originalError: error,
			};
		}

		// Try to extract status code
		const statusMatch = errorMessage.match(/HTTP (\d{3})/);
		if (statusMatch) {
			const statusCode = Number.parseInt(statusMatch[1], 10);

			// Map status codes to user-friendly messages
			switch (statusCode) {
				case 400:
					return {
						title: "Bad Request",
						message: "The request was invalid or cannot be served.",
						severity: ErrorSeverity.Warning,
						suggestions: ["Check your input and try again"],
						requestId,
						originalError: error,
					};
				case 401:
					return {
						title: "Unauthorized",
						message: "You need to log in to access this resource.",
						severity: ErrorSeverity.Warning,
						suggestions: ["Log in and try again"],
						requestId,
						originalError: error,
					};
				case 403:
					return {
						title: "Access Denied",
						message: "You don't have permission to access this resource.",
						severity: ErrorSeverity.Warning,
						suggestions: ["Contact an administrator for access"],
						requestId,
						originalError: error,
					};
				case 404:
					return {
						title: "Not Found",
						message: "The requested resource could not be found.",
						severity: ErrorSeverity.Warning,
						suggestions: ["The resource may have been deleted", "Check the URL and try again"],
						requestId,
						originalError: error,
					};
				case 409:
					return {
						title: "Conflict",
						message: "There was a conflict with the current state.",
						severity: ErrorSeverity.Warning,
						suggestions: ["Refresh the page and try again"],
						requestId,
						originalError: error,
					};
				case 429:
					return {
						title: "Too Many Requests",
						message: "You're making too many requests. Please slow down.",
						severity: ErrorSeverity.Warning,
						suggestions: ["Wait a moment before trying again"],
						requestId,
						originalError: error,
					};
				case 500:
				case 502:
				case 503:
				case 504:
					return {
						title: "Server Error",
						message: "Something went wrong on our end. Please try again.",
						severity: ErrorSeverity.Error,
						suggestions: ["Wait a moment and try again", "If the problem persists, contact support"],
						requestId,
						originalError: error,
					};
				default:
					break;
			}
		}

		// Fallback to error message
		return {
			...defaultError,
			message: errorMessage,
			requestId,
			originalError: error,
		};
	}

	// If it's a string
	if (typeof error === "string") {
		return {
			...defaultError,
			message: error,
		};
	}

	// Fallback
	return defaultError;
}

/**
 * Get toast notification props from an error
 */
export function getToastPropsFromError(error: unknown) {
	const parsed = parseError(error);

	return {
		title: parsed.title,
		description: parsed.message,
		variant: parsed.severity === ErrorSeverity.Error ? "destructive" : "default",
	};
}

/**
 * Format error for display in UI (e.g., in an alert or modal)
 */
export function formatErrorForDisplay(error: unknown): {
	heading: string;
	message: string;
	suggestions?: string[];
	requestId?: string;
	showSupportContact: boolean;
} {
	const parsed = parseError(error);

	return {
		heading: parsed.title,
		message: parsed.message,
		suggestions: parsed.suggestions,
		requestId: parsed.requestId,
		showSupportContact: parsed.severity === ErrorSeverity.Error || parsed.severity === ErrorSeverity.Critical,
	};
}
