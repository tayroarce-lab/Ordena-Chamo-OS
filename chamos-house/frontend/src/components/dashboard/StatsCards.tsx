import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';

interface StatsCardsProps {
  totalIngresos: number;
  totalPedidos: number;
  topProducto?: string;
  pedidosActivos: number;
}

export function StatsCards({
  totalIngresos,
  totalPedidos,
  topProducto,
  pedidosActivos,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Ingresos',
      value: formatCurrency(totalIngresos),
      icon: DollarSign,
      color: 'text-accent',
    },
    {
      label: 'Pedidos entregados',
      value: String(totalPedidos),
      icon: ShoppingBag,
      color: 'text-success',
    },
    {
      label: 'Producto top',
      value: topProducto ?? '—',
      icon: TrendingUp,
      color: 'text-info',
    },
    {
      label: 'Activos hoy',
      value: String(pedidosActivos),
      icon: Package,
      color: 'text-text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">{stat.label}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-text-primary truncate">
                {stat.value}
              </p>
            </div>
            <div className={`rounded-lg bg-elevated p-2.5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
