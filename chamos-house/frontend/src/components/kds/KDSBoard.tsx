import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ConnectionStatus } from '@/components/layout/ConnectionStatus';
import { KDSColumn } from './KDSColumn';
import { useKitchenSocket } from '@/hooks/useKitchenSocket';

export function KDSBoard() {
  const { pedidos, isConnected, isLoading, actualizarEstado, refresh } = useKitchenSocket();

  const totalActivos =
    pedidos.pendiente.length +
    pedidos.en_proceso.length +
    pedidos.listo.length;

  return (
    <div className="flex h-screen flex-col bg-primary">
      <header className="flex shrink-0 items-center justify-between border-b border-border-subtle bg-surface px-6 py-4">
        <div>
          <h1 className="font-heading text-xl font-bold text-text-primary">
            Cocina — KDS
          </h1>
          <p className="text-sm text-text-secondary">
            {totalActivos} pedidos activos · {pedidos.entregado.length} entregados hoy
          </p>
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
  );
}
