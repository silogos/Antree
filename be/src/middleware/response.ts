/**
 * Standard API Response Format
 */

export interface ApiResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
	total?: number;
}

/**
 * Success response helper
 */
export function successResponse<T>(
	data: T,
	message?: string,
	total?: number,
): ApiResponse<T> {
	const response: ApiResponse<T> = { success: true, data: data };
	if (message) response.message = message;
	if (total !== undefined) response.total = total;
	return response;
}

/**
 * Error response helper
 */
export function errorResponse(error: string, message: string): ApiResponse {
	return {
		success: false,
		error,
		message,
	};
}

/**
 * Not found response helper
 */
export function notFoundResponse(resource: string, id: string): ApiResponse {
	return errorResponse("Not Found", `${resource} with id ${id} not found`);
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(message: string): ApiResponse {
	return errorResponse("Validation Error", message);
}

/**
 * Internal error response helper
 */
export function internalErrorResponse(error: unknown): ApiResponse {
	return errorResponse(
		"Internal Server Error",
		error instanceof Error ? error.message : "Unknown error",
	);
}
