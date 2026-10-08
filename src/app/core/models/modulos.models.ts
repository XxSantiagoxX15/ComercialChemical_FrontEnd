/**
 * Catálogo de módulos del sistema. Las claves son las mismas que usa el
 * backend en la tabla `permiso_rol`; de aquí salen el menú lateral, los
 * guards de las rutas y la pantalla de permisos por rol, para que los tres
 * hablen siempre de lo mismo.
 */
export type Modulo =
  | 'dashboard'
  | 'inventario_articulos'
  | 'inventario_movimientos'
  | 'inventario_alertas'
  | 'compras'
  | 'pronosticos'
  | 'importacion'
  | 'auditoria'
  | 'usuarios';

export const ROL_ADMIN = 'Administrador';

export interface ModuloInfo {
  key: Modulo;
  label: string;
  /** Qué pantallas y acciones obtiene un rol al activar el módulo. */
  desc: string;
  icon: string;
}

export const MODULOS: ModuloInfo[] = [
  { key: 'dashboard',              label: 'Dashboard',                desc: 'Página de inicio; cada tarjeta aparece según los demás módulos', icon: 'dashboard' },
  { key: 'inventario_articulos',   label: 'Inventario - Artículos',   desc: 'Consultar el catálogo, su stock y sus ventas',                   icon: 'inventory_2' },
  { key: 'inventario_movimientos', label: 'Inventario - Movimientos', desc: 'Consultar y registrar entradas, salidas y ajustes',              icon: 'swap_vert' },
  { key: 'inventario_alertas',     label: 'Inventario - Alertas',     desc: 'Stock crítico y vencimientos; ignorar o reactivar alertas',      icon: 'notifications' },
  { key: 'compras',                label: 'Compras',                  desc: 'Órdenes de compra, proveedores y cotizador',                     icon: 'shopping_cart' },
  { key: 'pronosticos',            label: 'Pronósticos',              desc: 'Forecasting, recomendaciones, producción y reportes',            icon: 'trending_up' },
  { key: 'importacion',            label: 'Importación',              desc: 'Cargar los informes de Kardex y de Saldos',                      icon: 'upload_file' },
  { key: 'auditoria',              label: 'Auditoría',                desc: 'Consultar el registro de actividad',                             icon: 'history' },
  { key: 'usuarios',               label: 'Usuarios',                 desc: 'Cuentas, roles y permisos',                                      icon: 'group' },
];

export interface MenuItem {
  grupo: string;
  label: string;
  icon: string;
  route: string;
  modulo: Modulo;
}

/** Entradas del menú lateral, en orden. Cada una se muestra solo si el rol
 *  del usuario tiene activo su módulo. */
export const MENU: MenuItem[] = [
  { grupo: 'Principal',      label: 'Dashboard',   icon: 'dashboard',            route: '/dashboard',              modulo: 'dashboard' },
  { grupo: 'Inventario',     label: 'Artículos',   icon: 'inventory_2',          route: '/inventario/articulos',   modulo: 'inventario_articulos' },
  { grupo: 'Inventario',     label: 'Movimientos', icon: 'swap_horiz',           route: '/inventario/movimientos', modulo: 'inventario_movimientos' },
  { grupo: 'Inventario',     label: 'Alertas',     icon: 'notifications_active', route: '/inventario/alertas',     modulo: 'inventario_alertas' },
  { grupo: 'Operaciones',    label: 'Compras',     icon: 'shopping_cart',        route: '/compras/ordenes',        modulo: 'compras' },
  { grupo: 'Operaciones',    label: 'Cotizador',   icon: 'request_quote',        route: '/compras/cotizador',      modulo: 'compras' },
  { grupo: 'Operaciones',    label: 'Pronósticos', icon: 'trending_up',          route: '/pronosticos',            modulo: 'pronosticos' },
  { grupo: 'Operaciones',    label: 'Importación', icon: 'upload_file',          route: '/importacion',            modulo: 'importacion' },
  { grupo: 'Administración', label: 'Auditoría',   icon: 'manage_search',        route: '/auditoria',              modulo: 'auditoria' },
  { grupo: 'Administración', label: 'Usuarios',    icon: 'group',                route: '/usuarios',               modulo: 'usuarios' },
];

/** Ruta a la que se envía a quien no tiene ningún módulo o intenta entrar a uno ajeno. */
export const RUTA_SIN_ACCESO = '/sin-acceso';