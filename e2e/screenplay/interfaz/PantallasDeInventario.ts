import { Elemento, FILA_CON_DATOS } from './Elemento';

export const PantallaDeArticulos = {
  ruta: '/inventario/articulos',

  filas: Elemento.llamado('las filas de la tabla de artículos')
    .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`)),
};

export const PantallaDeAlertas = {
  ruta: '/inventario/alertas',

  /** La tabla de alertas vigentes es la que se puede ordenar. */
  filas: Elemento.llamado('las filas de la tabla de alertas')
    .ubicadoCon(p => p.locator(`main.content table[matsort] ${FILA_CON_DATOS}`)),

  noMeInteresa: (codigo: string) =>
    Elemento.llamado(`el botón «No me interesa» de la alerta ${codigo}`)
      .ubicadoCon(p => p.locator(`main.content table[matsort] ${FILA_CON_DATOS}`)
        .filter({ has: p.locator('.mat-column-codigo', { hasText: codigo }) })
        .locator('button').filter({ has: p.locator('mat-icon', { hasText: 'notifications_off' }) })),

  verIgnoradas: Elemento.llamado('el botón «Ver alertas ignoradas»')
    .ubicadoCon(p => p.locator('.ignoradas-toggle').getByRole('button')),

  /** Las filas de alertas ignoradas son las que traen el botón «Reactivar». */
  filasIgnoradas: Elemento.llamado('las filas de la tabla de alertas ignoradas')
    .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`)
      .filter({ has: p.getByRole('button', { name: 'Reactivar' }) })),

  reactivar: (codigo: string) =>
    Elemento.llamado(`el botón «Reactivar» de la alerta ${codigo}`)
      .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`)
        .filter({ has: p.locator('.mat-column-codigo', { hasText: codigo }) })
        .getByRole('button', { name: 'Reactivar' })),
};

export const PantallaDeDashboard = {
  ruta: '/dashboard',

  /** El número grande de una tarjeta del Dashboard, por su rótulo. */
  indicador: (rotulo: string) =>
    Elemento.llamado(`el indicador «${rotulo}» del Dashboard`)
      .ubicadoCon(p => p.locator('.kpi-card').filter({ hasText: rotulo }).locator('.kpi-value')),
};
