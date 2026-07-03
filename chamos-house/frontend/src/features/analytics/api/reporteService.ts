import { apiClient } from '@/config/axios';
import type { ApiSuccess } from '@/types/api';
import type { PeriodoReporte } from '@/utils/constants';

export interface ReporteFinancieroRow {
  metodo_pago: string;
  total_pedidos: number;
  ingresos: number;
}

export interface ReporteTopProductoRow {
  producto_id: number;
  nombre: string;
  total_vendido: number;
  ingresos_generados: number;
}

export interface ReporteEstadoOperativoRow {
  estado: string;
  cantidad: number;
}

export interface ReporteResponse {
  periodo: PeriodoReporte;
  rango: { inicio: string; fin: string };
  resumen_financiero: {
    total_ingresos: number;
    total_pedidos: number;
    por_metodo: ReporteFinancieroRow[];
  };
  top_productos: ReporteTopProductoRow[];
  estado_operativo: ReporteEstadoOperativoRow[];
}

export const reporteService = {
  obtener: async (periodo: PeriodoReporte, fecha: string): Promise<ReporteResponse> => {
    const { data } = await apiClient.get<ApiSuccess<ReporteResponse>>('/reportes', {
      params: { periodo, fecha },
    });
    return data.data;
  },
};
