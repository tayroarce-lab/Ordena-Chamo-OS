import { useState, useEffect } from 'react';

/**
 * Hook para mostrar el tiempo transcurrido desde la creación del pedido.
 * Actualiza la UI cada 60 segundos.
 */
export function useTickingTime(f_creacion: string): string {
  const [timeText, setTimeText] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const createdDate = new Date(f_creacion);
      if (isNaN(createdDate.getTime())) {
        setTimeText('N/A');
        return;
      }

      const diffMs = Date.now() - createdDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      if (diffMins < 60) {
        setTimeText(`${Math.max(0, diffMins)} min`);
      } else {
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        setTimeText(`${hours}h ${mins}min`);
      }
    };

    calculateTime();
    const intervalId = setInterval(calculateTime, 60000);

    return () => clearInterval(intervalId);
  }, [f_creacion]);

  return timeText;
}
