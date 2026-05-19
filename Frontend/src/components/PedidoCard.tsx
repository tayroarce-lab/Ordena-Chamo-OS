import React from 'react';
import { Pedido, EstadoPedido, TRANSICIONES_ESTADO } from '../types/pedido.types';
import { useTickingTime } from '../hooks/useTickingTime';

interface PedidoCardProps {
  pedido: Pedido;
  onCambiarEstado: (id: number, nuevoEstado: EstadoPedido) => void;
}

export const PedidoCard: React.FC<PedidoCardProps> = ({ pedido, onCambiarEstado }) => {
  const tiempo = useTickingTime(pedido.f_creacion);
  const siguienteEstado = TRANSICIONES_ESTADO[pedido.estado];

  const getBorderColor = () => {
    switch (pedido.estado) {
      case 'pendiente': return 'border-red-500';
      case 'en_proceso': return 'border-yellow-500';
      case 'listo': return 'border-green-500';
      case 'entregado': return 'border-gray-300';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className={`p-4 mb-4 bg-white rounded shadow border-l-4 ${getBorderColor()}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">#{pedido.id} - {pedido.usuario.nombre || 'Cliente'}</h3>
        <span className="text-sm font-semibold text-gray-500">{tiempo}</span>
      </div>
      <p className="text-sm text-gray-600 mb-1">Tel: {pedido.usuario.telefono}</p>
      <p className="text-sm text-gray-600 mb-3">Pago: <span className="uppercase">{pedido.metodo_pago}</span></p>
      
      {pedido.notas && (
        <div className="mb-3 p-2 bg-yellow-50 text-yellow-800 text-sm rounded">
          <strong>Notas:</strong> {pedido.notas}
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-bold mb-1 border-b pb-1">Ítems:</h4>
        <ul className="text-sm">
          {pedido.detalles.map(d => (
            <li key={d.id} className="mb-1">
              <span className="font-bold">{d.cantidad}x</span> {d.producto?.nombre || 'Producto'}
              {d.modificadores && Object.keys(d.modificadores).length > 0 && (
                <div className="text-xs text-gray-500 ml-4 mt-1 bg-gray-50 p-1 rounded">
                  {JSON.stringify(d.modificadores)}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {siguienteEstado && (
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors uppercase text-sm"
          onClick={() => onCambiarEstado(pedido.id, siguienteEstado)}
        >
          Mover a {siguienteEstado.replace('_', ' ')}
        </button>
      )}
    </div>
  );
};
