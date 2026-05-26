import clsx from 'clsx';

interface ConnectionStatusProps {
  isConnected: boolean;
  namespace?: string;
  compact?: boolean;
}

export function ConnectionStatus({
  isConnected,
  namespace = '/cocina',
  compact = false,
}: ConnectionStatusProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-full border px-3 py-1.5',
        isConnected
          ? 'border-success/30 bg-success/10'
          : 'border-danger/30 bg-danger/10',
      )}
    >
      <span
        className={clsx(
          'h-2 w-2 rounded-full',
          isConnected ? 'bg-success animate-pulse-slow' : 'bg-danger',
        )}
      />
      {!compact && (
        <span className="text-xs font-medium text-text-secondary">
          {isConnected ? `Conectado ${namespace}` : 'Desconectado'}
        </span>
      )}
    </div>
  );
}
