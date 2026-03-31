import { createContext, useContext, useState } from "react";

type Consent = "accepted" | "declined" | null;

type CookieConsentContextType = {
  consent: Consent;
  accept: () => void;
  decline: () => void;
};

const CookieConsentContext = createContext<CookieConsentContextType | null>(null);

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

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent must be used inside CookieConsentProvider");
  return context;
}
