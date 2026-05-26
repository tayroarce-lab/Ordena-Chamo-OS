import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopProductsChart } from '@/components/dashboard/TopProductsChart';
import { OperationalChart } from '@/components/dashboard/OperationalChart';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { reporteService, type ReporteResponse } from '@/services/reporteService';
import { PERIODOS_REPORTE, type PeriodoReporte } from '@/utils/constants';
import { toDateInputValue } from '@/utils/formatters';

export function DashboardPage() {
  const [reporte, setReporte] = useState<ReporteResponse | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoReporte>('dia');
  const [fecha, setFecha] = useState(toDateInputValue());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await reporteService.obtener(periodo, fecha);
        setReporte(data);
      } catch {
        setError('No se pudieron cargar los reportes');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [periodo, fecha]);

  const pedidosActivos =
    reporte?.estado_operativo
      .filter((e) => e.estado !== 'entregado')
      .reduce((acc, e) => acc + e.cantidad, 0) ?? 0;

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Métricas y reportes del negocio"
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value as PeriodoReporte)}
              className="rounded-lg border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            >
              {PERIODOS_REPORTE.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="rounded-lg border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
        }
      />

      {error && (
        <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : reporte ? (
        <>
          <StatsCards
            totalIngresos={reporte.resumen_financiero.total_ingresos}
            totalPedidos={reporte.resumen_financiero.total_pedidos}
            topProducto={reporte.top_productos[0]?.nombre}
            pedidosActivos={pedidosActivos}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <RevenueChart data={reporte.resumen_financiero.por_metodo} />
            <TopProductsChart data={reporte.top_productos} />
          </div>
          <div className="mt-6">
            <OperationalChart data={reporte.estado_operativo} />
          </div>
        </>
      ) : null}
    </div>
  );
}
