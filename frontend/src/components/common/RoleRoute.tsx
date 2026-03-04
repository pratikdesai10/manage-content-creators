import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

interface RoleRouteProps {
  role: UserRole;
}

export function RoleRoute({ role }: RoleRouteProps) {
  const { user } = useAuth();

  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
