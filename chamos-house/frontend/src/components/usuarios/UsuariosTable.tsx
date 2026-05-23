import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/Table';
import type { Usuario } from '@/types/usuario';
import { formatDateShort, formatTelefono } from '@/utils/formatters';

interface UsuariosTableProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onToggleActivo: (usuario: Usuario) => void;
}

const rolVariant: Record<Usuario['rol'], 'accent' | 'info' | 'default'> = {
  admin: 'accent',
  cocina: 'info',
  cliente: 'default',
};

const rolLabel: Record<Usuario['rol'], string> = {
  admin: 'Admin',
  cocina: 'Cocina',
  cliente: 'Cliente',
};

export function UsuariosTable({ usuarios, onEdit, onToggleActivo }: UsuariosTableProps) {
  return (
    <Table>
      <TableHead>
        <TableHeaderCell>Nombre</TableHeaderCell>
        <TableHeaderCell>Teléfono</TableHeaderCell>
        <TableHeaderCell>Rol</TableHeaderCell>
        <TableHeaderCell>Registro</TableHeaderCell>
        <TableHeaderCell className="text-right">Acciones</TableHeaderCell>
      </TableHead>
      <TableBody>
        {usuarios.map((usuario) => (
          <TableRow key={usuario.id}>
            <TableCell className="font-medium">{usuario.nombre ?? '—'}</TableCell>
            <TableCell className="font-mono text-sm">{formatTelefono(usuario.telefono)}</TableCell>
            <TableCell>
              <Badge variant={rolVariant[usuario.rol]}>{rolLabel[usuario.rol]}</Badge>
            </TableCell>
            <TableCell className="text-text-secondary">
              {formatDateShort(usuario.f_creacion)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => onEdit(usuario)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onToggleActivo(usuario)}>
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
