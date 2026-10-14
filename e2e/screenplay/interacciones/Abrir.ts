import { NavegarPorLaWeb } from '../habilidades';
import { Interaccion } from '../nucleo';

/** Escribir una dirección en la barra del navegador. */
export const Abrir = {
  laRuta: (ruta: string) =>
    Interaccion.donde(`abre la dirección ${ruta}`, async actor => {
      await actor.habilidadDe(NavegarPorLaWeb).pagina.goto(ruta);
    }),
};
