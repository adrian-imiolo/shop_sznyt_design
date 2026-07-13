import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/react";
import { plPL } from "@clerk/localizations";
import { HelmetProvider } from "react-helmet-async";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ClerkProvider publishableKey={publishableKey} afterSignOutUrl="/" localization={plPL}>
        <App />
      </ClerkProvider>
    </HelmetProvider>
  </StrictMode>,
);
