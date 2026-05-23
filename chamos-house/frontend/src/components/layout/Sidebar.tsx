import { NavLink } from 'react-router-dom';
import {
  ChefHat,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { NAV_ITEMS } from '@/utils/constants';
import { useAuth } from '@/hooks/useAuth';

import { useUIStore } from '@/store/uiStore';

const iconMap = {
  LayoutDashboard,
  ChefHat,
  ClipboardList,
  Package,
  Users,
} as const;

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const { usuario, logout, hasRole } = useAuth();
  const { sidebarOpen } = useUIStore();

  const visibleItems = NAV_ITEMS.filter((item) => hasRole([...item.roles]));

  return (
    <aside
      className={clsx(
        'flex h-full flex-col bg-surface transition-all duration-300 ease-in-out',
        sidebarOpen
          ? 'w-60 border-r border-border-subtle'
          : 'w-0 overflow-hidden border-r-0 opacity-0 pointer-events-none'
      )}
    >
      <div className={clsx('border-b border-border-subtle p-4', collapsed && 'px-2')}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent font-heading text-lg font-bold text-primary">
            CH
          </div>
          {!collapsed && (
            <div>
              <p className="font-heading text-sm font-bold text-text-primary">Chamos House</p>
              <p className="text-xs text-muted capitalize">{usuario?.rol ?? 'staff'}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-secondary hover:bg-elevated hover:text-text-primary',
                  collapsed && 'justify-center px-2',
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle p-3">
        <button
          type="button"
          onClick={logout}
          className={clsx(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger',
            collapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
