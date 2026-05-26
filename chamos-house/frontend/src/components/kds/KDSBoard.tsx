import { RefreshCw, PanelLeft, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConnectionStatus } from '@/components/layout/ConnectionStatus';
import { KDSColumn } from './KDSColumn';
import { useKitchenSocket } from '@/hooks/useKitchenSocket';
import { Sidebar } from '@/components/layout/Sidebar';
import { useUIStore } from '@/store/uiStore';

export function KDSBoard() {
  const { pedidos, isConnected, isLoading, actualizarEstado, refresh } = useKitchenSocket();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const totalActivos =
    pedidos.pendiente.length +
    pedidos.en_proceso.length +
    pedidos.listo.length;

  return (
    <div className="flex h-screen overflow-hidden bg-primary">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex shrink-0 items-center justify-between border-b border-border-subtle bg-surface px-6 py-4">
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
              <h1 className="font-heading text-xl font-bold text-text-primary">
                Cocina — KDS
              </h1>
              <p className="text-sm text-text-secondary">
                {totalActivos} pedidos activos · {pedidos.entregado.length} entregados hoy
              </p>
            </div>
          </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus isConnected={isConnected} />
          <Button variant="outline" size="sm" onClick={() => void refresh()}>
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </header>

      {isLoading ? (
        <div className="grid flex-1 grid-cols-4 gap-4 p-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-full min-h-[400px]" />
          ))}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-4 gap-4 p-4">
          <KDSColumn
            titulo="Pendientes"
            estado="pendiente"
            pedidos={pedidos.pendiente}
            onCambiarEstado={actualizarEstado}
          />
          <KDSColumn
            titulo="En proceso"
            estado="en_proceso"
            pedidos={pedidos.en_proceso}
            onCambiarEstado={actualizarEstado}
          />
          <KDSColumn
            titulo="Listos"
            estado="listo"
            pedidos={pedidos.listo}
            onCambiarEstado={actualizarEstado}
          />
          <KDSColumn
            titulo="Entregados"
            estado="entregado"
            pedidos={pedidos.entregado}
            onCambiarEstado={actualizarEstado}
          />
        </div>
      )}
      </div>
    </div>
  );
}
