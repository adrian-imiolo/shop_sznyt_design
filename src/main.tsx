import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/react";
import { plPL } from "@clerk/localizations";
import { CookieConsentProvider } from "./context/CookieConsentContext";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/" localization={plPL}>
      <CookieConsentProvider>
        <App />
      </CookieConsentProvider>
    </ClerkProvider>
  </StrictMode>,
);
