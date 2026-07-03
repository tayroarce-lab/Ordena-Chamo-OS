import { apiClient } from '@/config/axios';
import type { ApiSuccess } from '@/types/api';
import type { Producto, ProductoCreateInput, ProductoUpdateInput } from '@/features/products/types/producto';

export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const { data } = await apiClient.get<ApiSuccess<Producto[]>>('/productos');
    return data.data;
  },

  create: async (input: ProductoCreateInput): Promise<Producto> => {
    const { data } = await apiClient.post<ApiSuccess<Producto>>('/productos', input);
    return data.data;
  },

  update: async (id: number, input: ProductoUpdateInput): Promise<Producto> => {
    const { data } = await apiClient.put<ApiSuccess<Producto>>(`/productos/${id}`, input);
    return data.data;
  },

  toggleDisponible: async (id: number): Promise<Producto> => {
    const { data } = await apiClient.patch<ApiSuccess<Producto>>(`/productos/${id}/disponible`);
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/productos/${id}`);
  },
};
