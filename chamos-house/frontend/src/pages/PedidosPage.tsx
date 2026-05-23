import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Download } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { PedidosTable } from '@/components/pedidos/PedidosTable';
import { PedidoDetailDrawer } from '@/components/pedidos/PedidoDetailDrawer';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { pedidoService } from '@/services/pedidoService';
import type { EstadoPedido, MetodoPago, Pedido } from '@/types/pedido';
import { ESTADOS_PEDIDO, METODOS_PAGO } from '@/utils/constants';
import { downloadCsv } from '@/utils/exportCsv';
import { formatCurrency, formatEstado, formatMetodoPago } from '@/utils/formatters';

export function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todos'>('todos');
  const [filtroMetodo, setFiltroMetodo] = useState<MetodoPago | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [selected, setSelected] = useState<Pedido | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const { pedidos: lista } = await pedidoService.getAll({
          limit: 200,
          startDate: fechaDesde || undefined,
          endDate: fechaHasta || undefined,
        });
        setPedidos(lista);
      } catch {
        setPedidos([]);
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [fechaDesde, fechaHasta]);

  const filtered = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return pedidos.filter((p) => {
      if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
      if (filtroMetodo !== 'todos' && p.metodo_pago !== filtroMetodo) return false;
      if (!q) return true;
      const nombre = p.usuario.nombre?.toLowerCase() ?? '';
      const tel = p.usuario.telefono;
      const id = String(p.id);
      return nombre.includes(q) || tel.includes(q) || id.includes(q);
    });
  }, [pedidos, filtroEstado, filtroMetodo, busqueda]);

  const exportCsv = () => {
    downloadCsv(
      `pedidos-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Cliente', 'Teléfono', 'Estado', 'Método pago', 'Total', 'Fecha'],
      filtered.map((p) => [
        String(p.id),
        p.usuario.nombre ?? '',
        p.usuario.telefono,
        formatEstado(p.estado),
        formatMetodoPago(p.metodo_pago),
        formatCurrency(p.total),
        p.f_creacion,
      ]),
    );
  };

  return (
    <div>
      <Header
        title="Historial de pedidos"
        subtitle={`${filtered.length} pedidos`}
        actions={
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Buscar"
          placeholder="ID, nombre o teléfono"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Estado</label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoPedido | 'todos')}
            className="w-full rounded-lg border border-border-subtle bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="todos">Todos</option>
            {ESTADOS_PEDIDO.map((e) => (
              <option key={e} value={e}>
                {formatEstado(e)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Método de pago</label>
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value as MetodoPago | 'todos')}
            className="w-full rounded-lg border border-border-subtle bg-elevated px-3 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none"
          >
            <option value="todos">Todos</option>
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {formatMetodoPago(m)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Desde"
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
          />
          <Input
            label="Hasta"
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Sin pedidos"
          description="No hay pedidos que coincidan con los filtros."
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
