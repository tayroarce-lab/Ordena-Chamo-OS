import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, MoreVertical, Search } from 'lucide-react';
import type { MonthlyData } from '@/types/analytics.types';
import { KpiCard } from './shared/KpiCard';
import { GoldBadge } from './shared/GoldBadge';
import { StatusBadge } from './shared/StatusBadge';
import { motion } from 'framer-motion';

interface MonthlyViewProps {
  data: MonthlyData;
  onWeekClick: (weekIndex: number) => void;
}

const ITEMS_PER_PAGE = 4;

const sectionVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export function MonthlyView({ data, onWeekClick }: MonthlyViewProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredStock = useMemo(
    () =>
      data.stockTable.filter((item) =>
        item.name.toLowerCase().includes(searchFilter.toLowerCase())
      ),
    [data.stockTable, searchFilter]
  );

  const paginatedStock = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStock.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStock, currentPage]);

  const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);

  const chartData = data.weeklyChart.map((week, idx) => ({
    ...week,
    weekIndex: idx,
  }));

  const handleWeekClick = (weekIndex: number) => {
    onWeekClick(weekIndex + 1); // Convert 0-indexed to 1-indexed
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <motion.div
      className="min-h-screen overflow-y-auto bg-bg-primary p-6"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Análisis Mensual</h1>
          <p className="text-text-muted mb-4">Resumen de operaciones para {data.period}</p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8" variants={itemVariants}>
          <motion.div variants={itemVariants}>
            <KpiCard
              title="Ingresos del Mes"
              value={`$${data.monthlyIncome.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              badge={{ text: `+${data.incomeGrowthPercent}%`, color: 'positive' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard
              title="Recaudación Acumulada"
              value={`$${data.ytdRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              badge={{ text: 'YTD 2025', color: 'neutral' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard
              title="Producto Estrella"
              value={data.starProduct.name}
              footer={`${data.starProduct.unitsSold} unidades vendidas`}
            />
          </motion.div>
        </motion.div>

        {/* Weekly Chart + Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
              Ventas por Semana
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value: any) => `$${value.toLocaleString()}`}
                />
                <Bar
                  dataKey="real"
                  fill="var(--accent-gold)"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleWeekClick(data.weekIndex)}
                  style={{ cursor: 'pointer' }}
                />
                <Bar
                  dataKey="projected"
                  fill="#4b3a1f"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleWeekClick(data.weekIndex)}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-accent-gold" />
                <span className="text-text-muted">Real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#4b3a1f' }} />
                <span className="text-text-muted">Proyectado</span>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="flex flex-col gap-6">
            {/* Día Récord */}
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">
                Día Récord
              </h4>
              <p className="text-2xl font-bold text-accent-gold mb-1">{data.recordDay.dayName} {data.recordDay.date}</p>
              <p className="text-lg font-semibold text-text-primary">
                ${data.recordDay.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Mejor Semana */}
            <div className="bg-bg-card border border-border rounded-xl p-4">
              <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">
                Mejor Semana
              </h4>
              <p className="text-2xl font-bold text-accent-gold mb-1">Semana {data.bestWeek.weekNumber}</p>
              <GoldBadge text={`+${data.bestWeek.percentVsAvg}% vs avg`} variant="positive" />
            </div>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-bg-card border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold">
              Rendimiento y Stock
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Filtrar productos..."
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-3 py-2 bg-bg-primary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Producto
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Vendidos Este Mes
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Stock Disponible
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Estado
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody>
{paginatedStock.map((item, index) => (
                   <motion.tr
                     key={item.id}
                     custom={index}
                     initial="hidden"
                     animate="visible"
                     variants={itemVariants}
                     className={`border-b border-border hover:bg-bg-card-alt/50 transition-colors ${
                       item.status === 'Crítico' ? 'border-l-2 border-l-status-red' : ''
                     }`}
                   >
                     <td className="py-4 px-4 text-text-primary">
                       <div className="flex items-center gap-2">
                         <span className="text-xl">{item.emoji}</span>
                         {item.name}
                       </div>
                     </td>
                     <td className="py-4 px-4 text-right text-text-primary">{item.unitsSoldMonth}</td>
                     <td className="py-4 px-4 text-right text-text-primary">{item.stockAvailable}</td>
                     <td className="py-4 px-4 text-center">
                       <StatusBadge status={item.status} />
                     </td>
                     <td className="py-4 px-4 text-center">
                       <div className="relative inline-block">
                         <button
                           onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                           className="p-1 hover:bg-bg-primary rounded transition-colors"
                         >
                           <MoreVertical className="w-4 h-4 text-text-muted" />
                         </button>
                         {openMenuId === item.id && (
                           <div className="absolute right-0 mt-1 bg-bg-primary border border-border rounded-lg shadow-lg z-10 min-w-max">
                             <button className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-card">
                               Ver detalle
                             </button>
                             <button className="block w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-bg-card">
                               Editar
                             </button>
                             <button className="block w-full text-left px-4 py-2 text-sm text-status-red hover:bg-bg-card">
                               Alertar
                             </button>
                           </div>
                         )}
                       </div>
                     </td>
                   </motion.tr>
                 ))}
</tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-text-muted hover:text-accent-gold disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded transition-colors text-sm ${
                    page === currentPage
                      ? 'bg-accent-gold text-bg-primary font-semibold'
                      : 'text-text-muted hover:text-accent-gold'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-text-muted hover:text-accent-gold disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
              Estado de Cocina
            </h4>
            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-sm text-text-muted">Capacidad</span>
                <span className="text-2xl font-bold text-accent-gold">
                  {data.kitchenStatus.capacityPercent}%
                </span>
              </div>
              <div className="w-full bg-bg-primary rounded-full h-2">
                <div
                  className="bg-accent-gold h-2 rounded-full"
                  style={{
                    width: `${data.kitchenStatus.capacityPercent}%`,
                  }}
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                {data.kitchenStatus.isActive ? '✓ Activa' : '✗ Inactiva'}
              </p>
            </div>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
              Tiempo Promedio
            </h4>
            <p className="text-3xl font-bold text-accent-gold mb-2">{data.avgPrepMinutes} min</p>
            <p
              className={`text-sm ${
                data.prepDeltaMinutes < 0 ? 'text-status-green' : 'text-status-red'
              }`}
            >
              {data.prepDeltaMinutes < 0 ? '↓' : '↑'} {Math.abs(data.prepDeltaMinutes)} min vs mes anterior
            </p>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
              Alertas de Stock
            </h4>
            <div className="space-y-2">
              {data.stockAlerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                >
                  <span className="text-text-muted">{alert.name}</span>
                  <GoldBadge text={alert.level} variant={
                    alert.level === 'Bajo' ? 'positive' :
                    alert.level === 'Medio' ? 'neutral' : 'warning'
                  } />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
