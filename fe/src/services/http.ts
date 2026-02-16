export interface HttpRequestConfig extends RequestInit {
  withAuth?: boolean;
  params?: Record<string, string | number | boolean>;
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

  // Core request
  const request = async <T>(
    url: string,
    config: HttpRequestConfig = {},
  ): Promise<T> => {
    const { withAuth = true, params, headers, body, ...rest } = config;

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
      credentials: "include", // for cookie if needed
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    // Auto parse JSON if possible
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return res.json();
    }

    return res.text() as unknown as T;
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
