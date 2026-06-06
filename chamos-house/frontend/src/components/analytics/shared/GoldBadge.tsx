interface GoldBadgeProps {
  text: string;
  variant?: 'positive' | 'neutral' | 'warning';
}

export function GoldBadge({ text, variant = 'positive' }: GoldBadgeProps) {
  const variants = {
    positive: {
      bg: 'rgba(245,158,11,0.15)',
      border: 'rgba(245,158,11,0.3)',
      text: 'text-accent-gold',
    },
    neutral: {
      bg: 'rgba(156, 163, 175, 0.15)',
      border: 'rgba(156, 163, 175, 0.3)',
      text: 'text-text-muted',
    },
    warning: {
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.3)',
      text: 'text-red-400',
    },
  };

  const variantStyle = variants[variant];

  return (
    <span
      style={{
        backgroundColor: variantStyle.bg,
        borderColor: variantStyle.border,
      }}
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${variantStyle.text}`}
    >
      {text}
    </span>
  );
}
