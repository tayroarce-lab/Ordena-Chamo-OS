import { create } from 'zustand';
import type { EstadoPedido, KDSState, Pedido } from '@/features/orders/types/pedido';

const EMPTY_KDS: KDSState = {
  pendiente: [],
  en_proceso: [],
  listo: [],
  entregado: [],
};

const ESTADOS: EstadoPedido[] = ['pendiente', 'en_proceso', 'listo', 'entregado'];

function findPedidoLocation(
  state: KDSState,
  pedidoId: number,
): { estado: EstadoPedido; pedido: Pedido } | null {
  for (const estado of ESTADOS) {
    const pedido = state[estado].find((p) => p.id === pedidoId);
    if (pedido) return { estado, pedido };
  }
  return null;
}

interface KdsStoreState {
  pedidos: KDSState;
  isConnected: boolean;
  isLoading: boolean;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  hydrateFromList: (pedidos: Pedido[]) => void;
  addPedido: (pedido: Pedido) => void;
  movePedido: (pedidoId: number, nuevoEstado: EstadoPedido) => void;
  reset: () => void;
}

export const useKdsStore = create<KdsStoreState>((set) => ({
  pedidos: { ...EMPTY_KDS },
  isConnected: false,
  isLoading: true,

  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ isLoading: loading }),

  hydrateFromList: (pedidos) => {
    const next: KDSState = {
      pendiente: [],
      en_proceso: [],
      listo: [],
      entregado: [],
    };
    pedidos.forEach((p) => {
      next[p.estado].push(p);
    });
    set({ pedidos: next, isLoading: false });
  },

  addPedido: (pedido) =>
    set((state) => ({
      pedidos: {
        ...state.pedidos,
        pendiente: [...state.pedidos.pendiente, pedido],
      },
    })),

  movePedido: (pedidoId, nuevoEstado) =>
    set((state) => {
      const location = findPedidoLocation(state.pedidos, pedidoId);
      if (!location || location.estado === nuevoEstado) {
        return state;
      }

      const updatedPedido: Pedido = { ...location.pedido, estado: nuevoEstado };

      return {
        pedidos: {
          ...state.pedidos,
          [location.estado]: state.pedidos[location.estado].filter((p) => p.id !== pedidoId),
          [nuevoEstado]: [...state.pedidos[nuevoEstado], updatedPedido],
        },
      };
    }),

  reset: () => set({ pedidos: { ...EMPTY_KDS }, isLoading: true }),
}));
