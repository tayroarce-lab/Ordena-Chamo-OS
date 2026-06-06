import type { Server as SocketIOServer, Namespace } from 'socket.io';
import { AuthService } from '../../services/authService';
import { logger } from '../../utils/logger';
import type {
  PedidoActualizadoSocket,
  PedidoCompletoSocket,
} from '../../types';

let cocinaNamespace: Namespace | null = null;

export function registerCocinaNamespace(io: SocketIOServer): Namespace {
  const namespace = io.of('/cocina');

  namespace.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      next(new Error('Unauthorized'));
      return;
    }

    if (AuthService.isTokenBlacklisted(token)) {
      next(new Error('Unauthorized'));
      return;
    }

    try {
      const payload = AuthService.verifyToken(token);
      if (payload.rol !== 'cocina' && payload.rol !== 'admin') {
        next(new Error('Unauthorized'));
        return;
      }
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  namespace.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`Cliente conectado a /cocina: ${socket.id}`, {
      userId: user?.id,
      rol: user?.rol,
    });

    socket.emit('connected', {
      success: true,
      message: 'Conectado al namespace de cocina',
      socketId: socket.id,
    });

    socket.on('disconnect', () => {
      logger.info(`Cliente desconectado de /cocina: ${socket.id}`);
    });
  });

  cocinaNamespace = namespace;
  return namespace;
}

function getCocinaNs(): Namespace {
  if (!cocinaNamespace) {
    throw new Error('Namespace /cocina no inicializado');
  }
  return cocinaNamespace;
}

export function emitNuevoPedido(pedidoCompleto: PedidoCompletoSocket): void {
  getCocinaNs().emit('nuevo_pedido', pedidoCompleto);
}

export function emitPedidoActualizado(
  pedidoId: number,
  estadoAnterior: PedidoActualizadoSocket['estado_anterior'],
  nuevoEstado: PedidoActualizadoSocket['nuevo_estado']
): void {
  const payload: PedidoActualizadoSocket = {
    pedido_id: pedidoId,
    estado_anterior: estadoAnterior,
    nuevo_estado: nuevoEstado,
    updated_at: new Date().toISOString(),
  };
  getCocinaNs().emit('pedido_actualizado', payload);
}
