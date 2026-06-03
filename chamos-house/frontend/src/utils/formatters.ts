import type { EstadoPedido, MetodoPago } from '@/types/pedido';
import { ESTADO_LABELS } from '@/types/pedido';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function formatDateShort(iso: string): string {
  return new Intl.DateTimeFormat('es-CR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatTelefono(telefono: string): string {
  const digits = telefono.replace(/\D/g, '');
  if (digits.length === 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return telefono;
}

export function formatEstado(estado: EstadoPedido): string {
  return ESTADO_LABELS[estado];
}

export function formatMetodoPago(metodo: MetodoPago): string {
  const labels: Record<MetodoPago, string> = {
    efectivo: 'Efectivo',
    tarjeta: 'Tarjeta',
    transferencia: 'Transferencia',
    sinpe_movil: 'Sinpe Movil',
  };
  return labels[metodo];
}

export function formatElapsedTime(fCreacion: string): string {
  const start = new Date(fCreacion).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - start);
  const totalMinutes = Math.floor(diffMs / 60000);

  if (totalMinutes < 1) return '< 1 min';
  if (totalMinutes < 60) return `${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function formatModificadores(modificadores: Record<string, unknown> | null): string {
  if (!modificadores || Object.keys(modificadores).length === 0) return '';

  return Object.entries(modificadores)
    .filter(([, value]) => value === true || (typeof value === 'string' && value.length > 0))
    .map(([key, value]) => {
      if (typeof value === 'string') return `${key}: ${value}`;
      return key.replace(/_/g, ' ');
    })
    .join(', ');
}

export function toDateInputValue(date: Date = new Date()): string {
  return date.toISOString().split('T')[0] ?? '';
}
