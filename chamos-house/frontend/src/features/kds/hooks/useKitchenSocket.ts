import { useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';
import { pedidoService } from '@/features/orders/api/pedidoService';
import { useKdsStore } from '@/features/kds/store/kdsStore';
import type {
  EstadoPedido,
  NuevoPedidoSocketPayload,
  Pedido,
  PedidoActualizadoSocketPayload,
} from '@/features/orders/types/pedido';
import { SOCKET_BASE_URL } from '@/utils/constants';

function mapSocketPayloadToPedido(payload: NuevoPedidoSocketPayload): Pedido {
  return {
    id: payload.pedido_id,
    usuario_id: payload.usuario.id,
    estado: payload.estado,
    metodo_pago: payload.metodo_pago as Pedido['metodo_pago'],
    total: payload.total,
    f_creacion: payload.f_creacion,
    usuario: {
      id: payload.usuario.id,
      telefono: payload.usuario.telefono,
      nombre: payload.usuario.nombre,
      rol: 'cliente',
      activo: true,
      f_creacion: payload.f_creacion,
    },
    detalles: payload.items.map((item) => ({
      id: item.detalle_id,
      pedido_id: payload.pedido_id,
      producto_id: item.producto.id,
      cantidad: item.cantidad,
      p_unitario: item.p_unitario,
      modificadores: item.modificadores,
      producto: {
        id: item.producto.id,
        nombre: item.producto.nombre,
        precio: item.p_unitario,
        categoria: item.producto.categoria,
        disponible: true,
      },
    })),
  };
}

export function useKitchenSocket() {
  const pedidos = useKdsStore((s) => s.pedidos);
  const isConnected = useKdsStore((s) => s.isConnected);
  const isLoading = useKdsStore((s) => s.isLoading);
  const hydrateFromList = useKdsStore((s) => s.hydrateFromList);
  const addPedido = useKdsStore((s) => s.addPedido);
  const movePedido = useKdsStore((s) => s.movePedido);
  const setConnected = useKdsStore((s) => s.setConnected);
  const setLoading = useKdsStore((s) => s.setLoading);

  const initPedidos = useCallback(async () => {
    setLoading(true);
    const maxRetries = 3;
    let retryCount = 0;

    const attemptLoad = async (): Promise<void> => {
      try {
        const activos = await pedidoService.getActivos();
        hydrateFromList(activos);
        setLoading(false);
      } catch (error) {
        retryCount += 1;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `[KDS] Error cargando pedidos (intento ${retryCount}/${maxRetries}):`,
          errorMsg
        );

        if (retryCount < maxRetries) {
          const delayMs = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
          console.info(`[KDS] Reintentando en ${delayMs}ms...`);
          setTimeout(() => {
            void attemptLoad();
          }, delayMs);
        } else {
          console.error('[KDS] Falló después de', maxRetries, 'intentos');
          setLoading(false);
        }
      }
    };

    await attemptLoad();
  }, [hydrateFromList, setLoading]);

  useEffect(() => {
    void initPedidos();

    const token = localStorage.getItem('chamos-auth-token');
    const socket = io(`${SOCKET_BASE_URL}/cocina`, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('nuevo_pedido', (payload: NuevoPedidoSocketPayload) => {
      const pedido = mapSocketPayloadToPedido(payload);
      addPedido(pedido);
    });

    socket.on('pedido_actualizado', (payload: PedidoActualizadoSocketPayload) => {
      movePedido(payload.pedido_id, payload.nuevo_estado);
    });

    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [initPedidos, addPedido, movePedido, setConnected]);

  const actualizarEstado = useCallback(
    async (pedidoId: number, nuevoEstado: EstadoPedido) => {
      movePedido(pedidoId, nuevoEstado);
      try {
        await pedidoService.actualizarEstado(pedidoId, nuevoEstado);
      } catch (error) {
        console.error('[KDS] Error actualizando estado, recargando...', error);
        await initPedidos();
      }
    },
    [movePedido, initPedidos],
  );

  return {
    pedidos,
    isConnected,
    isLoading,
    actualizarEstado,
    refresh: initPedidos,
  };
}
