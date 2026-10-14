import { expect } from '@playwright/test';
import { Interaccion } from '../nucleo';
import type { Pregunta } from '../nucleo';

/**
 * EXPECTATIVA: lo que se espera de la respuesta a una pregunta. Se escribe
 * para leerse detrás de la pregunta: «la ruta actual» + «contiene "/dashboard"».
 */
export interface Expectativa<T> {
  readonly descripcion: string;
  comprobar(valor: T): void;
}

const expectativa = <T>(descripcion: string, comprobar: (valor: T) => void): Expectativa<T> =>
  ({ descripcion, comprobar });

const mostrar = (valor: unknown) => JSON.stringify(valor);

export const esIgualA = <T>(esperado: T) =>
  expectativa<T>(`es igual a ${mostrar(esperado)}`, valor => expect(valor as unknown).toEqual(esperado));

export const esVerdadero = () =>
  expectativa<boolean>('es verdadero', valor => expect(valor).toBe(true));

export const esFalso = () =>
  expectativa<boolean>('es falso', valor => expect(valor).toBe(false));

export const contiene = (parte: string) =>
  expectativa<string>(`contiene ${mostrar(parte)}`, valor => expect(valor).toContain(parte));

export const coincideCon = (patron: RegExp) =>
  expectativa<string>(`coincide con ${patron}`, valor => expect(valor).toMatch(patron));

export const incluye = <T>(...elementos: T[]) =>
  expectativa<T[]>(`incluye ${mostrar(elementos)}`, valor => {
    for (const elemento of elementos) expect(valor).toContainEqual(elemento);
  });

export const noIncluye = <T>(...elementos: T[]) =>
  expectativa<T[]>(`no incluye ${mostrar(elementos)}`, valor => {
    for (const elemento of elementos) expect(valor).not.toContainEqual(elemento);
  });

export const tieneTamano = (cantidad: number) =>
  expectativa<unknown[]>(`tiene ${cantidad} elemento(s)`, valor => expect(valor).toHaveLength(cantidad));

/** Para comprobaciones propias de una sola prueba. */
export const cumple = <T>(descripcion: string, comprobar: (valor: T) => void) =>
  expectativa<T>(descripcion, comprobar);

/**
 * La comprobación de una prueba: hace la pregunta y compara la respuesta con
 * lo esperado. Como la pantalla tarda en actualizarse, pregunta de nuevo
 * hasta que la respuesta sea la esperada o se acabe el tiempo.
 */
export const Verificar = {
  que: <T>(pregunta: Pregunta<T>, esperado: Expectativa<T>, milisegundos = 10_000) =>
    Interaccion.donde(`comprueba que ${pregunta.descripcion} ${esperado.descripcion}`, async actor => {
      await expect(async () => {
        esperado.comprobar(await actor.responde(pregunta));
      }).toPass({ timeout: milisegundos });
    }),
};
