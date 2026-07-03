import type { Usuario } from '@/features/users/types/usuario';
import type { Producto } from '@/features/products/types/producto';

export type EstadoPedido = 'pendiente' | 'en_proceso' | 'listo' | 'entregado';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'sinpe_movil';

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
  metodo_pago: MetodoPago;
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
  entregado: null,
};

export const ESTADO_LABELS: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  listo: 'Listo',
  entregado: 'Entregado',
};

export interface NuevoPedidoSocketPayload {
  pedido_id: number;
  usuario: { id: number; nombre: string | null; telefono: string };
  estado: 'pendiente';
  metodo_pago: string;
  total: number;
  f_creacion: string;
  items: Array<{
    detalle_id: number;
    producto: { id: number; nombre: string; categoria: string | null };
    cantidad: number;
    p_unitario: number;
    modificadores: Record<string, unknown> | null;
  }>;
}

export interface PedidoActualizadoSocketPayload {
  pedido_id: number;
  estado_anterior?: EstadoPedido;
  nuevo_estado: EstadoPedido;
  updated_at?: string;
}
