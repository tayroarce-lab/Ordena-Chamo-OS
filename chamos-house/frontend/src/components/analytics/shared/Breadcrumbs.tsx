import type { BreadcrumbItem } from '@/types/analytics.types';

interface BreadcrumbsProps {
  crumbs: BreadcrumbItem[];
}

export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
      {crumbs.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {idx > 0 && <span className="text-accent-gold">›</span>}
          {crumb.onClick ? (
            <button
              onClick={crumb.onClick}
              className="text-text-muted hover:text-accent-gold transition-colors cursor-pointer"
            >
              {crumb.label}
            </button>
          ) : (
            <span
              className={
                idx === crumbs.length - 1
                  ? 'text-text-primary font-semibold'
                  : ''
              }
            >
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
