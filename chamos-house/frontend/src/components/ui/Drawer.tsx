import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './Button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: 'left' | 'right';
}

export function Drawer({ isOpen, onClose, title, children, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={clsx(
          'fixed top-0 z-50 flex h-full w-full max-w-md flex-col border-border-subtle bg-surface shadow-card transition-transform duration-300',
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          isOpen
            ? 'translate-x-0'
            : side === 'right'
              ? 'translate-x-full'
              : '-translate-x-full',
        )}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar panel">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">{children}</div>
      </aside>
    </>
  );
}
