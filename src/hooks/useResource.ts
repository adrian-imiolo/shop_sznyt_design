import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api";

/**
 * Load a backend resource on mount. Pass `path: null` to hold off
 * (e.g. until Clerk resolves the user). `auth: true` attaches the
 * Clerk session token. `data` stays null while loading or on error.
 * `reload` clears both and fetches again — the retry behind a failed load.
 */
export function useResource<T>(
  path: string | null,
  opts: { auth?: boolean } = {},
): { data: T | null; error: boolean; reload: () => void } {
  const { auth = false } = opts;
  const { getToken } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (path === null) return;
    let cancelled = false;

    async function load() {
      try {
        const result = await apiFetch<T>(path as string, auth ? { auth: getToken } : {});
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setError(true);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [path, auth, getToken, attempt]);

  // Stable identity: it is handed to a retry button, not re-created per load.
  const reload = useCallback(() => {
    setData(null);
    setError(false);
    setAttempt((count) => count + 1);
  }, []);

  return { data, error, reload };
}
