import { useState, useEffect } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "../lib/api";

/**
 * Load a backend resource on mount. Pass `path: null` to hold off
 * (e.g. until Clerk resolves the user). `auth: true` attaches the
 * Clerk session token. `data` stays null while loading or on error.
 */
export function useResource<T>(
  path: string | null,
  opts: { auth?: boolean } = {},
): { data: T | null; error: boolean } {
  const { auth = false } = opts;
  const { getToken } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState(false);

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
  }, [path, auth, getToken]);

  return { data, error };
}
