export type RolUsuario = 'cliente' | 'cocina' | 'admin';

export interface Usuario {
  id: number;
  telefono: string;
  nombre: string | null;
  rol: RolUsuario;
  activo: boolean;
  f_creacion: string;
}

export interface UsuarioCreateInput {
  telefono: string;
  nombre?: string | null;
  rol: RolUsuario;
  password?: string;
}

export interface UsuarioUpdateInput {
  telefono?: string;
  nombre?: string | null;
  rol?: RolUsuario;
  password?: string;
}
