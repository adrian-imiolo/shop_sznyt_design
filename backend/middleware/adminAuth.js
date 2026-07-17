/**
 * Admin gate shared by the back-office routes (issue #108). The role lives
 * in Clerk session claims (metadata.role); built from the injected auth seam
 * so tests impersonate roles through fakeAuth.
 *
 * @param {{ getAuth: Function }} auth
 * @returns {{ getRole: Function, requireAdmin: Function }}
 */
import { isAdminRole } from "@sznyt/shared";

export function createAdminAuth(auth) {
  function getRole(req) {
    const { sessionClaims } = auth.getAuth(req);
    return sessionClaims?.metadata?.role ?? null;
  }

  function requireAdmin(req, res, next) {
    if (!isAdminRole(getRole(req))) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  }

  return { getRole, requireAdmin };
}
