import clsx from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'accent' | 'success' | 'danger' | 'info' | 'warning';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-elevated text-text-secondary border-border-subtle',
  accent: 'bg-accent/15 text-accent border-accent/30',
  success: 'bg-success/15 text-success border-success/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  info: 'bg-info/15 text-info border-info/30',
  warning: 'bg-accent/15 text-accent border-accent/30',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
