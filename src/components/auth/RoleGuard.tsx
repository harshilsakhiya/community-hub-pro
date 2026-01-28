import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

type AllowedRole = "admin" | "resident" | "gatekeeper" | "committee_member";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: AllowedRole[];
  fallback?: ReactNode;
}

/**
 * Component to conditionally render children based on user role
 * Use this for hiding/showing UI elements based on role
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();
  const userRole = user?.role as AllowedRole | undefined;

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user has specific role(s)
 */
export function useHasRole(roles: AllowedRole | AllowedRole[]): boolean {
  const { user } = useAuth();
  const userRole = user?.role as AllowedRole | undefined;
  
  if (!userRole) return false;
  
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return rolesArray.includes(userRole);
}

export default RoleGuard;
