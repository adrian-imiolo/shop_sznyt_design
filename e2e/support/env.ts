import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { resolveE2eDatabaseUrl } from "./e2eDbUrl";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// backend/.env holds DATABASE_URL plus the Stripe and Clerk secrets the run
// needs; dotenv never overrides variables that are already set.
dotenv.config({ path: path.join(repoRoot, "backend", ".env") });

export const REPO_ROOT = repoRoot;
export const E2E_DATABASE_URL = resolveE2eDatabaseUrl(process.env);
export const FRONTEND_URL = "http://localhost:5173";
export const BACKEND_URL = "http://localhost:3000";

// "+clerk_test" marks a Clerk test identity: no real emails leave the dev
// instance for it. The password is generated per run in global.setup.ts.
export const E2E_CLERK_USER_EMAIL = "e2e+clerk_test@sznytdesign.pl";
