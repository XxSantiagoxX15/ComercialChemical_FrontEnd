import { ObservarLaRed } from '../habilidades';
import { Pregunta } from '../nucleo';

export const LoQueViajoPorLaRed = {
  /** Todas las peticiones a la API (y sus respuestas) desde que el actor abrió el navegador. */
  haciaLaApi: () =>
    Pregunta.sobre('lo que viajó por la red hacia la API', async actor =>
      actor.habilidadDe(ObservarLaRed).intercambios()),

  /** Solo las de una ruta concreta, p. ej. «/api/auth/login/». */
  hacia: (ruta: string) =>
    Pregunta.sobre(`lo que viajó por la red hacia ${ruta}`, async actor =>
      (await actor.habilidadDe(ObservarLaRed).intercambios()).filter(i => i.ruta === ruta)),
};
