/**
 * HTTP Client with Retry Logic and Error Handling
 */

export interface HttpRequestConfig extends RequestInit {
	withAuth?: boolean;
	params?: Record<string, string | number | boolean>;
	// Retry configuration
	retries?: number;
	retryDelay?: number;
	shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface HttpInstance {
	setToken(token: string | null): void;
	getToken(): string | null;
	clearToken(): void;

	get<T = any>(url: string, config?: HttpRequestConfig): Promise<T>;
	post<T = any>(
		url: string,
		body?: any,
		config?: HttpRequestConfig,
	): Promise<T>;
	put<T = any>(url: string, body?: any, config?: HttpRequestConfig): Promise<T>;
	patch<T = any>(
		url: string,
		body?: any,
		config?: HttpRequestConfig,
	): Promise<T>;
	delete<T = any>(url: string, config?: HttpRequestConfig): Promise<T>;
}

/**
 * Default retry predicate - retry on network errors and 5xx errors
 */
function defaultShouldRetry(error: Error, attempt: number): boolean {
	// Don't retry if we've exceeded max attempts
	if (attempt >= 3) return false;

	// Retry on network errors (no status code)
	if (!error.message.includes("HTTP")) return true;

	// Extract status code from error message
	const match = error.message.match(/HTTP (\d{3})/);
	if (!match) return false;

	const statusCode = Number.parseInt(match[1], 10);

	// Retry on 5xx server errors and 408 Request Timeout
	return statusCode >= 500 || statusCode === 408;
}

/**
 * Calculate exponential backoff delay with jitter
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
	// Exponential backoff: baseDelay * (2 ^ attempt)
	const exponentialDelay = baseDelay * Math.pow(2, attempt);

	// Add jitter: random value between 0-100ms
	const jitter = Math.random() * 100;

	return Math.min(exponentialDelay + jitter, 10000); // Cap at 10 seconds
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export const createHttp = (baseURL?: string): HttpInstance => {
	const base = baseURL || "http://localhost:3001";

	let accessToken: string | null = null;

	const setToken = (token: string | null) => {
		accessToken = token;
	};

	const getToken = () => accessToken;

	const clearToken = () => {
		accessToken = null;
	};

	// Build query params
	const buildURL = (url: string, params?: HttpRequestConfig["params"]) => {
		const full = `${base}${url}`;

		if (!params) return full;

		const qs = new URLSearchParams(
			Object.entries(params).reduce(
				(acc, [k, v]) => ({ ...acc, [k]: String(v) }),
				{},
			),
		).toString();

		return `${full}?${qs}`;
	};

	// Core request with retry logic
	const request = async <T>(
		url: string,
		config: HttpRequestConfig = {},
	): Promise<T> => {
		const {
			withAuth = true,
			params,
			headers,
			body,
			retries = 3,
			retryDelay = 1000,
			shouldRetry = defaultShouldRetry,
			...rest
		} = config;

		let lastError: Error | null = null;

		// Attempt request with retries
		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				const finalHeaders = new Headers(headers || {});

				// Inject token
				if (accessToken && withAuth) {
					finalHeaders.set("Authorization", `Bearer ${accessToken}`);
				}

				// Auto JSON body
				let finalBody = body;
				if (body && typeof body === "object" && !(body instanceof FormData)) {
					finalHeaders.set("Content-Type", "application/json");
					finalBody = JSON.stringify(body);
				}

				const res = await fetch(buildURL(url, params), {
					...rest,
					headers: finalHeaders,
					body: finalBody,
					credentials: "include",
				});

				if (!res.ok) {
					// Try to parse error response as JSON
					let errorMessage = res.statusText;
					let errorCode: string | undefined;
					let requestId: string | undefined;

					try {
						const contentType = res.headers.get("content-type");
						if (contentType?.includes("application/json")) {
							const errorData = await res.json();
							errorMessage = errorData.message || errorMessage;
							errorCode = errorData.errorCode || errorData.error;
							requestId = errorData.requestId;
						} else {
							const text = await res.text();
							errorMessage = text || res.statusText;
						}
					} catch {
						// If parsing fails, use status text
					}

					// Create detailed error
					const error = new Error(
						`HTTP ${res.status}: ${errorMessage}${errorCode ? ` (${errorCode})` : ""}${requestId ? ` [Request ID: ${requestId}]` : ""}`,
					);
					(error as any).statusCode = res.status;
					(error as any).errorCode = errorCode;
					(error as any).requestId = requestId;

					throw error;
				}

				// Auto parse JSON if possible
				const contentType = res.headers.get("content-type");
				if (contentType?.includes("application/json")) {
					return res.json();
				}

				return res.text() as unknown as T;
			} catch (error) {
				lastError = error as Error;

				// Check if we should retry
				if (attempt < retries && shouldRetry(lastError, attempt)) {
					const delay = calculateRetryDelay(attempt, retryDelay);
					console.warn(
						`[HTTP] Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay.toFixed(0)}ms:`,
						lastError.message,
					);
					await sleep(delay);
					continue;
				}

				// No more retries or shouldn't retry
				throw lastError;
			}
		}

		// This should never be reached, but TypeScript needs it
		throw lastError || new Error("Unknown error occurred");
	};

	return {
		setToken,
		getToken,
		clearToken,

		get: (url, config) => request(url, { ...config, method: "GET" }),

		post: (url, body, config) =>
			request(url, { ...config, method: "POST", body }),

		put: (url, body, config) =>
			request(url, { ...config, method: "PUT", body }),

		patch: (url, body, config) =>
			request(url, { ...config, method: "PATCH", body }),

		delete: (url, config) => request(url, { ...config, method: "DELETE" }),
	};
};

// Default instance
const http = createHttp();

export default http;
