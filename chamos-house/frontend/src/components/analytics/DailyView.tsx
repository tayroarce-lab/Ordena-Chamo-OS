import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DailyData } from '@/types/analytics.types';
import { KpiCard } from './shared/KpiCard';
import { Breadcrumbs } from './shared/Breadcrumbs';

interface DailyViewProps {
  data: DailyData;
  onGoToMonthly: () => void;
  onGoToWeek: (weekNumber: number) => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  'Burgers': { bg: '#7f1d1d', text: '#fca5a5' },
  'Acompañantes': { bg: '#14532d', text: '#86efac' },
  'Bebidas': { bg: '#1e3a5f', text: '#93c5fd' },
  'Combos': { bg: '#431407', text: '#fdba74' },
};

export function DailyView({ data, onGoToMonthly, onGoToWeek }: DailyViewProps) {
  const breadcrumbs = [
    { label: 'DASHBOARD', onClick: onGoToMonthly },
    { label: 'JULIO' },
    { label: 'SEMANA 02', onClick: () => onGoToWeek(2) },
    { label: `VIERNES ${data.date.split(' ')[1]}` }
  ];

  const chartData = data.hourlyChart.map((hour, idx) => ({
    ...hour,
    hourIndex: idx,
  }));

  const deliveryPercentage = (data.deliveredOrders / data.totalOrders) * 100;
  const cancelPercentage = (data.canceledOrders / data.totalOrders) * 100;

  return (
    <div className="min-h-screen overflow-y-auto bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs crumbs={breadcrumbs} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Resumen Diario</h1>
          <p className="text-text-muted">Análisis detallado de operaciones por día</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Ingresos del Día"
            value={`$${data.dailyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            badge={{ text: `+${data.incomeGrowthPercent}%`, color: 'positive' }}
          />
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-widest text-text-muted font-medium mb-3">
              Pedidos Total
            </h3>
            <p className="text-3xl font-bold text-text-primary mb-3">{data.totalOrders}</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 rounded-full flex-1"
                  style={{
                    backgroundColor: '#3d4575',
                    width: '100%',
                  }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: '#3b82f6',
                      width: `${deliveryPercentage}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-blue-400">● {data.deliveredOrders} Entregados</span>
                <span className="text-red-400">● {data.canceledOrders} Cancelados</span>
              </div>
            </div>
          </div>
          <KpiCard
            title="Ticket Promedio"
            value={`$${data.avgTicket.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          />
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-widest text-text-muted font-medium mb-3">
              Producto Estrella
            </h3>
            <p className="text-2xl font-bold text-accent-gold mb-1">{data.starProduct.name}</p>
            <p className="text-sm text-text-muted">{data.starProduct.unitsSold} vendidos</p>
          </div>
        </div>

        {/* Hourly Distribution Chart */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
            Distribución de Ventas por Hora
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="var(--text-muted)"
                style={{ fontSize: '11px' }}
                tick={(props: any) => {
                  const hours = ['08:00', '12:00', '16:00', '20:00', '00:00'];
                  if (hours.includes(props.value)) {
                    return (
                      <text x={props.x} y={props.y} textAnchor="middle" fill="var(--text-muted)">
                        {props.value}
                      </text>
                    );
                  }
                  return null;
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
                formatter={(value: any) => `$${value.toLocaleString()}`}
              />
              <Bar dataKey="income" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isHighlight ? 'var(--accent-gold)' : '#5c3d0a'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Products Table */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
            Productos Vendidos
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
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
import { motion } from 'framer-motion';

{data.soldProducts.map((product, index) => {
                   const categoryStyle = CATEGORY_STYLES[product.category];
                   const rowVariants = {
                     hidden: { opacity: 0, y: -10 },
                     visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut', delay: index * 0.05 } },
                   };
                   return (
                     <motion.tr
                       key={product.id}
                       className="border-b border-border hover:bg-bg-card-alt/50"
                       variants={rowVariants}
                       initial="hidden"
                       animate="visible"
                       whileHover={{ scale: 1.015, boxShadow: '0 4px 8px rgba(0,0,0,0.08)' }}
                       transition={{ type: 'spring', stiffness: 100, damping: 14 }}
                     >
                       <td className="py-4 px-4 text-text-primary">
                         {product.name}
                       </td>
                       <td className="py-4 px-4">
                         <span
                           style={{
                             backgroundColor: categoryStyle.bg,
                             color: categoryStyle.text,
                           }}
                           className="inline-block px-2 py-1 rounded text-xs font-semibold"
                         >
                           {product.category}
                         </span>
                       </td>
                       <td className="py-4 px-4 text-right text-text-primary">
                         {product.quantity}
                       </td>
                      <td className="py-4 px-4 text-right text-text-muted">
                        ${product.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right text-accent-gold font-semibold">
                        ${product.totalGenerated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
</motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-text-muted text-center">
              REPORTE GENERADO AUTOMÁTICAMENTE · ÚLTIMA SINCRONIZACIÓN HACE 1 MIN
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
