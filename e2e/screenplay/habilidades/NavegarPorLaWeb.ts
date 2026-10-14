import type { Page } from '@playwright/test';
import { Habilidad } from '../nucleo';

/**
 * Habilidad de usar la aplicación en un navegador. Envuelve la página de
 * Playwright: es el único punto por donde las interacciones y las preguntas
 * llegan a ella.
 */
export class NavegarPorLaWeb extends Habilidad {
  private constructor(readonly pagina: Page) {
    super();
  }

  static con(pagina: Page): NavegarPorLaWeb {
    return new NavegarPorLaWeb(pagina);
  }

  /** Cada actor tiene su propio navegador (su propia sesión): se cierra con él. */
  override async alTerminar(): Promise<void> {
    await this.pagina.context().close();
  }
}
