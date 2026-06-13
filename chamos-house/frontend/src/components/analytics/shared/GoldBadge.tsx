interface GoldBadgeProps {
  text: string;
  variant?: 'positive' | 'neutral' | 'warning';
}

/**
 * GoldBadge
 *
 * Usa clases de Tailwind con opacidad (bg-amber-500/15, border-amber-500/30, etc.)
 * para evitar style={{}} con colores rgba. Mapeo de variantes:
 * - positive → dorado/ámbar (accent-gold)
 * - neutral  → gris
 * - warning  → rojo
 */
const VARIANT_CLASSES: Record<
  NonNullable<GoldBadgeProps['variant']>,
  string
> = {
  positive: 'bg-amber-500/15 border-amber-500/30 text-accent-gold',
  neutral:  'bg-gray-400/15 border-gray-400/30 text-text-muted',
  warning:  'bg-red-500/15 border-red-500/30 text-red-400',
};

export function GoldBadge({ text, variant = 'positive' }: GoldBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${VARIANT_CLASSES[variant]}`}
    >
      {text}
    </span>
  );
}
