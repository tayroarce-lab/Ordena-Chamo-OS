import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import type { Pedido } from '@/types/pedido';
import {
  formatCurrency,
  formatDate,
  formatEstado,
  formatMetodoPago,
  formatModificadores,
  formatTelefono,
} from '@/utils/formatters';

interface PedidoDetailDrawerProps {
  pedido: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PedidoDetailDrawer({ pedido, isOpen, onClose }: PedidoDetailDrawerProps) {
  if (!pedido) return null;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Pedido #${pedido.id}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Badge variant="accent">{formatEstado(pedido.estado)}</Badge>
          <Badge>{formatMetodoPago(pedido.metodo_pago)}</Badge>
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold text-text-secondary">Cliente</h3>
          <p className="font-medium">{pedido.usuario.nombre ?? 'Sin nombre'}</p>
          <p className="text-sm text-muted">{formatTelefono(pedido.usuario.telefono)}</p>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-text-secondary">Ítems</h3>
          <ul className="space-y-3">
            {pedido.detalles.map((detalle) => {
              const mods = formatModificadores(detalle.modificadores);
              return (
                <li
                  key={detalle.id}
                  className="flex justify-between rounded-lg border border-border-subtle bg-elevated p-3"
                >
                  <div>
                    <p className="font-medium">
                      {detalle.cantidad}x {detalle.producto.nombre}
                    </p>
                    {mods && <p className="text-xs text-muted italic">{mods}</p>}
                  </div>
                  <p className="font-mono text-sm">
                    {formatCurrency(detalle.p_unitario * detalle.cantidad)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {pedido.notas && (
          <section>
            <h3 className="mb-2 text-sm font-semibold text-text-secondary">Notas</h3>
            <p className="rounded-lg bg-elevated p-3 text-sm">{pedido.notas}</p>
          </section>
        )}

        <div className="border-t border-border-subtle pt-4">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Fecha</span>
            <span>{formatDate(pedido.f_creacion)}</span>
          </div>
          <div className="mt-2 flex justify-between font-heading text-lg font-bold">
            <span>Total</span>
            <span className="text-accent">{formatCurrency(pedido.total)}</span>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
