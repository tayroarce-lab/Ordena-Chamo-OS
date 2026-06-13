import { useState, type FormEvent } from 'react';
import { ChefHat, Lock, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';

import { motion } from 'framer-motion';

const loginContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const loginItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
};

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
    <motion.div
      className="grid min-h-screen lg:grid-cols-2"
      initial="hidden"
      animate="visible"
      variants={loginContainerVariants}
    >
      <motion.div
        className="relative hidden overflow-hidden bg-black lg:flex lg:flex-col lg:justify-between lg:p-12"
        variants={loginItemVariants}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        >
          {/* Se espera que el usuario coloque el video en frontend/public/login-bg.mp4 */}
          <source src="/login-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent" />
        <motion.div className="relative z-10" variants={loginItemVariants}>
          <motion.div className="mb-8" variants={loginItemVariants}>
            <img src="/logo.png" alt="Chamos House" className="h-20 w-20 rounded-full object-cover" />
          </motion.div>
          <motion.h1 className="font-heading text-4xl font-bold leading-tight text-text-primary" variants={loginItemVariants}>
            Chamos House
          </motion.h1>
          <motion.p className="mt-4 max-w-md text-lg text-text-secondary" variants={loginItemVariants}>
            Sistema integral para tu restaurante de comida rápida. Cocina en tiempo real,
            reportes automáticos y cero libretas.
          </motion.p>
        </motion.div>
        <motion.div className="relative z-10 space-y-4" variants={loginItemVariants}>
          {[
            { icon: ChefHat, text: 'KDS en tiempo real con Socket.io' },
            { icon: Lock, text: 'Acceso seguro por rol' },
            { icon: Phone, text: 'Pedidos desde WhatsApp vía n8n' },
          ].map(({ icon: Icon, text }) => (
            <motion.div key={text} className="flex items-center gap-3 text-text-secondary" variants={loginItemVariants}>
              <Icon className="h-5 w-5 text-accent" />
              <span>{text}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.p className="relative z-10 text-xs text-muted" variants={loginItemVariants}>
          © {new Date().getFullYear()} Chamos House
        </motion.p>
      </motion.div>

      <motion.div
        className="flex flex-col justify-center px-8 py-12 sm:px-16"
        variants={loginItemVariants}
      >
        <motion.div className="mx-auto w-full max-w-md" variants={loginItemVariants}>
          <motion.div className="mb-8 lg:hidden" variants={loginItemVariants}>
            <motion.div className="mb-4" variants={loginItemVariants}>
              <img src="/logo.png" alt="Chamos House" className="h-14 w-14 rounded-full object-cover" />
            </motion.div>
            <motion.h1 className="font-heading text-2xl font-bold" variants={loginItemVariants}>
              Iniciar sesión
            </motion.h1>
          </motion.div>

          <motion.div className="hidden lg:block mb-8" variants={loginItemVariants}>
            <motion.h2 className="font-heading text-2xl font-bold text-text-primary" variants={loginItemVariants}>
              Bienvenido
            </motion.h2>
            <motion.p className="mt-1 text-text-secondary" variants={loginItemVariants}>
              Ingresa tus credenciales de staff
            </motion.p>
          </motion.div>

          <motion.form onSubmit={(e) => void handleSubmit(e)} className="space-y-5" variants={loginItemVariants}>
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
              <motion.div
                className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.div>
            )}
            <motion.div variants={loginItemVariants}>
              <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
                Entrar
              </Button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
