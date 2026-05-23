import { useEffect, useState } from 'react';
import { formatElapsedTime } from '@/utils/formatters';

export function useTickingTime(fCreacion: string, intervalMs = 60_000): string {
  const [elapsed, setElapsed] = useState(() => formatElapsedTime(fCreacion));

  useEffect(() => {
    const update = () => setElapsed(formatElapsedTime(fCreacion));
    update();
    const timer = window.setInterval(update, intervalMs);
    return () => window.clearInterval(timer);
  }, [fCreacion, intervalMs]);

  return elapsed;
}
