import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import type { ReporteEstadoOperativoRow } from '@/features/analytics/api/reporteService';
import { formatEstado } from '@/utils/formatters';
import type { EstadoPedido } from '@/features/orders/types/pedido';

interface OperationalChartProps {
  data: ReporteEstadoOperativoRow[];
}

const COLORS: Record<string, string> = {
  pendiente: '#F5A623',
  en_proceso: '#3B82F6',
  listo: '#22C55E',
  entregado: '#6B7280',
};

export function OperationalChart({ data }: OperationalChartProps) {
  const chartData = data.map((row) => ({
    name: formatEstado(row.estado as EstadoPedido),
    value: row.cantidad,
    estado: row.estado,
  }));

  return (
    <Card>
      <CardHeader title="Estado operativo" subtitle="Pedidos de hoy por estado" />
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.estado} fill={COLORS[entry.estado] ?? '#6B7280'} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F1F1F',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                color: '#F5F5F5',
              }}
            />
            <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
