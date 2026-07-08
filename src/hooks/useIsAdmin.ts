import { useUser } from "@clerk/react";

export function useIsAdmin(): { isAdmin: boolean; isLoaded: boolean } {
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";
  return { isAdmin, isLoaded };
}
