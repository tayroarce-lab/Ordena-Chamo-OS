import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Producto, ProductoCreateInput } from '@/features/products/types/producto';
import { CATEGORIAS_PRODUCTO } from '@/utils/constants';

interface ProductoFormProps {
  initial?: Producto;
  onSubmit: (data: ProductoCreateInput) => Promise<void>;
  onCancel: () => void;
}

export function ProductoForm({ initial, onSubmit, onCancel }: ProductoFormProps) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [precio, setPrecio] = useState(String(initial?.precio ?? ''));
  const [categoria, setCategoria] = useState(initial?.categoria ?? '');
  const [disponible, setDisponible] = useState(initial?.disponible ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const precioNum = parseFloat(precio);
    if (!nombre.trim() || Number.isNaN(precioNum) || precioNum < 0) {
      setError('Completa nombre y precio válidos');
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit({
        nombre: nombre.trim(),
        precio: precioNum,
        categoria: categoria || null,
        disponible,
      });
    } catch {
      setError('Error al guardar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input
        label="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Ej: Big Chamos"
        required
      />
      <Input
        label="Precio (₡)"
        type="number"
        min="0"
        step="0.01"
        value={precio}
        onChange={(e) => setPrecio(e.target.value)}
        required
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">Categoría</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full rounded-lg border border-border-subtle bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
        >
          <option value="">Sin categoría</option>
          {CATEGORIAS_PRODUCTO.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={disponible}
          onChange={(e) => setDisponible(e.target.checked)}
          className="h-4 w-4 rounded border-border-subtle accent-accent"
        />
        <span className="text-sm text-text-primary">Disponible en menú</span>
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initial ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </form>
  );
}
