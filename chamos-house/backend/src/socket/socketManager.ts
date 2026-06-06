import type { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';
import { registerCocinaNamespace } from './handlers/cocinaHandler';
import { logger } from '../utils/logger';

class SocketManager {
  private io: SocketIOServer | null = null;

  initializeSocket(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: env.frontendUrl,
        methods: ['GET', 'POST', 'PATCH'],
        credentials: true,
        allowEIO3: true,
      },
      transports: ['websocket', 'polling'],
      pingInterval: 25000,
      pingTimeout: 60000,
      maxHttpBufferSize: 1e6,
    });

    registerCocinaNamespace(this.io);
    logger.info('Socket.io inicializado');
    return this.io;
  }

  getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io no ha sido inicializado');
    }
    return this.io;
  }
}

export const socketManager = new SocketManager();
