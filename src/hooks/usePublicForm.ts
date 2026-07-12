import { useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { apiFetch, ApiError } from "../lib/api";

export type PublicFormSubmitResult =
  | { outcome: "success" }
  | { outcome: "error"; message: string };

type PostFn = (path: string, opts: { method: "POST"; body: unknown }) => Promise<unknown>;

/**
 * Submit lifecycle shared by the public forms (contact, return, complaint).
 * A filled honeypot resolves to success without touching the network — bots
 * get the same response as humans. Server-provided ApiError messages surface
 * verbatim; anything else collapses to the form's fallback copy.
 */
export async function submitPublicForm(opts: {
  path: string;
  body: Record<string, unknown>;
  honeypot: string;
  fallbackError: string;
  post?: PostFn;
}): Promise<PublicFormSubmitResult> {
  const { path, body, honeypot, fallbackError, post = apiFetch } = opts;
  if (honeypot) return { outcome: "success" };
  try {
    await post(path, { method: "POST", body: { ...body, _hp: honeypot } });
    return { outcome: "success" };
  } catch (err) {
    return {
      outcome: "error",
      message: err instanceof ApiError && err.message ? err.message : fallbackError,
    };
  }
}

const HONEYPOT_STYLE: CSSProperties = { display: "none" };

/**
 * Owns the state machine of a public form: honeypot, loading, success, error.
 * The form keeps its own field state and calls `submit(body)`; spread
 * `honeypotProps` onto a hidden input to arm the spam trap.
 */
export function usePublicForm(path: string, fallbackError: string) {
  const [honeypot, setHoneypot] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(
    body: Record<string, unknown>,
    opts?: { onSuccess?: () => void },
  ): Promise<void> {
    setLoading(true);
    setError(null);
    const result = await submitPublicForm({ path, body, honeypot, fallbackError });
    if (result.outcome === "success") {
      setSuccess(true);
      opts?.onSuccess?.();
    } else {
      setError(result.message);
    }
    setLoading(false);
  }

  const honeypotProps = {
    type: "text",
    value: honeypot,
    onChange: (e: ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value),
    "aria-hidden": true,
    tabIndex: -1,
    autoComplete: "off",
    style: HONEYPOT_STYLE,
  } as const;

  return { honeypotProps, loading, success, error, submit };
}
