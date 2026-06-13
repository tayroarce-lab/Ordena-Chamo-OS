import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { MonthlyData } from '@/types/analytics.types';
import { KpiCard } from './shared/KpiCard';
import { GoldBadge } from './shared/GoldBadge';
import { motion } from 'framer-motion';

interface MonthlyViewProps {
  data: MonthlyData;
  onWeekClick: (weekIndex: number) => void;
}

const ITEMS_PER_PAGE = 5;

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

  const filteredProducts = useMemo(
    () =>
      data.productBreakdown.filter((item) =>
        item.name.toLowerCase().includes(searchFilter.toLowerCase())
      ),
    [data.productBreakdown, searchFilter]
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const chartData = data.weeklyChart.map((week, idx) => ({
    ...week,
    weekIndex: idx,
  }));

  const handleWeekClick = (weekIndex: number) => {
    onWeekClick(weekIndex + 1); // 1-indexed
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <motion.div
      className="overflow-y-auto bg-bg-primary rounded-2xl"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Análisis Mensual</h1>
          <p className="text-text-muted mb-4">Resumen de operaciones para {data.period}</p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" variants={itemVariants}>
          <motion.div variants={itemVariants}>
            <KpiCard
              title="Ingresos del Mes"
              value={`₡${data.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              badge={{ text: `${data.incomeGrowthPercent > 0 ? '+' : ''}${data.incomeGrowthPercent}%`, color: data.incomeGrowthPercent >= 0 ? 'positive' : 'negative' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard
              title="Recaudación YTD"
              value={`₡${data.ytdRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              badge={{ text: 'Acumulado', color: 'neutral' }}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard
              title="Órdenes Totales"
              value={data.totalOrders.toString()}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <KpiCard
              title="Producto Estrella"
              value={data.starProduct?.name || '-'}
              footer={data.starProduct ? `${data.starProduct.unitsSold} unidades vendidas` : ''}
            />
          </motion.div>
        </motion.div>

        {/* Weekly Chart + Cards Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart */}
          <div className="lg:col-span-2 bg-analytics-panel border border-analytics-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
              Ventas por Semana
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: 'white' }}
                  formatter={(value: any) => `₡${value.toLocaleString()}`}
                />
                <Bar
                  dataKey="real"
                  fill="#f59e0b"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleWeekClick(data.weekIndex)}
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right Side Cards */}
          <div className="flex flex-col gap-6">
            {/* Día Récord */}
            {data.recordDay && (
              <div className="bg-analytics-panel border border-analytics-border rounded-xl p-4 shadow-sm">
                <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">
                  Día Récord
                </h4>
                <p className="text-2xl font-bold text-amber-500 mb-1">{data.recordDay.dayName} {data.recordDay.date}</p>
                <p className="text-lg font-semibold text-text-primary">
                  ₡{data.recordDay.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            )}

            {/* Mejor Semana */}
            {data.bestWeek && (
              <div className="bg-analytics-panel border border-analytics-border rounded-xl p-4 shadow-sm">
                <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">
                  Mejor Semana
                </h4>
                <p className="text-2xl font-bold text-amber-500 mb-1">Semana {data.bestWeek.weekNumber}</p>
                <GoldBadge text={`+${data.bestWeek.percentVsAvg}% vs avg`} variant="positive" />
              </div>
            )}
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="bg-analytics-panel border border-analytics-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold">
              Desglose por Producto
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
                className="pl-10 pr-3 py-2 bg-bg-primary border border-analytics-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

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
                    Unidades Vendidas
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-text-muted uppercase text-xs tracking-widest">
                    Ingresos Generados
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    className="border-b border-analytics-border hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-4 text-text-primary font-medium">{item.name}</td>
                    <td className="py-4 px-4 text-slate-400 capitalize">{item.category || '-'}</td>
                    <td className="py-4 px-4 text-right text-text-primary">{item.quantitySold}</td>
                    <td className="py-4 px-4 text-right text-amber-500 font-medium">
                      ₡{item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {paginatedProducts.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                No se encontraron productos en este período.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-analytics-border">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-text-muted hover:text-amber-500 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded transition-colors text-sm ${
                    page === currentPage
                      ? 'bg-amber-500 text-black font-semibold'
                      : 'text-text-muted hover:text-amber-500'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-text-muted hover:text-amber-500 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
