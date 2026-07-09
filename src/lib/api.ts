export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** JSON-serialized into the request body; sets Content-Type automatically. */
  body?: unknown;
  /** Token provider (Clerk's `getToken`); attaches an Authorization header. */
  auth?: () => Promise<string | null>;
};

/**
 * Fetch against the backend API. Throws ApiError on any non-ok response,
 * with `message` set to the server's `error` field when it provides one.
 * Network failures propagate as-is (not ApiError).
 */
export async function apiFetch<T = unknown>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (opts.auth) headers.Authorization = `Bearer ${await opts.auth()}`;

  const res = await fetch(`${import.meta.env.VITE_API_URL as string}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();

  if (!res.ok) {
    let serverError = "";
    try {
      const parsed = JSON.parse(text) as { error?: unknown };
      if (typeof parsed?.error === "string") serverError = parsed.error;
    } catch {
      // non-JSON error body (proxy HTML, empty) — no server message to surface
    }
    throw new ApiError(serverError, res.status);
  }

  return text ? (JSON.parse(text) as T) : (undefined as T);
}
