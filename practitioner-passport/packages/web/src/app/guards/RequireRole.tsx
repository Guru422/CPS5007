import { Navigate } from "react-router-dom";
import { Role, useAuth } from "../providers/AuthProvider";

export default function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  
  if (user.role !== role) {
    return <Navigate to="/redirect" replace />;
  }

  return <>{children}</>;
}