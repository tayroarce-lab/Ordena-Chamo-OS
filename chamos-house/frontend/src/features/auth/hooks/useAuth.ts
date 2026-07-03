import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/features/auth/api/authService';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { ApiErrorResponse } from '@/types/api';
import type { LoginCredentials } from '@/features/auth/types/auth';
import type { RolUsuario } from '@/features/users/types/usuario';

export function useAuth() {
  const navigate = useNavigate();
  const { token, usuario, isAuthenticated, setAuth, setUsuario, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const { token, usuario } = await authService.login(credentials);
        setAuth(token, usuario);
        if (usuario.rol === 'cocina') {
          navigate('/cocina', { replace: true });
        } else if (usuario.rol === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        let message = 'Error al iniciar sesión. Verifica tus credenciales.';
        if (axios.isAxiosError(err) && err.response?.data) {
          const data = err.response.data as ApiErrorResponse;
          if (data.error) message = data.error;
        }
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, setAuth],
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const hasRole = useCallback(
    (roles: RolUsuario[]) => {
      if (!usuario) return false;
      return roles.includes(usuario.rol);
    },
    [usuario],
  );

  useEffect(() => {
    if (!token || usuario) return;

    const verifySession = async () => {
      try {
        const usuario = await authService.me();
        setUsuario(usuario);
      } catch {
        logout();
      }
    };

    void verifySession();
  }, [token, usuario, setUsuario, logout]);

  return {
    token,
    usuario,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
    hasRole,
    setError,
  };
}
