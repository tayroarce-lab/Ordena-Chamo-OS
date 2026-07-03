import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { WeeklyData } from '@/features/analytics/types/analytics.types';
import { KpiCard } from './shared/KpiCard';
import { Breadcrumbs } from './shared/Breadcrumbs';

interface WeeklyViewProps {
  data: WeeklyData;
  onDayClick: (dayIndex: number) => void;
  onGoToMonthly: () => void;
  weekNumber: number;
}

export function WeeklyView({ data, onDayClick, onGoToMonthly, weekNumber }: WeeklyViewProps) {
  const maxUnits = Math.max(...data.unitsPerProduct.map(p => p.units), 1);
  const chartData = data.dailyChart.map((day, idx) => ({
    ...day,
    dayIndex: idx,
  }));

  const handleDayClick = (dayIndex: number) => {
    // We approximate the click. Realistically we should use dates.
    onDayClick(dayIndex + 1);
  };

  const breadcrumbs = [
    { label: 'DASHBOARD', onClick: onGoToMonthly },
    { label: `DETALLE SEMANA ${weekNumber}` }
  ];

  return (
    <div className="overflow-y-auto bg-bg-primary rounded-2xl">
      <div className="max-w-7xl mx-auto pb-10">
        <Breadcrumbs crumbs={breadcrumbs} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">{data.weekLabel}</h1>
          <p className="text-text-muted">{data.dateRange}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard
            title="Ingresos Semana"
            value={`₡${data.weeklyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            badge={{ text: `${data.incomeGrowthPercent > 0 ? '+' : ''}${data.incomeGrowthPercent}%`, color: data.incomeGrowthPercent >= 0 ? 'positive' : 'negative' }}
          />
          <KpiCard
            title="Total Órdenes"
            value={data.totalOrders.toString()}
          />
          <KpiCard
            title="Día Pico"
            value={data.peakDay || '-'}
          />
          <div className="bg-analytics-panel border border-analytics-border rounded-xl p-4 shadow-sm">
            <h3 className="text-xs uppercase tracking-widest text-text-muted font-medium mb-4">
              Top 3 Productos
            </h3>
            <div className="space-y-2">
              {data.top3Products.map((product) => (
                <div key={product.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        product.rank === 1
                          ? 'bg-amber-500 text-black'
                          : product.rank === 2
                            ? 'bg-slate-400 text-black'
                            : 'bg-amber-900 text-white'
                      }`}
                    >
                      #{product.rank}
                    </span>
                    <span className="text-text-primary text-sm font-medium">{product.name}</span>
                  </div>
                  <span className="text-amber-500 font-semibold text-sm">{product.units}</span>
                </div>
              ))}
              {data.top3Products.length === 0 && <span className="text-sm text-slate-500">Sin datos</span>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Performance Chart */}
          <div className="lg:col-span-2 bg-analytics-panel border border-analytics-border rounded-xl p-6 shadow-sm">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
              Rendimiento Diario
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '12px' }} />
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
                  dataKey="income"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleDayClick(data.dayIndex)}
                  className="cursor-pointer"
                >
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

          {/* Right Panel: Units & Prediction */}
          <div className="flex flex-col gap-6">
            <div className="bg-analytics-panel border border-analytics-border rounded-xl p-6 shadow-sm">
              <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
                Unidades Vendidas
              </h4>
              <div className="space-y-4">
                {data.unitsPerProduct.slice(0, 5).map((product, idx) => {
                  const percentage = (product.units / maxUnits) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted font-medium">{product.name}</span>
                        <span className="text-amber-500 font-semibold">{product.units}</span>
                      </div>
                      <div className="w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {data.unitsPerProduct.length === 0 && <p className="text-sm text-slate-500">Sin datos</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
