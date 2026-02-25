/**
 * Simple HTTP Client for API calls
 */

const API_BASE_URL = process.env.API_URL || "http://localhost:3001";

/**
 * Make API request using fetch
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const requestOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(`❌ Request failed to ${url}:`, error);
    throw error;
  }
}
