import { useCallback, useEffect, useMemo, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import clsx from 'clsx';
import { Header } from '@/components/layout/Header';
import { ProductoCard } from '@/features/products/components/ProductoCard';
import { ProductoForm } from '@/features/products/components/ProductoForm';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Skeleton } from '@/components/ui/Skeleton';
import { productoService } from '@/features/products/api/productoService';
import type { Producto, ProductoCreateInput } from '@/features/products/types/producto';
import { CATEGORIAS_PRODUCTO } from '@/utils/constants';

const PAGE_SIZE = 9;

export function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('todas');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);

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

  const filtrados = useMemo(() => {
    if (categoriaActiva === 'todas') return productos;
    return productos.filter((p) => p.categoria === categoriaActiva);
  }, [productos, categoriaActiva]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginados = filtrados.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [categoriaActiva]);

  const handleCreate = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const handleEdit = (producto: Producto) => {
    setEditing(producto);
    setDrawerOpen(true);
  };

  const handleDelete = (producto: Producto) => {
    setProductoToDelete(producto);
  };

  const confirmDelete = async () => {
    if (!productoToDelete) return;
    await productoService.delete(productoToDelete.id);
    setProductoToDelete(null);
    await load();
  };

  const handleToggleDisponible = async (producto: Producto) => {
    await productoService.toggleDisponible(producto.id);
    await load();
  };

  const handleSubmit = async (data: ProductoCreateInput) => {
    if (editing) {
      await productoService.update(editing.id, data);
    } else {
      await productoService.create(data);
    }
    setDrawerOpen(false);
    await load();
  };

  const tabs = ['todas', ...CATEGORIAS_PRODUCTO] as const;

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

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoriaActiva(cat)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors',
              categoriaActiva === cat
                ? 'bg-accent font-bold text-primary'
                : 'border border-border-subtle bg-elevated text-text-secondary hover:text-text-primary',
            )}
          >
            {cat === 'todas' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : paginados.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin productos"
          description="Agrega productos al menú para que estén disponibles en pedidos."
          action={{ label: 'Crear producto', onClick: handleCreate }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginados.map((producto) => (
              <ProductoCard
                key={producto.id}
                producto={producto}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleDisponible={handleToggleDisponible}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-6">
              <p className="text-sm text-text-secondary">
                Mostrando{' '}
                <span className="font-bold text-text-primary">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtrados.length)}
                </span>{' '}
                de <span className="font-bold text-text-primary">{filtrados.length}</span> productos
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={clsx(
                        'flex h-8 w-8 items-center justify-center rounded text-sm font-bold',
                        page === n
                          ? 'bg-accent text-primary'
                          : 'text-text-secondary hover:bg-elevated',
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Editar producto' : 'Nuevo producto'}
      >
        <ProductoForm
          initial={editing ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setDrawerOpen(false)}
        />
      </Drawer>

      <ConfirmDialog
        isOpen={!!productoToDelete}
        onClose={() => setProductoToDelete(null)}
        title="Eliminar producto"
        description={`¿Estás seguro de que deseas eliminar "${productoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        onConfirm={() => void confirmDelete()}
        isDestructive
      />
    </div>
  );
}
