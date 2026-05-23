import { useCallback, useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ProductosTable } from '@/components/productos/ProductosTable';
import { ProductoForm } from '@/components/productos/ProductoForm';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { productoService } from '@/services/productoService';
import type { Producto, ProductoCreateInput } from '@/types/producto';

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await productoService.getAll();
      setProductos(data);
    } catch {
      setProductos([]);
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

  const handleEdit = (producto: Producto) => {
    setEditing(producto);
    setModalOpen(true);
  };

  const handleDelete = async (producto: Producto) => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"?`)) return;
    await productoService.delete(producto.id);
    await load();
  };

  const handleSubmit = async (data: ProductoCreateInput) => {
    if (editing) {
      await productoService.update(editing.id, data);
    } else {
      await productoService.create(data);
    }
    setModalOpen(false);
    await load();
  };

  return (
    <div>
      <Header
        title="Productos"
        subtitle={`${productos.length} en el menú`}
        actions={
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Nuevo producto
          </Button>
        }
      />

      {isLoading ? (
        <SkeletonTable rows={6} />
      ) : productos.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin productos"
          description="Agrega productos al menú para que estén disponibles en pedidos."
          action={{ label: 'Crear producto', onClick: handleCreate }}
        />
      ) : (
        <ProductosTable productos={productos} onEdit={handleEdit} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
      >
        <ProductoForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
