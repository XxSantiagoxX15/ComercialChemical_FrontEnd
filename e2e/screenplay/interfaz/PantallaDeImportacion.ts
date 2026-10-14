import { Elemento, FILA_CON_DATOS } from './Elemento';

export const PantallaDeImportacion = {
  ruta: '/importacion',

  tipoSaldos: Elemento.llamado('el botón «Saldos vs Existencias Mínimas»')
    .ubicadoCon(p => p.locator('.tipo-buttons').getByRole('button', { name: 'Saldos vs Existencias Mínimas' })),

  tipoKardex: Elemento.llamado('el botón «Kardex»')
    .ubicadoCon(p => p.locator('.tipo-buttons').getByRole('button', { name: 'Kardex' })),

  seleccionarArchivo: Elemento.llamado('el botón «Seleccionar archivo»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Seleccionar archivo' })),

  archivoElegido: Elemento.llamado('el nombre del archivo elegido')
    .ubicadoCon(p => p.locator('.drop-zone .file-name')),

  subir: Elemento.llamado('el botón «Subir Archivo»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Subir Archivo' })),

  cancelar: Elemento.llamado('el botón «Cancelar»')
    .ubicadoCon(p => p.locator('.file-actions').getByRole('button', { name: 'Cancelar' })),

  resultado: Elemento.llamado('el resultado de la importación')
    .ubicadoCon(p => p.locator('.upload-result')),

  tituloDelResultado: Elemento.llamado('el título del resultado de la importación')
    .ubicadoCon(p => p.locator('.upload-result strong')),

  mensajeDelResultado: Elemento.llamado('el mensaje del resultado de la importación')
    .ubicadoCon(p => p.locator('.upload-result p')),

  filasDelHistorial: Elemento.llamado('las filas del historial de importaciones')
    .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`)),
};
