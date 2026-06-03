import type { EstadoPedido } from '@/types/pedido';
import type { RolUsuario } from '@/types/usuario';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export const SOCKET_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') ?? window.location.origin;

export const ESTADOS_PEDIDO: EstadoPedido[] = [
  'pendiente',
  'en_proceso',
  'listo',
  'entregado',
];

export const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia', 'sinpe_movil'] as const;

export const ROLES_STAFF: RolUsuario[] = ['cocina', 'admin'];

export const CATEGORIAS_PRODUCTO = [
  'hamburguesas',
  'perros',
  'papas',
  'bebidas',
  'combos',
  'acompañamientos',
  'postres',
  'otros',
] as const;

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['admin'] as RolUsuario[] },
  { path: '/cocina', label: 'Cocina', icon: 'ChefHat', roles: ['admin', 'cocina'] as RolUsuario[] },
  { path: '/pedidos', label: 'Pedidos', icon: 'ClipboardList', roles: ['admin'] as RolUsuario[] },
  { path: '/productos', label: 'Productos', icon: 'Package', roles: ['admin'] as RolUsuario[] },
  { path: '/usuarios', label: 'Usuarios', icon: 'Users', roles: ['admin'] as RolUsuario[] },
] as const;

export const PERIODOS_REPORTE = ['dia', 'semana', 'mes'] as const;
export type PeriodoReporte = (typeof PERIODOS_REPORTE)[number];
