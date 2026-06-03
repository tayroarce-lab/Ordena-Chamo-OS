import { useState, type FormEvent } from 'react';
import { Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { productoService } from '@/services/productoService';
import { pedidoService } from '@/services/pedidoService';
import type { Producto } from '@/types/producto';
import type { MetodoPago, Pedido } from '@/types/pedido';
import { METODOS_PAGO } from '@/utils/constants';

interface ItemPedido {
  producto: Producto;
  cantidad: number;
}

interface NuevoPedidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (pedido: Pedido) => void;
}

const METODO_LABELS: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  sinpe_movil: 'Sinpe Movil',
};

export function NuevoPedidoModal({ isOpen, onClose, onCreated }: NuevoPedidoModalProps) {
  const [telefono, setTelefono] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('efectivo');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState<ItemPedido[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [productosLoaded, setProductosLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);

  const cargarProductos = async () => {
    if (productosLoaded) return;
    setLoadingProductos(true);
    try {
      const lista = await productoService.getAll();
      const disponibles = lista.filter((p) => p.disponible);
      setProductos(disponibles);
      setProductosLoaded(true);
      if (disponibles.length > 0 && disponibles[0]) {
        setProductoSeleccionado(String(disponibles[0].id));
      }
    } catch {
      setError('No se pudieron cargar los productos');
    } finally {
      setLoadingProductos(false);
    }
  };

  // Llamar cargarProductos cuando se abre el modal
  if (isOpen && !productosLoaded && !loadingProductos) {
    void cargarProductos();
  }

  const agregarItem = () => {
    const id = Number(productoSeleccionado);
    if (!id) return;
    const producto = productos.find((p) => p.id === id);
    if (!producto) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.producto.id === id);
      if (existing) {
        return prev.map((i) =>
          i.producto.id === id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i))
      );
    }
  };

  const eliminarItem = (productoId: number) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productoId));
  };

  const resetForm = () => {
    setTelefono('');
    setNombreCliente('');
    setMetodoPago('efectivo');
    setNotas('');
    setItems([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!telefono.trim() || telefono.trim().length < 7) {
      setError('El teléfono debe tener al menos 7 dígitos');
      return;
    }
    if (items.length === 0) {
      setError('Agrega al menos un producto al pedido');
      return;
    }

    setIsSubmitting(true);
    try {
      const pedido = await pedidoService.create({
        telefono: telefono.trim(),
        nombre_cliente: nombreCliente.trim() || undefined,
        metodo_pago: metodoPago,
        notas: notas.trim() || undefined,
        items: items.map((i) => ({
          producto_id: i.producto.id,
          cantidad: i.cantidad,
          modificadores: null,
        })),
      });
      onCreated(pedido);
      handleClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ?? 'Error al crear el pedido. Intenta de nuevo.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Pedido Manual"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            form="nuevo-pedido-form"
            type="submit"
            isLoading={isSubmitting}
            disabled={items.length === 0}
          >
            Crear Pedido
          </Button>
        </>
      }
    >
      <form
        id="nuevo-pedido-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-5"
      >
        {/* Datos del cliente */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Teléfono *"
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 88887777"
            required
          />
          <Input
            label="Nombre del cliente"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Método de pago
          </label>
          <div className="flex gap-2 flex-wrap">
            {METODOS_PAGO.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMetodoPago(m as MetodoPago)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  metodoPago === m
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border-subtle bg-elevated text-text-secondary hover:border-accent/50 hover:text-text-primary'
                }`}
              >
                {METODO_LABELS[m] ?? m}
              </button>
            ))}
          </div>
        </div>

        {/* Agregar productos */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Agregar productos
          </label>
          <div className="flex gap-2">
            <select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              disabled={loadingProductos || productos.length === 0}
              className="flex-1 rounded-lg border border-border-subtle bg-elevated px-4 py-2.5 text-sm text-text-primary focus:border-accent focus:outline-none disabled:opacity-50"
            >
              {loadingProductos ? (
                <option>Cargando productos…</option>
              ) : productos.length === 0 ? (
                <option>Sin productos disponibles</option>
              ) : (
                productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} — ₡{Number(p.precio).toLocaleString()}
                  </option>
                ))
              )}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={agregarItem}
              disabled={!productoSeleccionado || loadingProductos}
            >
              <Plus className="h-4 w-4" />
              Agregar
            </Button>
          </div>
        </div>

        {/* Lista de items */}
        {items.length > 0 && (
          <div className="rounded-xl border border-border-subtle overflow-hidden">
            <div className="bg-elevated px-4 py-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Productos en el pedido
              </span>
              <span className="text-xs text-muted">{items.length} ítem(s)</span>
            </div>
            <ul className="divide-y divide-border-subtle">
              {items.map((item) => (
                <li key={item.producto.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {item.producto.nombre}
                    </p>
                    <p className="text-xs text-muted">
                      ₡{Number(item.producto.precio).toLocaleString()} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.producto.id, item.cantidad - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-elevated text-text-primary hover:border-accent/50 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold tabular-nums">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.producto.id, item.cantidad + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border-subtle bg-elevated text-text-primary hover:border-accent/50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-24 text-right text-sm font-semibold text-text-primary">
                    ₡{(Number(item.producto.precio) * item.cantidad).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminarItem(item.producto.id)}
                    className="ml-1 rounded-md p-1.5 text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border-subtle bg-elevated px-4 py-3">
              <span className="text-sm font-semibold text-text-secondary">Total estimado</span>
              <span className="text-lg font-bold text-accent">
                ₡{total.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {items.length === 0 && !loadingProductos && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-subtle py-8 text-center">
            <ShoppingBag className="h-8 w-8 text-muted" />
            <p className="text-sm text-muted">Selecciona productos para agregar al pedido</p>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Notas adicionales
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Ej: Sin cebolla, extra queso…"
            className="w-full rounded-lg border border-border-subtle bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none transition-colors duration-200"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
