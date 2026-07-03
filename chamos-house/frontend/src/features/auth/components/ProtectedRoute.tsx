import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { RolUsuario } from '@/features/users/types/usuario';

interface ProtectedRouteProps {
  allowedRoles?: RolUsuario[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, usuario } = useAuthStore();

  if (!isAuthenticated || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    if (usuario.rol === 'cocina') {
      return <Navigate to="/cocina" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
