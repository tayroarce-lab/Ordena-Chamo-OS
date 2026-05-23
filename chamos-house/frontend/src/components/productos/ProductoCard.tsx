import { Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { Producto } from '@/types/producto';
import { formatCurrency } from '@/utils/formatters';

interface ProductoCardProps {
  producto: Producto;
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
  onToggleDisponible: (producto: Producto) => void;
}

export function ProductoCard({ producto, onEdit, onDelete, onToggleDisponible }: ProductoCardProps) {
  return (
    <div
      className={clsx(
        'flex flex-col rounded-xl border border-border-subtle bg-surface transition-colors',
        'hover:border-accent/50',
        !producto.disponible && 'opacity-75',
      )}
    >
      <div className="flex items-start justify-between p-4">
        <span className="rounded bg-elevated px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-secondary">
          {producto.categoria ?? 'General'}
        </span>
        <button
          type="button"
          onClick={() => onToggleDisponible(producto)}
          className={clsx(
            'flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold uppercase',
            producto.disponible
              ? 'border-success/30 bg-success/10 text-success'
              : 'border-muted/40 bg-muted/10 text-muted',
          )}
        >
          <span
            className={clsx(
              'h-1.5 w-1.5 rounded-full',
              producto.disponible ? 'bg-success' : 'bg-muted',
            )}
          />
          {producto.disponible ? 'Disponible' : 'Agotado'}
        </button>
      </div>

      <div className="flex-1 px-5 pb-4">
        <h3 className="font-heading text-lg font-semibold text-text-primary">{producto.nombre}</h3>
        <p className="mt-3 font-mono text-xl font-bold text-accent">{formatCurrency(producto.precio)}</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
        <button
          type="button"
          onClick={() => onEdit(producto)}
          className="flex items-center justify-center gap-2 py-3 text-sm text-text-secondary transition-colors hover:bg-elevated hover:text-accent"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(producto)}
          className="flex items-center justify-center gap-2 py-3 text-sm text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
