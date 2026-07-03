import { Draggable } from '@hello-pangea/dnd';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTickingTime } from '@/features/kds/hooks/useTickingTime';
import clsx from 'clsx';
import type { EstadoPedido, Pedido } from '@/features/orders/types/pedido';
import { TRANSICIONES_ESTADO } from '@/features/orders/types/pedido';
import { formatCurrency, formatMetodoPago, formatModificadores, formatTelefono } from '@/utils/formatters';

const estadoBorder: Record<EstadoPedido, string> = {
  pendiente: 'border-l-danger',
  en_proceso: 'border-l-info',
  listo: 'border-l-success',
  entregado: 'border-l-muted',
};

interface PedidoCardProps {
  pedido: Pedido;
  index: number;
  onCambiarEstado: (pedidoId: number, nuevoEstado: EstadoPedido) => void;
}

const ACTION_LABELS: Record<EstadoPedido, string> = {
  pendiente: 'Iniciar',
  en_proceso: 'Listo',
  listo: 'Entregar',
  entregado: '',
};

const PREV_ESTADO: Record<EstadoPedido, EstadoPedido | null> = {
  pendiente: null,
  en_proceso: 'pendiente',
  listo: 'en_proceso',
  entregado: null,
};

const PREV_LABELS: Record<EstadoPedido, string> = {
  pendiente: '',
  en_proceso: 'Pendiente',
  listo: 'En proceso',
  entregado: '',
};

export function PedidoCard({ pedido, index, onCambiarEstado }: PedidoCardProps) {
  const elapsed = useTickingTime(pedido.f_creacion);
  const siguienteEstado = TRANSICIONES_ESTADO[pedido.estado];
  const isUrgent = elapsed.includes('h') || parseInt(elapsed, 10) >= 15;
  // El style prop es requerido por la API de @hello-pangea/dnd para drag-and-drop — no reemplazable con Tailwind
  return (
    <Draggable draggableId={pedido.id.toString()} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            ...(snapshot.isDragging ? { zIndex: 50 } : {})
          }}
          padding="sm"
          {...provided.dragHandleProps}
          className={clsx(
            'border-l-4 relative cursor-grab active:cursor-grabbing',
            estadoBorder[pedido.estado],
            pedido.estado === 'listo' && 'animate-pulse-slow',
            snapshot.isDragging && 'shadow-glow ring-2 ring-accent opacity-90'
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <span className="font-mono text-lg font-bold text-accent">#{pedido.id}</span>
              <p className="mt-0.5 text-sm font-medium text-text-primary">
                {pedido.usuario.nombre ?? 'Cliente'}
              </p>
              <p className="text-xs text-muted">{formatTelefono(pedido.usuario.telefono)}</p>
            </div>
            <Badge variant={isUrgent ? 'danger' : 'default'}>{elapsed}</Badge>
          </div>

          <ul className="mb-3 space-y-2">
            {pedido.detalles.map((detalle) => {
              const mods = formatModificadores(detalle.modificadores);
              return (
                <li key={detalle.id} className="text-sm">
                  <span className="font-mono font-semibold text-accent">{detalle.cantidad}x</span>{' '}
                  <span className="text-text-primary">{detalle.producto.nombre}</span>
                  {mods && <p className="ml-5 text-xs text-text-secondary italic">{mods}</p>}
                </li>
              );
            })}
          </ul>

          {pedido.notas && (
            <p className="mb-3 rounded bg-elevated px-2 py-1 text-xs text-text-secondary">
              📝 {pedido.notas}
            </p>
          )}

          <div className="mb-3 flex items-center justify-between text-xs text-muted">
            <span>{formatMetodoPago(pedido.metodo_pago)}</span>
            <span className="font-mono font-semibold text-text-primary">
              {formatCurrency(pedido.total)}
            </span>
          </div>

          {(siguienteEstado || PREV_ESTADO[pedido.estado]) && (
            <div className={clsx('flex gap-2', siguienteEstado && PREV_ESTADO[pedido.estado] && 'grid grid-cols-2')}>
              {PREV_ESTADO[pedido.estado] && (
                <Button
                  fullWidth
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); onCambiarEstado(pedido.id, PREV_ESTADO[pedido.estado]!); }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  {PREV_LABELS[pedido.estado]}
                </Button>
              )}
              {siguienteEstado && (
                <Button
                  fullWidth
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onCambiarEstado(pedido.id, siguienteEstado); }}
                >
                  {ACTION_LABELS[pedido.estado]}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </Card>
      )}
    </Draggable>
  );
}
