import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { userId, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (userId !== import.meta.env.VITE_ADMIN_USER_ID) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default AdminGuard;
