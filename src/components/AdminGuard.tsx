import { useIsAdmin } from "../hooks/useIsAdmin";
import { Navigate } from "react-router-dom";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoaded } = useIsAdmin();

  if (!isLoaded) return null;

  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export default AdminGuard;
