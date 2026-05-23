import type { JwtPayload } from './index';

declare module 'socket.io' {
  interface SocketData {
    user?: JwtPayload;
  }
}

export {};
