/**
 * The admin-role rule (issue #129): which claim value grants back-office
 * access. Clerk surfaces the role differently on each side (publicMetadata
 * in the browser, session claims on the server) — extraction stays in the
 * adapters, but the rule itself lives only here.
 */
export const ADMIN_ROLE = "admin";

export function isAdminRole(role: unknown): boolean {
  return role === ADMIN_ROLE;
}
