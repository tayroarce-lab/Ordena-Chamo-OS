import { useEffect, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PedidosTable } from '@/components/pedidos/PedidosTable';
import { PedidoDetailDrawer } from '@/components/pedidos/PedidoDetailDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { pedidoService } from '@/services/pedidoService';
import type { EstadoPedido, Pedido } from '@/types/pedido';
import { ESTADOS_PEDIDO } from '@/utils/constants';
import { formatEstado } from '@/utils/formatters';

export function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { pedidos: lista } = await pedidoService.getAll({ limit: 100 });
        setPedidos(lista);
      } catch {
        setPedidos([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const filtered = useMemo(() => {
    if (filtroEstado === 'todos') return pedidos;
    return pedidos.filter((p) => p.estado === filtroEstado);
  }, [pedidos, filtroEstado]);

  return (
    <div>
      <Header
        title="Pedidos"
        subtitle={`${filtered.length} pedidos`}
        actions={
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | 'todos')}
            className="rounded-lg border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="todos">Todos los estados</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e} value={e}>
                {formatEstado(e)}
              </option>
            ))}
          </select>
        }
      />

      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin pedidos"
          description="No hay pedidos que coincidan con el filtro seleccionado."
        />
      ) : (
        <PedidosTable pedidos={filtered} onView={setSelected} />
      )}

      <PedidoDetailDrawer
        pedido={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
