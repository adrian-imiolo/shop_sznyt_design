import { useState } from "react";
import { CookieConsentContext, type Consent } from "./cookie-consent-context";

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<Consent>(() => {
    const stored = localStorage.getItem("cookie_consent");
    if (stored === "accepted") return "accepted";
    if (stored === "declined") return "declined";
    return null;
  });

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setConsent("accepted");
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setConsent("declined");
  }

  return (
    <CookieConsentContext.Provider value={{ consent, accept, decline }}>
      {children}
    </CookieConsentContext.Provider>
  );
}
