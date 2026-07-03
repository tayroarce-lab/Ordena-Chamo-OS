import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'Bajo Stock' | 'Saludable' | 'Crítico';
}

/**
 * StatusBadge
 *
 * Usa clases de Tailwind con opacidad (bg-amber-500/15, bg-green-500/15, bg-red-500/15, etc.)
 * para evitar style={{}} con colores rgba. El efecto visual es idéntico.
 */
const STATUS_CLASSES: Record<StatusBadgeProps['status'], string> = {
  'Bajo Stock': 'bg-amber-500/15 border-amber-500/30 text-accent-gold',
  'Saludable':  'bg-green-500/15 border-green-500/30 text-status-green',
  'Crítico':    'bg-red-500/15 border-red-500/30 text-status-red',
};

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

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <motion.span
      className={`inline-block px-2 py-1 rounded text-xs font-semibold border ${STATUS_CLASSES[status]}`}
      variants={pulseVariants}
      animate={status === 'Crítico' ? 'animate' : undefined}
    >
      {status}
    </motion.span>
  );
}
