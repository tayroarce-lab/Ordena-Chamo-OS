import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import clsx from 'clsx';
import { Header } from '@/components/layout/Header';
import { UsuariosTable } from '@/components/usuarios/UsuariosTable';
import { UsuarioForm } from '@/components/usuarios/UsuarioForm';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Input } from '@/components/ui/Input';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { usuarioService } from '@/services/usuarioService';
import type { RolUsuario, Usuario, UsuarioCreateInput } from '@/types/usuario';

type FiltroRol = RolUsuario | 'todos';

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [filtroRol, setFiltroRol] = useState<FiltroRol>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [usuarioToToggle, setUsuarioToToggle] = useState<Usuario | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { usuarios: lista } = await usuarioService.getAll({
        limit: 100,
        rol: filtroRol === 'todos' ? undefined : filtroRol,
        search: busqueda.trim() || undefined,
      });
      setUsuarios(lista);
    } catch {
      setUsuarios([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroRol, busqueda]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const contadores = useMemo(() => {
    const base = { todos: usuarios.length, admin: 0, cocina: 0, cliente: 0 };
    for (const u of usuarios) {
      base[u.rol] += 1;
    }
    return base;
  }, [usuarios]);

  const handleCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditing(usuario);
    setDrawerOpen(true);
  };

  const handleToggleActivo = (usuario: Usuario) => {
    setUsuarioToToggle(usuario);
  };

  const confirmToggleActivo = async () => {
    if (!usuarioToToggle) return;
    await usuarioService.toggleActivo(usuarioToToggle.id);
    setUsuarioToToggle(null);
    await load();
  };

  const handleSubmit = async (data: UsuarioCreateInput) => {
    if (editing) {
      await usuarioService.update(editing.id, data);
    } else {
      await usuarioService.create(data);
    }
    setDrawerOpen(false);
    await load();
  };

  const roleTabs: { id: FiltroRol; label: string }[] = [
    { id: 'todos', label: `Todos (${contadores.todos})` },
    { id: 'admin', label: `Admin (${contadores.admin})` },
    { id: 'cocina', label: `Cocina (${contadores.cocina})` },
    { id: 'cliente', label: `Clientes (${contadores.cliente})` },
  ];

  return (
    <div>
      <Header
        title="Usuarios"
        subtitle="Gestión de staff y clientes"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

      <div className="mb-4">
        <Input
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {roleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFiltroRol(tab.id)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              filtroRol === tab.id
                ? 'bg-accent font-bold text-primary'
                : 'border border-border-subtle bg-elevated text-text-secondary hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : usuarios.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin usuarios"
          description="Crea usuarios de cocina o administradores para acceder al sistema."
          action={{ label: 'Crear usuario', onClick: handleCreate }}
        />
      ) : (
        <UsuariosTable usuarios={usuarios} onEdit={handleEdit} onToggleActivo={handleToggleActivo} />
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
      >
        <UsuarioForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>

      <ConfirmDialog
        isOpen={!!usuarioToToggle}
        onClose={() => setUsuarioToToggle(null)}
        title={usuarioToToggle?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        description={`¿Estás seguro de que deseas ${
          usuarioToToggle?.activo ? 'desactivar' : 'activar'
        } al usuario ${usuarioToToggle?.telefono}?`}
        confirmText={usuarioToToggle?.activo ? 'Desactivar' : 'Activar'}
        onConfirm={() => void confirmToggleActivo()}
        isDestructive={usuarioToToggle?.activo}
      />
    </div>
  );
}
