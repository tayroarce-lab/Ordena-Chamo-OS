import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import type { Producto } from '@/types/producto';
import { formatCurrency } from '@/utils/formatters';

interface ProductosTableProps {
  productos: Producto[];
  onEdit: (producto: Producto) => void;
  onDelete: (producto: Producto) => void;
}

export function ProductosTable({ productos, onEdit, onDelete }: ProductosTableProps) {
  return (
    <Table>
      <TableHead>
        <TableHeaderCell>Nombre</TableHeaderCell>
        <TableHeaderCell>Categoría</TableHeaderCell>
        <TableHeaderCell>Precio</TableHeaderCell>
        <TableHeaderCell>Estado</TableHeaderCell>
        <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
      </TableHead>
      <TableBody>
        {productos.map((producto) => (
          <TableRow key={producto.id}>
            <TableCell className="font-medium">{producto.nombre}</TableCell>
            <TableCell className="text-text-secondary capitalize">
              {producto.categoria ?? '—'}
            </TableCell>
            <TableCell className="font-mono">{formatCurrency(producto.precio)}</TableCell>
            <TableCell>
              <Badge variant={producto.disponible ? 'success' : 'danger'}>
                {producto.disponible ? 'Disponible' : 'No disponible'}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(producto)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(producto)}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
