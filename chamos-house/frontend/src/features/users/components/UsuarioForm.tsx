import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Usuario, UsuarioCreateInput } from '@/features/users/types/usuario';
import type { RolUsuario } from '@/features/users/types/usuario';

interface UsuarioFormProps {
  initial?: Usuario;
  onSubmit: (data: UsuarioCreateInput) => Promise<void>;
  onCancel: () => void;
}

const ROLES: { value: RolUsuario; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'cocina', label: 'Cocina' },
  { value: 'cliente', label: 'Cliente' },
];

export function UsuarioForm({ initial, onSubmit, onCancel }: UsuarioFormProps) {
  const [telefono, setTelefono] = useState(initial?.telefono ?? '');
  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [rol, setRol] = useState<RolUsuario>(initial?.rol ?? 'cocina');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!telefono.trim()) {
      setError('El teléfono es requerido');
      return;
    }
    if (!initial && !password.trim()) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit({
        telefono: telefono.trim(),
        nombre: nombre.trim() || null,
        rol,
        ...(password.trim() ? { password: password.trim() } : {}),
      });
    } catch {
      setError('Error al guardar el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <Input
        label="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        placeholder="88887777"
        required
      />
      <Input
        label="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre completo"
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">Rol</label>
        <select
          value={rol}
          onChange={(e) => setRol(e.target.value as RolUsuario)}
          className="w-full rounded-lg border border-border-subtle bg-elevated px-4 py-2.5 text-text-primary focus:border-accent focus:outline-none"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <Input
        label={initial ? 'Nueva contraseña (opcional)' : 'Contraseña'}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required={!initial}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initial ? 'Guardar cambios' : 'Crear usuario'}
        </Button>
      </div>
    </form>
  );
}
