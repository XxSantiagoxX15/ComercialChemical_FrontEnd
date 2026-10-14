import { NavegarPorLaWeb } from '../habilidades';
import type { Elemento } from '../interfaz/Elemento';
import { Pregunta } from '../nucleo';

const limpio = (texto: string) => texto.replace(/\s+/g, ' ').trim();

/**
 * Lee una tabla de Angular Material: de cada fila toma las columnas pedidas
 * (por el nombre con que la pantalla las declara, p. ej. «stock_actual») y
 * devuelve un objeto por fila.
 */
export const LasFilas = {
  de: (filas: Elemento) => ({
    conLasColumnas: <C extends string>(...columnas: C[]) =>
      Pregunta.sobre(`${filas.descripcion} (${columnas.join(', ')})`, async actor => {
        const pagina = actor.habilidadDe(NavegarPorLaWeb).pagina;
        const resultado: Record<C, string>[] = [];
        for (const fila of await filas.en(pagina).all()) {
          const dato = {} as Record<C, string>;
          for (const columna of columnas) {
            dato[columna] = limpio(await fila.locator(`.mat-column-${columna}`).innerText({ timeout: 2_000 }));
          }
          resultado.push(dato);
        }
        return resultado;
      }),
  }),
};
