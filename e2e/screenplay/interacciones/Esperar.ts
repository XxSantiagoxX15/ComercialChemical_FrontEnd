import { expect } from '@playwright/test';
import { NavegarPorLaWeb } from '../habilidades';
import type { Elemento } from '../interfaz/Elemento';
import { Interaccion } from '../nucleo';

export const Esperar = {
  aQueAparezca: (elemento: Elemento, milisegundos?: number) =>
    Interaccion.donde(`espera a que aparezca ${elemento.descripcion}`, async actor => {
      const pagina = actor.habilidadDe(NavegarPorLaWeb).pagina;
      await expect(elemento.en(pagina).first()).toBeVisible({ timeout: milisegundos });
    }),

  aQueDesaparezca: (elemento: Elemento, milisegundos?: number) =>
    Interaccion.donde(`espera a que desaparezca ${elemento.descripcion}`, async actor => {
      const pagina = actor.habilidadDe(NavegarPorLaWeb).pagina;
      await expect(elemento.en(pagina)).toHaveCount(0, { timeout: milisegundos });
    }),

  aLaRuta: (ruta: string) =>
    Interaccion.donde(`espera a llegar a ${ruta}`, async actor => {
      const pagina = actor.habilidadDe(NavegarPorLaWeb).pagina;
      await expect(pagina).toHaveURL(url => url.pathname === ruta);
    }),
};
