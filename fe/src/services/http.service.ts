import { sleep } from "../lib/delay.util.js";

/**
 * HTTP Client with Retry Logic and Error Handling
 */

export interface HttpRequestConfig extends Omit<RequestInit, "body"> {
  /** Whether to include authorization header */
  withAuth?: boolean;
  /** Query parameters to append to URL */
  params?: Record<string, string | number | boolean>;
  /** Maximum number of retry attempts */
  retries?: number;
  /** Base delay between retries in ms */
  retryDelay?: number;
  /** Custom predicate to determine if request should be retried */
  shouldRetry?: (error: HttpError, attempt: number) => boolean;
  /** Request body - handled separately for JSON serialization */
  body?: unknown;
}

/** Extended error type with HTTP-specific metadata */
export interface HttpError extends Error {
  statusCode?: number;
  errorCode?: string;
  requestId?: string;
}

export interface HttpInstance {
  setToken(token: string | null): void;
  getToken(): string | null;
  clearToken(): void;
  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T>;
  post<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<T>;
  put<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<T>;
}

/**
 * Default retry predicate - retry on network errors and 5xx errors
 */
function defaultShouldRetry(error: HttpError, attempt: number): boolean {
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
  const exponentialDelay = baseDelay * 2 ** attempt;

  // Add jitter: random value between 0-100ms
  const jitter = Math.random() * 100;

  return Math.min(exponentialDelay + jitter, 10000); // Cap at 10 seconds
}

export const createHttp = (baseURL?: string): HttpInstance => {
  const base = baseURL || "http://localhost:3001";

  let accessToken: string | null = null;

  const setToken = (token: string | null): void => {
    accessToken = token;
  };

  const getToken = (): string | null => accessToken;

  const clearToken = (): void => {
    accessToken = null;
  };

  /**
   * Build full URL with query parameters
   */
  const buildURL = (url: string, params?: HttpRequestConfig["params"]): string => {
    const full = `${base}${url}`;

    if (!params) return full;

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      queryParams.set(key, String(value));
    }

    const queryString = queryParams.toString();
    return queryString ? `${full}?${queryString}` : full;
  };

  /**
   * Core request handler with retry logic
   */
  const request = async <T>(url: string, config: HttpRequestConfig = {}): Promise<T> => {
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

    let lastError: HttpError | null = null;

    // Attempt request with retries
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const finalHeaders = new Headers(headers || {});

        // Inject token
        if (accessToken && withAuth) {
          finalHeaders.set("Authorization", `Bearer ${accessToken}`);
        }

        // Prepare body - serialize objects to JSON
        let finalBody: BodyInit | undefined;
        if (body != null) {
          if (typeof body === "object" && !(body instanceof FormData)) {
            finalHeaders.set("Content-Type", "application/json");
            finalBody = JSON.stringify(body);
          } else {
            finalBody = body as BodyInit;
          }
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
              const errorData = (await res.json()) as {
                message?: string;
                errorCode?: string;
                error?: string;
                requestId?: string;
              };
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
            `HTTP ${res.status}: ${errorMessage}${errorCode ? ` (${errorCode})` : ""}${requestId ? ` [Request ID: ${requestId}]` : ""}`
          ) as HttpError;
          error.statusCode = res.status;
          error.errorCode = errorCode;
          error.requestId = requestId;

          throw error;
        }

        // Auto parse JSON if possible
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          return res.json();
        }

        return res.text() as unknown as T;
      } catch (error) {
        lastError = error as HttpError;

        // Check if we should retry
        if (attempt < retries && shouldRetry(lastError, attempt)) {
          const delay = calculateRetryDelay(attempt, retryDelay);
          console.warn(
            `[HTTP] Request failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay.toFixed(0)}ms:`,
            lastError.message
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
    get: (url, config) => request(url, { ...config, method: "GET" } as HttpRequestConfig),
    post: (url, body, config) =>
      request(url, { ...config, method: "POST", body } as HttpRequestConfig),
    put: (url, body, config) =>
      request(url, { ...config, method: "PUT", body } as HttpRequestConfig),
    patch: (url, body, config) =>
      request(url, { ...config, method: "PATCH", body } as HttpRequestConfig),
    delete: (url, config) => request(url, { ...config, method: "DELETE" } as HttpRequestConfig),
  };
};

// Default instance
const http = createHttp();

export default http;
