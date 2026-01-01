// frontend/lib/secureFetch.ts
import { cookies } from "next/headers";
import { logger } from "./logger";

/**
 * Standard API response from backend
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  timestamp?: string;
}

interface SecureFetchOptions extends Omit<RequestInit, "headers"> {
  timeout?: number;
  enableLogging?: boolean;
}

type SecureFetchResult<T = unknown> =
  | {
      ok: true;
      status: number;
      data: T;
    }
  | {
      ok: false;
      status: number;
      error: string;
    };

/**
 * Validates URL for SSRF prevention
 */
function validateUrl(url: string): void {
  const allowedBaseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

  if (!allowedBaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_BETTER_AUTH_URL environment variable is not set",
    );
  }

  // Build full URL if relative path
  const fullUrl = url.startsWith("/")
    ? `${allowedBaseUrl}${"/api/v1"}${url}`
    : url;

  try {
    const parsedUrl = new URL(fullUrl);

    // Enforce HTTPS in production
    if (
      process.env.NODE_ENV === "production" &&
      parsedUrl.protocol !== "https:"
    ) {
      throw new Error("Only HTTPS requests are allowed in production");
    }

    // Verify URL starts with allowed base
    if (!fullUrl.startsWith(allowedBaseUrl)) {
      throw new Error(
        `URL must start with allowed base URL: ${allowedBaseUrl}`,
      );
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid URL format: ${url}`);
    }
    throw error;
  }
}

/**
 * Creates a fetch request with timeout
 */
function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);

    fetch(url, { ...options, signal: controller.signal })
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

/**
 * Secure fetch wrapper for backend API calls
 * - Always requires authentication (includes cookies)
 * - Validates URLs to prevent SSRF
 * - Handles backend error messages properly
 * - Includes timeout protection
 *
 * @param url - API endpoint (relative path like '/api/v1/wishes' or full URL)
 * @param options - Fetch options (timeout, cache, method, body, etc.)
 * @returns Typed response with ok/error handling
 *
 * @example
 * ```typescript
 * // GET request
 * const result = await secureFetch<WishData[]>('/api/v1/wishes');
 * if (result.ok && result.data) {
 *   // Use result.data
 * } else {
 *   // Handle result.error
 * }
 *
 * // POST request
 * const result = await secureFetch('/api/v1/wishes/vote', {
 *   method: 'POST',
 *   body: JSON.stringify({ wishId: 1, amount: 100 })
 * });
 * ```
 */
export async function secureFetch<T = unknown>(
  url: string,
  options: SecureFetchOptions = {},
): Promise<SecureFetchResult<T>> {
  const {
    timeout = 10000,
    enableLogging: log = false,
    ...fetchOptions
  } = options;

  const startTime = Date.now();
  let fullUrl = url;

  try {
    // Build full URL if relative
    const baseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;
    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_BETTER_AUTH_URL environment variable is not set",
      );
    }

    if (url.startsWith("/")) {
      fullUrl = `${baseUrl}${"/api/v1"}${url}`;
    }

    // Validate URL (SSRF prevention)
    validateUrl(fullUrl);

    // Get authentication cookies
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    if (!cookieHeader) {
      logger.warn("No authentication cookies found for request");
      return {
        ok: false,
        status: 401,
        error: "Authentication required",
      };
    }

    // Log request in development
    if (log) {
      logger.info(`Fetch: ${fetchOptions.method || "GET"} ${fullUrl}`);
    }

    // Make authenticated request with timeout
    const response = await fetchWithTimeout(
      fullUrl,
      {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        credentials: "include",
        // Default to no-store for fresh data
        cache: fetchOptions.cache || "no-store",
      },
      timeout,
    );

    // Parse JSON response
    let responseData: ApiResponse<T>;
    try {
      responseData = await response.json();
    } catch (parseError) {
      logger.error("Failed to parse JSON response", {
        url: fullUrl,
        status: response.status,
        error: parseError,
      });
      return {
        ok: false,
        status: response.status,
        error: "Invalid response format from server",
      };
    }

    // Handle unsuccessful responses
    if (!response.ok || !responseData.success) {
      const errorMessage =
        responseData.error || `Request failed with status ${response.status}`;

      logger.warn("API request failed", {
        url: fullUrl,
        status: response.status,
        error: errorMessage,
        duration: Date.now() - startTime,
      });

      return {
        ok: false,
        status: response.status,
        error: errorMessage,
      };
    }

    // Log success in development
    if (log) {
      logger.info(
        `Fetch completed: ${response.status} in ${Date.now() - startTime}ms`,
      );
    }

    return {
      ok: true,
      status: response.status,
      data: responseData.data,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    logger.error("Secure fetch error", {
      url: fullUrl,
      error: errorMessage,
      duration: Date.now() - startTime,
    });

    return {
      ok: false,
      status: 500,
      error: errorMessage,
    };
  }
}

/**
 * Convenience wrapper for GET requests
 */
export async function secureGet<T = unknown>(
  url: string,
  options?: Omit<SecureFetchOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetch<T>(url, { ...options, method: "GET" });
}

/**
 * Convenience wrapper for POST requests
 */
export async function securePost<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<SecureFetchOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetch<T>(url, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for PUT requests
 */
export async function securePut<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<SecureFetchOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetch<T>(url, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for DELETE requests
 */
export async function secureDelete<T = unknown>(
  url: string,
  options?: Omit<SecureFetchOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetch<T>(url, { ...options, method: "DELETE" });
}
