export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  categoria: string | null;
  disponible: boolean;
}

export interface ProductoCreateInput {
  nombre: string;
  precio: number;
  categoria?: string | null;
  disponible?: boolean;
}

export interface ProductoUpdateInput {
  nombre?: string;
  precio?: number;
  categoria?: string | null;
  disponible?: boolean;
}
