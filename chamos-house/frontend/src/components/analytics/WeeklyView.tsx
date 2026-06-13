import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Brain } from 'lucide-react';
import type { WeeklyData } from '@/types/analytics.types';
import { KpiCard } from './shared/KpiCard';
import { Breadcrumbs } from './shared/Breadcrumbs';

interface WeeklyViewProps {
  data: WeeklyData;
  onDayClick: (dayIndex: number) => void;
  onGoToMonthly: () => void;
  weekNumber: number;
}

const DAY_INDEX_MAP: Record<string, number> = {
  'LUN': 1, 'MAR': 2, 'MIE': 3, 'JUE': 4, 'VIE': 5, 'SAB': 6, 'DOM': 7
};

export function WeeklyView({ data, onDayClick, onGoToMonthly, weekNumber }: WeeklyViewProps) {
  const maxUnits = Math.max(...data.unitsPerProduct.map(p => p.units));
  const chartData = data.dailyChart.map((day, idx) => ({
    ...day,
    dayIndex: idx,
  }));

  const handleDayClick = (dayIndex: number) => {
    const dayAbbr = data.dailyChart[dayIndex]?.day;
    // DAY_INDEX_MAP puede retornar undefined si la clave no existe — el ?? garantiza que siempre sea number
    const dayNumber = (dayAbbr ? DAY_INDEX_MAP[dayAbbr] : undefined) ?? dayIndex + 1;
    onDayClick(dayNumber);
  };

  const breadcrumbs = [
    { label: 'DASHBOARD', onClick: onGoToMonthly },
    { label: 'JULIO' },
    { label: `DETALLE SEMANA ${weekNumber}` }
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-bg-primary p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumbs crumbs={breadcrumbs} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Resumen de la Semana</h1>
          <p className="text-text-muted">{data.dateRange}</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <KpiCard
            title="Ingresos Semana"
            value={`$${data.weeklyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            badge={{ text: `+${data.incomeGrowthPercent}%`, color: 'positive' }}
          />
          <KpiCard
            title="Pico de Ventas"
            value={data.peakDay}
            footer={data.peakTime}
          />
          <div className="bg-bg-card border border-border rounded-xl p-4">
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
                          ? 'bg-accent-gold text-bg-primary'
                          : product.rank === 2
                            ? 'bg-gray-600 text-text-primary'
                            : 'bg-amber-900 text-text-primary'
                      }`}
                    >
                      #{product.rank}
                    </span>
                    <span className="text-text-primary text-sm">{product.name}</span>
                  </div>
                  <span className="text-accent-gold font-semibold text-sm">{product.units}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid: Chart + Side Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Performance Chart */}
          <div className="lg:col-span-2 bg-bg-card border border-border rounded-xl p-6">
            <h3 className="text-sm uppercase tracking-widest text-text-muted font-semibold mb-6">
              Rendimiento Diario
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
                {/* style en XAxis es API de recharts — no reemplazable con Tailwind */}
                <XAxis dataKey="day" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                {/* contentStyle / labelStyle son props de recharts — no reemplazables con Tailwind */}
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
                  dataKey="income"
                  radius={[8, 8, 0, 0]}
                  onClick={(data) => handleDayClick(data.dayIndex)}
                  className="cursor-pointer"
                >
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

          {/* Right Panel: Units & Prediction */}
          <div className="flex flex-col gap-6">
            {/* Unidades Vendidas */}
            <div className="bg-bg-card border border-border rounded-xl p-6">
              <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
                Unidades Vendidas
              </h4>
              <div className="space-y-3">
                {data.unitsPerProduct.map((product, idx) => {
                  const percentage = (product.units / maxUnits) * 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">{product.name}</span>
                        <span className="text-accent-gold font-semibold">{product.units}</span>
                      </div>
                      <div className="w-full bg-border rounded-full h-1.5">
                        <div
                          className="bg-accent-gold h-1.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button className="mt-4 text-xs text-accent-gold uppercase tracking-widest font-semibold hover:text-accent-gold-2 transition-colors">
                VER CATÁLOGO COMPLETO →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row: Time + Rating + Prediction */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
              Tiempo Promedio
            </h4>
            <p className="text-3xl font-bold text-accent-gold">{data.avgPrepMinutes} min</p>
            <p className="text-sm text-text-muted mt-2">Preparación promedio</p>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6">
            <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-4">
              Customer Rating
            </h4>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-accent-gold">{data.customerRating}</p>
              <span className="text-yellow-400">⭐</span>
            </div>
            <p className="text-sm text-text-muted mt-2">Calificación promedio</p>
          </div>

          <div className="bg-bg-card border border-border rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-accent-gold opacity-30">
              <Brain className="w-12 h-12" />
            </div>
            <h4 className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">
              Predicción Semanal
            </h4>
            <p className="text-sm text-text-primary leading-relaxed pr-12">
              {data.weeklyPredictionText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
