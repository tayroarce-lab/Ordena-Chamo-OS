import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import type { DailyData } from '@/types/analytics.types';
import { KpiCard } from './shared/KpiCard';
import { Breadcrumbs } from './shared/Breadcrumbs';

interface DailyViewProps {
  data: DailyData;
  onGoToMonthly: () => void;
  onGoToWeek: (weekNumber: number) => void;
}

const CATEGORY_CLASSES: Record<string, { bg: string; text: string }> = {
  'papas':       { bg: 'bg-amber-500/20', text: 'text-amber-500' },
  'tequeños':    { bg: 'bg-orange-500/20', text: 'text-orange-500' },
};
const DEFAULT_CATEGORY_CLASSES = { bg: 'bg-slate-500/20', text: 'text-slate-400' };

export function DailyView({ data, onGoToMonthly, onGoToWeek }: DailyViewProps) {
  const d = new Date(`${data.date}T12:00:00Z`);
  const dayNames = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const dayName = dayNames[d.getUTCDay()] || '';
  const weekNumber = Math.ceil(d.getUTCDate() / 7);

  const breadcrumbs = [
    { label: 'DASHBOARD', onClick: onGoToMonthly },
    { label: `SEMANA ${weekNumber}`, onClick: () => onGoToWeek(weekNumber) },
    { label: `${dayName} ${d.getUTCDate()}` }
  ];

  const chartData = data.hourlyChart.map((hour, idx) => ({
    ...hour,
    hourIndex: idx,
  }));

  const deliveryPercentage = data.totalOrders > 0 ? (data.deliveredOrders / data.totalOrders) * 100 : 0;

  return (
    <div className="overflow-y-auto bg-bg-primary rounded-2xl">
      <div className="max-w-7xl mx-auto pb-10">
        <Breadcrumbs crumbs={breadcrumbs} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Resumen Diario</h1>
          <p className="text-text-muted">{data.date}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Ingresos del Día"
            value={`₡${data.dailyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            badge={{ text: `${data.incomeGrowthPercent > 0 ? '+' : ''}${data.incomeGrowthPercent}% vs Ayer`, color: data.incomeGrowthPercent >= 0 ? 'positive' : 'negative' }}
          />

          <div className="bg-analytics-panel border border-analytics-border rounded-xl p-4 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-text-muted font-medium mb-3">
              Pedidos Totales
            </h3>
            <p className="text-3xl font-bold text-text-primary mb-3">{data.totalOrders}</p>
            <div className="space-y-1">
              <div className="h-2 rounded-full w-full bg-black/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${deliveryPercentage}%` }}
                />
              </div>
              <div className="flex gap-3 text-xs pt-1">
                <span className="text-amber-500 font-medium">● {data.deliveredOrders} Entregados</span>
                <span className="text-slate-400">● {data.pendingOrders} Pendientes</span>
              </div>
            </div>
          </div>

          <KpiCard
            title="Ticket Promedio"
            value={`₡${data.avgTicket.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          />

          <div className="bg-analytics-panel border border-analytics-border rounded-xl p-4 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-text-muted font-medium mb-3">
              Producto Estrella
            </h3>
            <p className="text-2xl font-bold text-amber-500 mb-1">{data.starProduct?.name || '-'}</p>
            <p className="text-sm text-text-muted">{data.starProduct?.unitsSold || 0} vendidos</p>
          </div>
        </div>

        <div className="bg-analytics-panel border border-analytics-border rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
            Distribución de Ventas por Hora
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#94a3b8"
                style={{ fontSize: '11px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'white' }}
                formatter={(value: any) => `₡${value.toLocaleString()}`}
              />
              <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isHighlight ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-analytics-panel border border-analytics-border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
            Productos Vendidos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-analytics-border">
                  <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Producto
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Categoría
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Cantidad
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Precio Unitario
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Total Generado
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.soldProducts.map((product, index) => {
                  const categoryName = product.category?.toLowerCase() || '';
                  const categoryClasses = CATEGORY_CLASSES[categoryName] ?? DEFAULT_CATEGORY_CLASSES;
                  const rowVariants = {
                    hidden: { opacity: 0, y: -10 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.25, ease: 'easeOut' as const, delay: index * 0.05 },
                    },
                  };
                  return (
                    <motion.tr
                      key={product.id}
                      className="border-b border-analytics-border hover:bg-white/5"
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <td className="py-4 px-4 text-text-primary font-medium">{product.name}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${categoryClasses.bg} ${categoryClasses.text}`}
                        >
                          {product.category || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-text-primary">{product.quantity}</td>
                      <td className="py-4 px-4 text-right text-slate-400">
                        ₡{product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right text-amber-500 font-medium">
                        ₡{product.totalGenerated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            
            {data.soldProducts.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No hay productos vendidos este día.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
