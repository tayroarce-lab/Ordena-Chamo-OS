import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PedidosTable } from '@/features/orders/components/PedidosTable';
import { PedidoDetailDrawer } from '@/features/orders/components/PedidoDetailDrawer';
import { NuevoPedidoModal } from '@/features/orders/components/NuevoPedidoModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { pedidoService } from '@/features/orders/api/pedidoService';
import type { EstadoPedido, Pedido } from '@/features/orders/types/pedido';
import { ESTADOS_PEDIDO } from '@/utils/constants';
import { formatEstado } from '@/utils/formatters';

export function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNuevoPedido, setShowNuevoPedido] = useState(false);

  const cargarPedidos = async () => {
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

  useEffect(() => {
    void cargarPedidos();
  }, []);

  const filtered = useMemo(() => {
    if (filtroEstado === 'todos') return pedidos;
    return pedidos.filter((p) => p.estado === filtroEstado);
  }, [pedidos, filtroEstado]);

  const handlePedidoCreado = (nuevoPedido: Pedido) => {
    setPedidos((prev) => [nuevoPedido, ...prev]);
  };

  return (
    <div>
      <Header
        title="Pedidos"
        subtitle={`${filtered.length} pedidos`}
        actions={
          <>
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
            <Button
              id="btn-nuevo-pedido"
              onClick={() => setShowNuevoPedido(true)}
              size="md"
            >
              <Plus className="h-4 w-4" />
              Nuevo Pedido
            </Button>
          </>
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

      <NuevoPedidoModal
        isOpen={showNuevoPedido}
        onClose={() => setShowNuevoPedido(false)}
        onCreated={handlePedidoCreado}
      />
    </div>
  );
}
