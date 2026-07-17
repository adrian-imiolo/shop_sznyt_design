import { useUser } from "@clerk/react";
import { isAdminRole } from "@sznyt/shared";

export function useIsAdmin(): { isAdmin: boolean; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  const isAdmin = isAdminRole(user?.publicMetadata?.role);
  return { isAdmin, isLoaded };
}
