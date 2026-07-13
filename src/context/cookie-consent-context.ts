import { createContext } from "react";

export type Consent = "accepted" | "declined" | null;

export const COOKIE_CONSENT_KEY = "cookie_consent";

/**
 * Reads the persisted flag directly — for lazy state initializers that run
 * before the consent context has settled. Everywhere else, use the context.
 */
export function hasStoredConsent(): boolean {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
}

export type CookieConsentContextType = {
  consent: Consent;
  accept: () => void;
  decline: () => void;
};

export const CookieConsentContext = createContext<CookieConsentContextType | null>(null);
