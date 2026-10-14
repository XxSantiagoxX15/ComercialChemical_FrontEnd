import { Elemento, FILA_CON_DATOS } from './Elemento';

/** Contenido de la pestaña que está abierta. */
const PESTANA_ABIERTA = 'mat-tab-body.mat-mdc-tab-body-active';

export const PantallaDePronosticos = {
  ruta: '/pronosticos',

  pronosticoMasivo: Elemento.llamado('el botón «Pronóstico masivo»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Pronóstico masivo' })),

  pestana: (nombre: string) =>
    Elemento.llamado(`la pestaña «${nombre}»`)
      .ubicadoCon(p => p.locator('main.content').getByRole('tab', { name: nombre })),

  // ── Pestaña Forecasting ──
  buscadorDeArticulo: Elemento.llamado('el buscador de artículo del pronóstico')
    .ubicadoCon(p => p.getByPlaceholder('Buscar por código o descripción...')),

  articuloSugerido: (codigo: string) =>
    Elemento.llamado(`el artículo ${codigo} de la lista de sugerencias`)
      .ubicadoCon(p => p.getByRole('option').filter({ hasText: codigo })),

  historialDisponible: Elemento.llamado('el aviso de historial disponible')
    .ubicadoCon(p => p.locator('.historial-hint')),

  horizonte: (meses: number) =>
    Elemento.llamado(`el horizonte de ${meses} meses`)
      .ubicadoCon(p => p.locator('.horizonte-selector').getByRole('radio', { name: `${meses} meses`, exact: true })),

  generar: Elemento.llamado('el botón «Generar Pronóstico»')
    .ubicadoCon(p => p.locator('button.forecast-btn')),

  errorDeCalculo: Elemento.llamado('el error del cálculo del pronóstico')
    .ubicadoCon(p => p.locator('.error-calc')),

  estadistica: (rotulo: string) =>
    Elemento.llamado(`la estadística «${rotulo}»`)
      .ubicadoCon(p => p.locator('.stat-card').filter({ hasText: rotulo }).locator('.stat-value')),

  tendencia: Elemento.llamado('la tendencia de las ventas')
    .ubicadoCon(p => p.locator('.tendencia-badge')),

  modeloUsado: Elemento.llamado('el modelo usado en el pronóstico')
    .ubicadoCon(p => p.locator('.results-card mat-card-subtitle')),

  filasDelPronostico: Elemento.llamado('las filas del detalle del pronóstico')
    .ubicadoCon(p => p.locator(`.results-table ${FILA_CON_DATOS}`)),

  // ── Pestañas con una tabla (Más Vendidos, Recomendaciones) ──
  filasDeLaPestana: Elemento.llamado('las filas de la tabla de la pestaña abierta')
    .ubicadoCon(p => p.locator(`${PESTANA_ABIERTA} ${FILA_CON_DATOS}`)),

  filtroDeRecomendaciones: Elemento.llamado('el filtro de recomendaciones')
    .ubicadoCon(p => p.getByLabel('Filtrar por código o descripción')),

  contadorDeRecomendaciones: Elemento.llamado('el contador de recomendaciones')
    .ubicadoCon(p => p.locator(`${PESTANA_ABIERTA} .filter-count`)),
};
