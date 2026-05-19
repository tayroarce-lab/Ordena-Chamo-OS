export type EstadoPedido = 'pendiente' | 'en_proceso' | 'listo' | 'entregado';

export interface Usuario {
  id: number;
  telefono: string;
  nombre: string | null;
  rol: 'cliente' | 'cocina' | 'admin';
  f_creacion: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string | null;
  disponible: boolean;
}

export interface DetallePedido {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  p_unitario: number;
  modificadores: Record<string, unknown> | null;
  producto: Producto;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'zelle';
  total: number;
  f_creacion: string;
  usuario: Usuario;
  detalles: DetallePedido[];
  notas?: string; 
}

export interface KDSState {
  pendiente: Pedido[];
  en_proceso: Pedido[];
  listo: Pedido[];
  entregado: Pedido[];
}

export const TRANSICIONES_ESTADO: Record<EstadoPedido, EstadoPedido | null> = {
  pendiente: 'en_proceso',
  en_proceso: 'listo',
  listo: 'entregado',
  entregado: null
};
