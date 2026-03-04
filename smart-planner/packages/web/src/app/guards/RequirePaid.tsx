import { useAuth } from "../providers/AuthProvider";

export default function RequirePaid({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const { user } = useAuth();
  return user.paid ? <>{children}</> : <>{fallback}</>;
}