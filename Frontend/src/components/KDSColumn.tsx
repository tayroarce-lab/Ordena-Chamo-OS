import React from 'react';
import { Pedido, EstadoPedido } from '../types/pedido.types';
import { PedidoCard } from './PedidoCard';

interface KDSColumnProps {
  titulo: string;
  estado: EstadoPedido;
  pedidos: Pedido[];
  onCambiarEstado: (id: number, nuevoEstado: EstadoPedido) => void;
}

export const KDSColumn: React.FC<KDSColumnProps> = ({ titulo, estado, pedidos, onCambiarEstado }) => {
  const getHeaderColor = () => {
    switch (estado) {
      case 'pendiente': return 'bg-red-100 text-red-800 border-red-200';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'listo': return 'bg-green-100 text-green-800 border-green-200';
      case 'entregado': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div className={`p-4 border-b ${getHeaderColor()} font-bold flex justify-between items-center`}>
        <h2 className="uppercase text-sm tracking-wider">{titulo}</h2>
        <span className="bg-white px-2 py-1 rounded-full text-xs shadow-sm text-black">
          {pedidos.length}
        </span>
      </div>
      
      <div className="p-4 flex-1 overflow-y-auto">
        {pedidos.length === 0 ? (
          <p className="text-center text-gray-400 italic mt-10">Sin pedidos</p>
        ) : (
          pedidos.map(pedido => (
            <PedidoCard 
              key={pedido.id} 
              pedido={pedido} 
              onCambiarEstado={onCambiarEstado} 
            />
          ))
        )}
      </div>
    </div>
  );
};
