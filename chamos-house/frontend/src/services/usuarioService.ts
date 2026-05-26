import { apiClient } from '@/config/axios';
import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { Usuario, UsuarioCreateInput, UsuarioUpdateInput } from '@/types/usuario';

export const usuarioService = {
  getAll: async (params?: { page?: number; limit?: number; rol?: string; search?: string }): Promise<{
    usuarios: Usuario[];
    total: number;
  }> => {
    const { data } = await apiClient.get<ApiPaginated<Usuario[]>>('/usuarios', { params });
    return { usuarios: data.data, total: data.pagination.total };
  },

  create: async (input: UsuarioCreateInput): Promise<Usuario> => {
    const { data } = await apiClient.post<ApiSuccess<Usuario>>('/usuarios', input);
    return data.data;
  },

  update: async (id: number, input: UsuarioUpdateInput): Promise<Usuario> => {
    const { data } = await apiClient.put<ApiSuccess<Usuario>>(`/usuarios/${id}`, input);
    return data.data;
  },

  toggleActivo: async (id: number): Promise<Usuario> => {
    const { data } = await apiClient.patch<ApiSuccess<Usuario>>(`/usuarios/${id}/activo`);
    return data.data;
  },
};
