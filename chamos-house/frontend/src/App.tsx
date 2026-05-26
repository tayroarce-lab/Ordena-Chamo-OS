import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { KDSPage } from '@/pages/KDSPage';
import { LoginPage } from '@/pages/LoginPage';
import { PedidosPage } from '@/pages/PedidosPage';
import { ProductosPage } from '@/pages/ProductosPage';
import { UsuariosPage } from '@/pages/UsuariosPage';
import { useAuthStore } from '@/store/authStore';

function RootRedirect() {
  const { isAuthenticated, usuario } = useAuthStore();
  if (!isAuthenticated || !usuario) return <Navigate to="/login" replace />;
  if (usuario.rol === 'cocina') return <Navigate to="/cocina" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin', 'cocina']} />}>
        <Route path="/cocina" element={<KDSPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
