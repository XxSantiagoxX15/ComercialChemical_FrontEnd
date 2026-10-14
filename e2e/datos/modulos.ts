/**
 * Los módulos del sistema: cómo se llama cada uno en la ventana «Permisos por
 * Rol», qué opción del menú controla y cuáles trae cada rol por defecto
 * (los mismos valores que MODULOS_DEFAULT en apps/auth/modulos.py).
 */
export interface Modulo {
  clave: string;
  enPermisos: string;
  enMenu: string;
  ruta: string;
}

/** En el orden en que aparecen en el menú lateral. */
export const MODULOS: Modulo[] = [
  { clave: 'dashboard',              enPermisos: 'Dashboard',                enMenu: 'Dashboard',              ruta: '/dashboard' },
  { clave: 'inventario_articulos',   enPermisos: 'Inventario - Artículos',   enMenu: 'Artículos',              ruta: '/inventario/articulos' },
  { clave: 'calculadora_precios',    enPermisos: 'Calculadora de precios',   enMenu: 'Calculadora de precios', ruta: '/inventario/calculadora' },
  { clave: 'inventario_movimientos', enPermisos: 'Inventario - Movimientos', enMenu: 'Movimientos',            ruta: '/inventario/movimientos' },
  { clave: 'inventario_alertas',     enPermisos: 'Inventario - Alertas',     enMenu: 'Alertas',                ruta: '/inventario/alertas' },
  { clave: 'compras',                enPermisos: 'Compras',                  enMenu: 'Compras',                ruta: '/compras/ordenes' },
  { clave: 'pronosticos',            enPermisos: 'Pronósticos',              enMenu: 'Pronósticos',            ruta: '/pronosticos' },
  { clave: 'importacion',            enPermisos: 'Importación',              enMenu: 'Importación',            ruta: '/importacion' },
  { clave: 'auditoria',              enPermisos: 'Auditoría',                enMenu: 'Auditoría',              ruta: '/auditoria' },
  { clave: 'usuarios',               enPermisos: 'Usuarios',                 enMenu: 'Usuarios',               ruta: '/usuarios' },
];

export type Rol = 'Administrador' | 'Analista_Inventarios' | 'Responsable_Compras';

export const MODULOS_POR_DEFECTO: Record<Rol, string[]> = {
  Administrador: MODULOS.map(m => m.clave),
  Analista_Inventarios: ['dashboard', 'inventario_articulos', 'inventario_movimientos', 'inventario_alertas', 'pronosticos'],
  Responsable_Compras: ['dashboard', 'compras', 'inventario_alertas', 'pronosticos'],
};

/** Nombre de la pestaña de cada rol en la ventana «Permisos por Rol». */
export const PESTANA_DEL_ROL: Record<Rol, string> = {
  Administrador: 'Administrador',
  Analista_Inventarios: 'Analista de Inventarios',
  Responsable_Compras: 'Resp. de Compras',
};

export const moduloDe = (clave: string): Modulo => {
  const modulo = MODULOS.find(m => m.clave === clave);
  if (!modulo) throw new Error(`No existe el módulo «${clave}».`);
  return modulo;
};

/** Opciones que debe mostrar el menú a quien tiene esos módulos, en orden. */
export const menuDe = (claves: string[]): string[] =>
  MODULOS.filter(m => claves.includes(m.clave)).map(m => m.enMenu);

/** Opciones que NO debe mostrar el menú a quien tiene esos módulos. */
export const fueraDelMenuDe = (claves: string[]): Modulo[] =>
  MODULOS.filter(m => !claves.includes(m.clave));
