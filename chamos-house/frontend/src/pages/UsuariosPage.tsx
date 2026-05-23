import { useCallback, useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { UsuariosTable } from '@/components/usuarios/UsuariosTable';
import { UsuarioForm } from '@/components/usuarios/UsuarioForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { usuarioService } from '@/services/usuarioService';
import type { Usuario, UsuarioCreateInput } from '@/types/usuario';

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const { usuarios: lista } = await usuarioService.getAll({ limit: 100 });
      setUsuarios(lista);
    } catch {
      setUsuarios([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditing(usuario);
    setModalOpen(true);
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿${accion} usuario ${usuario.telefono}?`)) return;
    await usuarioService.toggleActivo(usuario.id);
    await load();
  };

  const handleSubmit = async (data: UsuarioCreateInput) => {
    if (editing) {
      await usuarioService.update(editing.id, data);
    } else {
      await usuarioService.create(data);
    }
    setModalOpen(false);
    await load();
  };

  return (
    <div>
      <Header
        title="Usuarios"
        subtitle={`${usuarios.length} registrados`}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        }
      />

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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar usuario' : 'Nuevo usuario'}
      >
        <UsuarioForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
