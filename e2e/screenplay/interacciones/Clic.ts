import { NavegarPorLaWeb } from '../habilidades';
import type { Elemento } from '../interfaz/Elemento';
import { Interaccion } from '../nucleo';

export const Clic = {
  en: (elemento: Elemento) =>
    Interaccion.donde(`hace clic en ${elemento.descripcion}`, async actor => {
      await elemento.en(actor.habilidadDe(NavegarPorLaWeb).pagina).click();
    }),
};
