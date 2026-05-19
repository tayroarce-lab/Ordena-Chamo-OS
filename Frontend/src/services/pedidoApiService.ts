import { Pedido, EstadoPedido } from '../types/pedido.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const pedidoApiService = {
  getPedidosActivos: async (): Promise<Pedido[]> => {
    // Nota: El backend debe implementar este endpoint GET /api/pedidos/activos
    const response = await fetch(`${API_URL}/pedidos/activos`);
    if (!response.ok) {
      throw new Error('Error al obtener pedidos activos');
    }
    const data = await response.json();
    return data.pedidos || data;
  },

  actualizarEstado: async (pedidoId: number, nuevoEstado: EstadoPedido): Promise<void> => {
    const response = await fetch(`${API_URL}/pedidos/${pedidoId}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el estado del pedido');
    }
  }
};
