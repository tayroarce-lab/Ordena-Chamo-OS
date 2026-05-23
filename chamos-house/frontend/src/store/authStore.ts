import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '@/types/usuario';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  setAuth: (token: string, usuario: Usuario) => void;
  setUsuario: (usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      isAuthenticated: false,
      setAuth: (token, usuario) => {
        localStorage.setItem('chamos-auth-token', token);
        set({ token, usuario, isAuthenticated: true });
      },
      setUsuario: (usuario) => set({ usuario }),
      logout: () => {
        localStorage.removeItem('chamos-auth-token');
        set({ token: null, usuario: null, isAuthenticated: false });
      },
    }),
    {
      name: 'chamos-auth-storage',
      partialize: (state) => ({
        token: state.token,
        usuario: state.usuario,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          localStorage.setItem('chamos-auth-token', state.token);
        }
      },
    },
  ),
);
