/**
 * Standard API response from backend
 */
interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
  timestamp?: string;
}

interface SecureFetchClientOptions extends Omit<
  RequestInit,
  "headers" | "credentials"
> {
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
  const allowedBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!allowedBaseUrl) {
    throw new Error("NEXT_PUBLIC_BACKEND_URL environment variable is not set");
  }

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
 * Secure fetch wrapper for CLIENT COMPONENTS
 * - Browser automatically includes cookies with credentials: "include"
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
 * "use client";
 * import { securePostClient } from "@/lib/secureFetchClient";
 *
 * const result = await securePostClient<string>('/api/wishes/123/vote', {
 *   wishId: 1,
 *   amount: 100
 * });
 *
 * if (result.ok) {
 *   toast.success(result.data);
 * } else {
 *   toast.error(result.error);
 * }
 * ```
 */
async function secureFetchClient<T = unknown>(
  url: string,
  options: SecureFetchClientOptions = {},
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
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL environment variable is not set",
      );
    }

    if (url.startsWith("/")) {
      fullUrl = `${baseUrl}${"/api/v1"}${url}`;
    }

    // Validate URL (SSRF prevention)
    validateUrl(fullUrl);

    // Log request in development
    if (log) {
      console.log(`[Client Fetch] ${fetchOptions.method || "GET"} ${fullUrl}`);
    }

    // Make authenticated request with timeout
    // Browser automatically includes cookies with credentials: "include"
    const response = await fetchWithTimeout(
      fullUrl,
      {
        ...fetchOptions,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Browser handles cookies automatically
        cache: fetchOptions.cache || "no-store", // Default to no-store for fresh data
      },
      timeout,
    );

    // Parse JSON response
    let responseData: ApiResponse<T>;
    const responseText = await response.text();

    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Client Fetch] Failed to parse JSON response", {
        url: fullUrl,
        stack: parseError instanceof Error ? parseError.stack : undefined,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        responseText: responseText.substring(0, 1000),
        error: parseError,
      });
      return {
        ok: false,
        status: response.status,
        error: `Invalid response format from server: ${responseText.substring(0, 200)}`,
      };
    }

    // Handle unsuccessful responses
    if (!response.ok || !responseData.success) {
      const errorMessage =
        responseData.error || `Request failed with status ${response.status}`;

      if (log) {
        console.warn("[Client Fetch] Request failed", {
          url: fullUrl,
          status: response.status,
          error: errorMessage,
          duration: Date.now() - startTime,
        });
      }

      return {
        ok: false,
        status: response.status,
        error: errorMessage,
      };
    }

    // Log success in development
    if (log) {
      console.log(
        `[Client Fetch] Completed: ${response.status} in ${Date.now() - startTime}ms`,
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

    console.error("[Client Fetch] Error:", {
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
 * Convenience wrapper for GET requests (client)
 */
export async function secureGetClient<T = unknown>(
  url: string,
  options?: Omit<SecureFetchClientOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetchClient<T>(url, { ...options, method: "GET" });
}

/**
 * Convenience wrapper for POST requests (client)
 */
export async function securePostClient<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<SecureFetchClientOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetchClient<T>(url, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for PATCH requests
 */
export async function securePatchClient<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<SecureFetchClientOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetchClient<T>(url, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for PUT requests (client)
 */
export async function securePutClient<T = unknown>(
  url: string,
  body?: unknown,
  options?: Omit<SecureFetchClientOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetchClient<T>(url, {
    ...options,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * Convenience wrapper for DELETE requests (client)
 */
export async function secureDeleteClient<T = unknown>(
  url: string,
  options?: Omit<SecureFetchClientOptions, "method" | "body">,
): Promise<SecureFetchResult<T>> {
  return secureFetchClient<T>(url, { ...options, method: "DELETE" });
}

/**
 * Secure multipart/form-data upload for CLIENT COMPONENTS
 * - Handles file uploads with FormData
 * - Validates URLs to prevent SSRF
 * - Browser automatically sets correct Content-Type with boundary
 * - Includes timeout protection
 *
 * @param url - API endpoint (relative path like '/guilds/name/image' or full URL)
 * @param formData - FormData object containing files and fields
 * @param options - Fetch options (timeout, cache, etc.)
 * @returns Typed response with ok/error handling
 *
 * @example
 * ```typescript
 * "use client";
 * import { secureUploadClient } from "@/lib/secureFetchClient";
 *
 * const formData = new FormData();
 * formData.append("image", fileInput.files[0]);
 *
 * const result = await secureUploadClient<string>(
 *   `/guilds/${guildName}/image`,
 *   formData
 * );
 *
 * if (result.ok) {
 *   toast.success(result.data);
 * } else {
 *   toast.error(result.error);
 * }
 * ```
 */
export async function secureUploadClient<T = unknown>(
  url: string,
  formData: FormData,
  options: Omit<SecureFetchClientOptions, "method" | "body"> = {},
): Promise<SecureFetchResult<T>> {
  const {
    timeout = 30000,
    enableLogging: log = false,
    ...fetchOptions
  } = options;

  const startTime = Date.now();
  let fullUrl = url;

  try {
    // Build full URL if relative
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!baseUrl) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL environment variable is not set",
      );
    }

    if (url.startsWith("/")) {
      fullUrl = `${baseUrl}${"/api/v1"}${url}`;
    }

    // Validate URL (SSRF prevention)
    validateUrl(fullUrl);

    // Log request in development
    if (log) {
      console.log(`[Client Upload] POST ${fullUrl}`);
    }

    // Make authenticated request with timeout
    // IMPORTANT: Don't set Content-Type header - browser sets it with boundary
    const response = await fetchWithTimeout(
      fullUrl,
      {
        ...fetchOptions,
        method: "POST",
        body: formData,
        credentials: "include", // Browser handles cookies automatically
        cache: "no-store", // Never cache file uploads
      },
      timeout,
    );

    // Parse JSON response
    let responseData: ApiResponse<T>;
    const responseText = await response.text();

    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("[Client Upload] Failed to parse JSON response", {
        url: fullUrl,
        stack: parseError instanceof Error ? parseError.stack : undefined,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        responseText: responseText.substring(0, 1000),
        error: parseError,
      });
      return {
        ok: false,
        status: response.status,
        error: `Invalid response format from server: ${responseText.substring(0, 200)}`,
      };
    }

    // Handle unsuccessful responses
    if (!response.ok || !responseData.success) {
      const errorMessage =
        responseData.error || `Upload failed with status ${response.status}`;

      if (log) {
        console.warn("[Client Upload] Request failed", {
          url: fullUrl,
          status: response.status,
          error: errorMessage,
          duration: Date.now() - startTime,
        });
      }

      return {
        ok: false,
        status: response.status,
        error: errorMessage,
      };
    }

    // Log success in development
    if (log) {
      console.log(
        `[Client Upload] Completed: ${response.status} in ${Date.now() - startTime}ms`,
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

    console.error("[Client Upload] Error:", {
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
