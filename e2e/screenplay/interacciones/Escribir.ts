import { NavegarPorLaWeb } from '../habilidades';
import type { Elemento } from '../interfaz/Elemento';
import { Interaccion } from '../nucleo';

const escribir = (texto: string, mostrado: string) => ({
  en: (elemento: Elemento) =>
    Interaccion.donde(`escribe ${mostrado} en ${elemento.descripcion}`, async actor => {
      await elemento.en(actor.habilidadDe(NavegarPorLaWeb).pagina).fill(texto);
    }),
});

export const Escribir = {
  elTexto: (texto: string) => escribir(texto, `«${texto}»`),

  /** Igual que elTexto, pero sin dejar la contraseña escrita en el informe. */
  laClave: (clave: string) => escribir(clave, 'la contraseña'),
};
