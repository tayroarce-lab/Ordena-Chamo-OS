import type { ReactNode } from 'react';
import { PanelLeft, PanelLeftClose } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function Header({ title, subtitle, actions }: HeaderProps) {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-surface text-text-secondary hover:bg-elevated hover:text-text-primary transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-accent/30"
          title={sidebarOpen ? 'Ocultar barra lateral' : 'Mostrar barra lateral'}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeft className="h-5 w-5" />
          )}
        </button>
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
  );
}

