import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import type { ReporteTopProductoRow } from '@/features/analytics/api/reporteService';

interface TopProductsChartProps {
  data: ReporteTopProductoRow[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
  const chartData = data.slice(0, 8).map((row) => ({
    name: row.nombre.length > 18 ? `${row.nombre.slice(0, 18)}…` : row.nombre,
    vendidos: row.total_vendido,
  }));

  return (
    <Card>
      <CardHeader title="Top productos" subtitle="Por unidades vendidas" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              tick={{ fill: '#9CA3AF', fontSize: 11 }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F1F1F',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                color: '#F5F5F5',
              }}
            />
            <Bar dataKey="vendidos" fill="#3B82F6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
