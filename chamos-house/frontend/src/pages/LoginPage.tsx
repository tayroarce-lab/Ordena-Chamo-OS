import { useState, type FormEvent } from 'react';
import { ChefHat, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const { login, isLoading, error, setError } = useAuth();
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ telefono: telefono.trim(), password });
    } catch {
      // error handled in useAuth
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-transparent" />
        <div className="relative z-10">
          <div className="mb-8">
            <img src="/logo.png" alt="Chamos House" className="h-20 w-20 rounded-full object-cover" />
          </div>
          <h1 className="font-heading text-4xl font-bold leading-tight text-text-primary">
            Chamos House
          </h1>
          <p className="mt-4 max-w-md text-lg text-text-secondary">
            Sistema integral para tu restaurante de comida rápida. Cocina en tiempo real,
            reportes automáticos y cero libretas.
          </p>
        </div>
        <div className="relative z-10 space-y-4">
          {[
            { icon: ChefHat, text: 'KDS en tiempo real con Socket.io' },
            { icon: Lock, text: 'Acceso seguro por rol' },
            { icon: Phone, text: 'Pedidos desde WhatsApp vía n8n' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-text-secondary">
              <Icon className="h-5 w-5 text-accent" />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <p className="relative z-10 text-xs text-muted">© {new Date().getFullYear()} Chamos House</p>
      </div>

      <div className="flex flex-col justify-center px-8 py-12 sm:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="mb-4">
              <img src="/logo.png" alt="Chamos House" className="h-14 w-14 rounded-full object-cover" />
            </div>
            <h1 className="font-heading text-2xl font-bold">Iniciar sesión</h1>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="font-heading text-2xl font-bold text-text-primary">Bienvenido</h2>
            <p className="mt-1 text-text-secondary">Ingresa tus credenciales de staff</p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
            <Input
              label="Teléfono"
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="88887777"
              autoComplete="tel"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}
            <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
