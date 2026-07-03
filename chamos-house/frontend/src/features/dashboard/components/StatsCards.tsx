import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatsCardsProps {
  totalIngresos: number;
  totalPedidos: number;
  topProducto?: string;
  pedidosActivos: number;
}

function AnimatedCounter({ value }: { value: number }) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 750;

    function step(timestamp: number) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const progressRatio = Math.min(progress / duration, 1);
      setCurrentValue(Math.floor(value * progressRatio));
      if (progress < duration) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }, [value]);

  return <>{currentValue.toLocaleString('es-CR', { style: 'currency', currency: 'CRC' })}</>;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

return (
    <motion.div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {stats.map((stat) => (
        <motion.div key={stat.label} variants={cardVariants} whileHover={{ scale: 1.015, boxShadow: '0 4px 10px rgba(0,0,0,0.12)' }}>
          <Card hover>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-text-secondary">{stat.label}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-text-primary truncate">
                  {stat.label === 'Ingresos' ? <AnimatedCounter value={parseInt(stat.value.replace(/[^0-9]/g, ''))} /> : stat.value}
                </p>
              </div>
              <div className={`rounded-lg bg-elevated p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
