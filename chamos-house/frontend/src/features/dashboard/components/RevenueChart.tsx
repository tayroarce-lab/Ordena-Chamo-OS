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
import type { ReporteFinancieroRow } from '@/features/analytics/api/reporteService';
import { formatCurrency, formatMetodoPago } from '@/utils/formatters';
import type { MetodoPago } from '@/features/orders/types/pedido';

interface RevenueChartProps {
  data: ReporteFinancieroRow[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((row) => ({
    name: formatMetodoPago(row.metodo_pago as MetodoPago),
    ingresos: row.ingresos,
    pedidos: row.total_pedidos,
  }));

  return (
    <Card>
      <CardHeader title="Ingresos por método de pago" subtitle="Solo pedidos entregados" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} />
            <YAxis
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              axisLine={false}
              tickFormatter={(v: number) => `₡${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F1F1F',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                color: '#F5F5F5',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Ingresos']}
            />
            <Bar dataKey="ingresos" fill="#F5A623" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
