import type { Locator, Page } from '@playwright/test';

/**
 * ELEMENTO: una parte de la pantalla con nombre propio («el botón Ingresar»).
 * Guarda CÓMO encontrarla; no la busca hasta que una interacción o una
 * pregunta la necesita. Si la pantalla cambia, solo se toca el mapa de esa
 * pantalla (los archivos de esta carpeta), no las tareas ni las pruebas.
 */
export class Elemento {
  private constructor(
    readonly descripcion: string,
    private readonly localizar: (pagina: Page) => Locator,
  ) {}

  static llamado(descripcion: string) {
    return {
      ubicadoCon: (localizar: (pagina: Page) => Locator) => new Elemento(descripcion, localizar),
    };
  }

  en(pagina: Page): Locator {
    return this.localizar(pagina);
  }

  /** Para armar frases: «del botón Ingresar», «de la opción Usuarios». */
  get conDe(): string {
    return this.descripcion.startsWith('el ')
      ? `del ${this.descripcion.slice(3)}`
      : `de ${this.descripcion}`;
  }
}

/**
 * Fila con datos de una tabla de Angular Material. Se excluye la fila
 * «No hay registros», que Material pinta con la misma clase que las demás.
 */
export const FILA_CON_DATOS = 'tr.mat-mdc-row:not(.mat-mdc-no-data-row)';
