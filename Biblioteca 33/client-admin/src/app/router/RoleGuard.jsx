import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore.js';
import { getDefaultRouteForRole } from '../../shared/utils/roles.js';

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.getRole());

  const hasAccess = isAuthenticated && allowedRoles.includes(role);

  if (!hasAccess) {
    if (isAuthenticated) {
      return <Navigate to={getDefaultRouteForRole(role)} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};
