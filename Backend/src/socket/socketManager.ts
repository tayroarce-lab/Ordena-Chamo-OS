import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketManager {
  private io: SocketIOServer | null = null;

  /**
   * Inicializa el servidor de Socket.io y configura namespaces.
   */
  public init(server: HttpServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // Se debe restringir en producción
        methods: ['GET', 'POST', 'PATCH']
      }
    });

    // Namespace exclusivo para el KDS de la cocina
    const cocinaNamespace = this.io.of('/cocina');
    cocinaNamespace.on('connection', (socket) => {
      console.log(`[Socket] Cliente conectado a /cocina: ${socket.id}`);
      
      socket.on('disconnect', () => {
        console.log(`[Socket] Cliente desconectado de /cocina: ${socket.id}`);
      });
    });
  }

  /**
   * Obtiene la instancia principal de Socket.io
   */
  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io no ha sido inicializado.');
    }
    return this.io;
  }

  /**
   * Obtiene directamente el namespace de la cocina para emitir eventos
   */
  public getCocinaNamespace() {
    return this.getIO().of('/cocina');
  }
}

// Exportar una única instancia (Singleton)
export const socketManager = new SocketManager();
