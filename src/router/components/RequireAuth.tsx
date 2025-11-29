import { useAuth } from "@/context/AuthProvider";
import { type ComponentType, type ReactNode } from "react";
import { Navigate } from "react-router";

export function RequireAuth({
  children,
  acceptAuths,
}: {
  children: ReactNode;
  acceptAuths?: string[];
}) {
  const { userRoles } = useAuth();

  if (!acceptAuths) return children;

  const hasPermission = !!userRoles.find(({ role }) => {
    if (role.code === "ADMIN") return true;
    return !!role.rolePermissions.find((permission) =>
      acceptAuths.includes(permission.permission.code),
    );
  });

  return hasPermission ? children : null;
}

/**
 * A Higher-Order Component (HOC) that wraps a component with authentication and authorization checks.
 *
 * It checks if a user is authenticated. If not, it redirects to the login page.
 * It also checks if the user has all the required permissions to view the page.
 * If the user is authenticated but lacks permissions, it can redirect to an unauthorized page or return null.
 *
 * @example
 * const AuthenticatedAttendancePage = withAuth(AttendanceManagementPage, ['view_attendance']);
 *
 * @param WrappedComponent The component to wrap.
 * @param requiredPermissions An array of permission strings required to access the component.
 * @returns A new component with authentication and authorization checks.
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredPermissions: string[],
) {
  // The HOC returns a new component
  const WithAuthComponent = (props: P) => {
    const { userRoles, isAuthenticated } = useAuth();

    // 1. Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      return <Navigate to="/login" replace />;
    }

    // 2. Check for required permissions
    const hasRequiredPermissions = !!userRoles.find(({ role }) => {
      if (role.code === "ADMIN") return true;
      return !!role.rolePermissions.find((permission) =>
        requiredPermissions.includes(permission.permission.code),
      );
    });

    if (!hasRequiredPermissions) {
      // You can redirect to an "Unauthorized" page or simply render nothing
      return <Navigate to="/unauthorized" replace />; // Or return null;
    }

    // 3. Render the component if all checks pass
    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
}
