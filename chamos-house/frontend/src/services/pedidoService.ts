import { apiClient } from '@/config/axios';
import type { ApiPaginated, ApiSuccess } from '@/types/api';
import type { EstadoPedido, Pedido } from '@/types/pedido';

export const pedidoService = {
  getActivos: async (): Promise<Pedido[]> => {
    const { data } = await apiClient.get<ApiSuccess<Pedido[]>>('/pedidos/activos');
    return data.data;
  },

  getAll: async (params?: {
    estado?: EstadoPedido;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ pedidos: Pedido[]; total: number; page: number; limit: number }> => {
    const { data } = await apiClient.get<ApiPaginated<Pedido[]>>('/pedidos', { params });
    return {
      pedidos: data.data,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
    };
  },

  getById: async (id: number): Promise<Pedido> => {
    const { data } = await apiClient.get<ApiSuccess<Pedido>>(`/pedidos/${id}`);
    return data.data;
  },

  actualizarEstado: async (pedidoId: number, estado: EstadoPedido): Promise<void> => {
    await apiClient.patch(`/pedidos/${pedidoId}/estado`, { estado });
  },
};
