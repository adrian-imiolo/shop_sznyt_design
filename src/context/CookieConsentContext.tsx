import { useState } from "react";
import { CookieConsentContext, COOKIE_CONSENT_KEY, type Consent } from "./cookie-consent-context";

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent>(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (stored === "accepted") return "accepted";
    if (stored === "declined") return "declined";
    return null;
  });

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsent("accepted");
  }

  function decline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setConsent("declined");
  }

  return (
    <CookieConsentContext.Provider value={{ consent, accept, decline }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
