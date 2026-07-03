import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { KDSPage } from '@/features/kds/pages/KDSPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { PedidosPage } from '@/features/orders/pages/PedidosPage';
import { ProductosPage } from '@/features/products/pages/ProductosPage';
import { UsuariosPage } from '@/features/users/pages/UsuariosPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
import { useAuthStore } from '@/features/auth/store/authStore';

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
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/pedidos" element={<PedidosPage />} />
          <Route path="/productos" element={<ProductosPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
