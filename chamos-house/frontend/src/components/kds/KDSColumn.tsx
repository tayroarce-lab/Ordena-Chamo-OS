import clsx from 'clsx';
import { Droppable } from '@hello-pangea/dnd';
import { PedidoCard } from './PedidoCard';
import type { EstadoPedido, Pedido } from '@/types/pedido';
import { ESTADO_LABELS } from '@/types/pedido';

interface KDSColumnProps {
  titulo: string;
  estado: EstadoPedido;
  pedidos: Pedido[];
  onCambiarEstado: (pedidoId: number, nuevoEstado: EstadoPedido) => void;
}

const columnAccent: Record<EstadoPedido, string> = {
  pendiente: 'border-t-accent',
  en_proceso: 'border-t-info',
  listo: 'border-t-success',
  entregado: 'border-t-muted',
};

export function KDSColumn({ titulo, estado, pedidos, onCambiarEstado }: KDSColumnProps) {
  return (
    <div
      className={clsx(
        'flex min-h-0 flex-col rounded-xl border border-border-subtle bg-surface',
        'border-t-4',
        columnAccent[estado],
      )}
    >
      <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-text-secondary">
          {titulo}
        </h2>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-elevated font-mono text-xs font-bold text-accent">
          {pedidos.length}
        </span>
      </div>
      <Droppable droppableId={estado}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={clsx(
              "flex-1 space-y-3 overflow-y-auto p-3 scrollbar-thin transition-colors",
              snapshot.isDraggingOver && "bg-accent/5"
            )}
          >
            {pedidos.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted">
                Sin pedidos {ESTADO_LABELS[estado].toLowerCase()}
              </p>
            ) : (
              pedidos.map((pedido, index) => (
                <PedidoCard key={pedido.id} pedido={pedido} index={index} onCambiarEstado={onCambiarEstado} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
