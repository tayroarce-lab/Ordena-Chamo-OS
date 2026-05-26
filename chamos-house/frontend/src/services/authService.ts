import { apiClient } from '@/config/axios';
import type { ApiSuccess } from '@/types/api';
import type { LoginCredentials } from '@/types/auth';
import type { Usuario } from '@/types/usuario';

interface LoginData {
  token: string;
  user: Usuario;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; usuario: Usuario }> => {
    const { data } = await apiClient.post<ApiSuccess<LoginData>>('/auth/login', credentials);
    return { token: data.data.token, usuario: data.data.user };
  },

  me: async (): Promise<Usuario> => {
    const { data } = await apiClient.get<ApiSuccess<Usuario>>('/auth/me');
    return data.data;
  },
};
