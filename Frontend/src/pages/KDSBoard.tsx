import React from 'react';
import { useKitchenSocket } from '../hooks/useKitchenSocket';
import { KDSColumn } from '../components/KDSColumn';

export const KDSBoard: React.FC = () => {
  const { pedidos, actualizarEstado, isConnected } = useKitchenSocket();

  return (
    <div className="h-screen flex flex-col bg-gray-200 p-4">
      <header className="mb-4 flex justify-between items-center bg-white p-4 rounded shadow border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">Chamos House - KDS</h1>
        <div className="flex items-center">
          <span className="text-sm font-semibold mr-2 text-gray-600">Estado:</span>
          <div className="flex items-center">
            <span 
              className={`inline-block w-3 h-3 rounded-full mr-2 ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} 
            />
            <span className="text-sm text-gray-500 font-medium">
              {isConnected ? 'Conectado (/cocina)' : 'Desconectado'}
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-4 gap-4 min-h-0">
        <KDSColumn 
          titulo="Pendientes" 
          estado="pendiente" 
          pedidos={pedidos.pendiente} 
          onCambiarEstado={actualizarEstado} 
        />
        <KDSColumn 
          titulo="En Proceso" 
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
    </div>
  );
};
