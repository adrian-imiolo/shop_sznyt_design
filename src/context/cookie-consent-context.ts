import { createContext } from "react";

export type Consent = "accepted" | "declined" | null;

export type CookieConsentContextType = {
  consent: Consent;
  accept: () => void;
  decline: () => void;
};

export const CookieConsentContext = createContext<CookieConsentContextType | null>(null);
