import { NavegarPorLaWeb } from '../habilidades';
import type { Elemento } from '../interfaz/Elemento';
import { Pregunta } from '../nucleo';

const limpio = (texto: string) => texto.replace(/\s+/g, ' ').trim();

/** Preguntas generales sobre lo que hay en pantalla. */

export const ElTexto = {
  de: (elemento: Elemento) =>
    Pregunta.sobre(`el texto ${elemento.conDe}`, async actor => {
      const destino = elemento.en(actor.habilidadDe(NavegarPorLaWeb).pagina);
      return (await destino.count()) ? limpio(await destino.first().innerText()) : '';
    }),
};

export const LosTextos = {
  de: (elemento: Elemento) =>
    Pregunta.sobre(`los textos ${elemento.conDe}`, async actor => {
      const textos = await elemento.en(actor.habilidadDe(NavegarPorLaWeb).pagina).allInnerTexts();
      return textos.map(limpio);
    }),
};

export const SiSeVe = {
  a: (elemento: Elemento) =>
    Pregunta.sobre(`si se ve ${elemento.descripcion}`, async actor =>
      elemento.en(actor.habilidadDe(NavegarPorLaWeb).pagina).first().isVisible()),
};

export const SiEstaHabilitado = {
  a: (elemento: Elemento) =>
    Pregunta.sobre(`si está habilitado ${elemento.descripcion}`, async actor =>
      elemento.en(actor.habilidadDe(NavegarPorLaWeb).pagina).first().isEnabled()),
};

export const LaRutaActual = {
  delNavegador: () =>
    Pregunta.sobre('la ruta actual del navegador', async actor =>
      new URL(actor.habilidadDe(NavegarPorLaWeb).pagina.url()).pathname),
};
