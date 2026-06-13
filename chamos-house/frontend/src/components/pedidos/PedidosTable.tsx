import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, MotionTableRow } from '@/components/ui/Table';
import type { Pedido } from '@/types/pedido';
import { formatCurrency, formatDateShort, formatEstado, formatMetodoPago, formatTelefono } from '@/utils/formatters';

interface PedidosTableProps {
  pedidos: Pedido[];
  onView: (pedido: Pedido) => void;
}

const estadoVariant: Record<Pedido['estado'], 'warning' | 'info' | 'success' | 'default'> = {
  pendiente: 'warning',
  en_proceso: 'info',
  listo: 'success',
  entregado: 'default',
};

export function PedidosTable({ pedidos, onView }: PedidosTableProps) {
  return (
    <Table>
      <TableHead>
        <TableHeaderCell>ID</TableHeaderCell>
        <TableHeaderCell>Cliente</TableHeaderCell>
        <TableHeaderCell>Estado</TableHeaderCell>
        <TableHeaderCell>Pago</TableHeaderCell>
        <TableHeaderCell>Total</TableHeaderCell>
        <TableHeaderCell>Fecha</TableHeaderCell>
        <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
      </TableHead>
      <TableBody>
        {pedidos.map((pedido, index) => (
          <MotionTableRow key={pedido.id} index={index} onClick={() => onView(pedido)}>
            <TableCell>
              <span className="font-mono font-semibold text-accent">#{pedido.id}</span>
            </TableCell>
            <TableCell>
              <p className="font-medium">{pedido.usuario.nombre ?? 'Sin nombre'}</p>
              <p className="text-xs text-muted">{formatTelefono(pedido.usuario.telefono)}</p>
            </TableCell>
            <TableCell>
              <Badge variant={estadoVariant[pedido.estado]}>{formatEstado(pedido.estado)}</Badge>
            </TableCell>
            <TableCell className="text-text-secondary">
              {formatMetodoPago(pedido.metodo_pago)}
            </TableCell>
            <TableCell className="font-mono font-medium">
              {formatCurrency(pedido.total)}
            </TableCell>
            <TableCell className="text-text-secondary">
              {formatDateShort(pedido.f_creacion)}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onView(pedido)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </MotionTableRow>
        ))}
      </TableBody>
    </Table>
  );
}
