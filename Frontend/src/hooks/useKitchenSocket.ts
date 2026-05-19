import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { KDSState, Pedido, EstadoPedido } from '../types/pedido.types';
import { pedidoApiService } from '../services/pedidoApiService';

const SOCKET_URL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/api', '') 
  : 'http://localhost:3000';

export function useKitchenSocket() {
  const [pedidos, setPedidos] = useState<KDSState>({
    pendiente: [],
    en_proceso: [],
    listo: [],
    entregado: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const initPedidos = useCallback(async () => {
    try {
      const activos = await pedidoApiService.getPedidosActivos();
      
      const newState: KDSState = {
        pendiente: [],
        en_proceso: [],
        listo: [],
        entregado: []
      };

      if (Array.isArray(activos)) {
        activos.forEach(p => {
          if (newState[p.estado]) {
            newState[p.estado].push(p);
          }
        });
      }

      setPedidos(newState);
    } catch (error) {
      console.error('Error cargando pedidos iniciales:', error);
    }
  }, []);

  useEffect(() => {
    // 1. Cargar estado inicial HTTP
    initPedidos();

    // 2. Conectar al namespace de cocina
    const newSocket = io(`${SOCKET_URL}/cocina`);
    setSocket(newSocket);

    newSocket.on('connect', () => setIsConnected(true));
    newSocket.on('disconnect', () => setIsConnected(false));

    // 3. Escuchar nuevos pedidos
    newSocket.on('nuevo_pedido', (nuevoPedido: Pedido) => {
      setPedidos(prev => ({
        ...prev,
        pendiente: [...prev.pendiente, nuevoPedido]
      }));
    });

    // 4. Escuchar actualizaciones de estado (emitidas por el backend o por otros clientes)
    newSocket.on('pedido_actualizado', (payload: { pedido_id: number; nuevo_estado: EstadoPedido }) => {
      setPedidos(prev => {
        let pedidoToMove: Pedido | undefined;
        let estadoOriginal: EstadoPedido | undefined;

        for (const estado of ['pendiente', 'en_proceso', 'listo', 'entregado'] as EstadoPedido[]) {
          const found = prev[estado].find(p => p.id === payload.pedido_id);
          if (found) {
            pedidoToMove = found;
            estadoOriginal = estado;
            break;
          }
        }

        if (!pedidoToMove || !estadoOriginal || estadoOriginal === payload.nuevo_estado) {
          return prev;
        }

        const updatedPedido = { ...pedidoToMove, estado: payload.nuevo_estado };

        return {
          ...prev,
          [estadoOriginal]: prev[estadoOriginal].filter(p => p.id !== payload.pedido_id),
          [payload.nuevo_estado]: [...prev[payload.nuevo_estado], updatedPedido]
        };
      });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [initPedidos]);

  const actualizarEstado = async (pedidoId: number, nuevoEstado: EstadoPedido) => {
    // Actualización optimista local
    setPedidos(prev => {
      let pedidoToMove: Pedido | undefined;
      let estadoOriginal: EstadoPedido | undefined;

      for (const estado of ['pendiente', 'en_proceso', 'listo', 'entregado'] as EstadoPedido[]) {
        const found = prev[estado].find(p => p.id === pedidoId);
        if (found) {
          pedidoToMove = found;
          estadoOriginal = estado;
          break;
        }
      }

      if (!pedidoToMove || !estadoOriginal) return prev;

      const updatedPedido = { ...pedidoToMove, estado: nuevoEstado };

      return {
        ...prev,
        [estadoOriginal]: prev[estadoOriginal].filter(p => p.id !== pedidoId),
        [nuevoEstado]: [...prev[nuevoEstado], updatedPedido]
      };
    });

    // Llamada HTTP al backend
    try {
      await pedidoApiService.actualizarEstado(pedidoId, nuevoEstado);
    } catch (error) {
      console.error('Error al actualizar estado, revirtiendo estado...', error);
      // Rollback
      initPedidos(); 
    }
  };

  return { pedidos, actualizarEstado, isConnected };
}
