import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <Outlet />
      </main>
    </div>
  );
}
