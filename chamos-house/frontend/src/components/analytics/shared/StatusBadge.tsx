import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'Bajo Stock' | 'Saludable' | 'Crítico';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusStyles = {
    'Bajo Stock': {
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
      text: 'text-accent-gold',
    },
    Saludable: {
      bg: 'rgba(34, 197, 94, 0.15)',
      border: 'rgba(34, 197, 94, 0.3)',
      text: 'text-status-green',
    },
    Crítico: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: 'text-status-red',
    },
  };

  const style = statusStyles[status];

  const pulseVariants = {
    animate: {
      opacity: [1, 0.6, 1],
      scale: [1, 1.02, 1],
      transition: {
        duration: 2,
        ease: 'easeInOut' as const,
        repeat: Infinity,
      },
    },
  };

  return (
    <motion.span
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
      className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${style.text}`}
      variants={pulseVariants}
      animate={status === 'Crítico' ? 'animate' : undefined}
    >
      {status}
    </motion.span>
  );
}


