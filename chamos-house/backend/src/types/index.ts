export type RolUsuario = 'cliente' | 'cocina' | 'admin';

export type EstadoPedido = 'pendiente' | 'en_proceso' | 'listo' | 'entregado';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'sinpe_movil';

export type PeriodoReporte = 'dia' | 'semana' | 'mes';

export interface JwtPayload {
  id: number;
  rol: RolUsuario;
  telefono: string;
}

export interface PedidoItemInput {
  producto_id: number;
  cantidad: number;
  modificadores: Record<string, unknown> | null;
}

export interface WebhookPedidoPayload {
  telefono: string;
  nombre_cliente?: string;
  metodo_pago: MetodoPago;
  notas?: string;
  items: PedidoItemInput[];
}

export interface PedidoHistorialFiltros {
  startDate?: Date;
  endDate?: Date;
  estado?: EstadoPedido;
  metodo_pago?: MetodoPago;
  page: number;
  limit: number;
}

export interface UsuarioFiltros {
  page: number;
  limit: number;
  rol?: RolUsuario;
  search?: string;
}

export interface PedidoSocketItem {
  detalle_id: number;
  producto: {
    id: number;
    nombre: string;
    categoria: string | null;
  };
  cantidad: number;
  p_unitario: number;
  modificadores: Record<string, unknown> | null;
}

export interface PedidoCompletoSocket {
  pedido_id: number;
  usuario: {
    id: number;
    nombre: string | null;
    telefono: string;
  };
  estado: EstadoPedido;
  metodo_pago: MetodoPago;
  total: number;
  notas: string | null;
  f_creacion: string;
  items: PedidoSocketItem[];
}

export interface PedidoActualizadoSocket {
  pedido_id: number;
  estado_anterior: EstadoPedido;
  nuevo_estado: EstadoPedido;
  updated_at: string;
}

export interface PedidoCanceladoSocket {
  pedido_id: number;
}

export const TRANSICIONES_VALIDAS: Record<EstadoPedido, EstadoPedido[] | null> = {
  pendiente: ['en_proceso'],
  en_proceso: ['pendiente', 'listo'],
  listo: ['en_proceso', 'entregado'],
  entregado: null,
};

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  'pendiente',
  'en_proceso',
  'listo',
  'entregado',
];

export const METODOS_PAGO: MetodoPago[] = [
  'efectivo',
  'tarjeta',
  'transferencia',
  'sinpe_movil',
];

export const ROLES_USUARIO: RolUsuario[] = ['cliente', 'cocina', 'admin'];
