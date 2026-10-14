import type { Actor } from './Actor';

/**
 * PREGUNTA: lo que un actor puede averiguar mirando el sistema (qué opciones
 * tiene el menú, qué mensaje apareció, qué viajó por la red…). No cambia nada:
 * solo observa y devuelve un valor, que luego se comprueba con `Verificar`.
 */
export class Pregunta<T> {
  private constructor(
    readonly descripcion: string,
    private readonly respuesta: (actor: Actor) => Promise<T>,
  ) {}

  static sobre<T>(descripcion: string, respuesta: (actor: Actor) => Promise<T>): Pregunta<T> {
    return new Pregunta(descripcion, respuesta);
  }

  respondidaPor(actor: Actor): Promise<T> {
    return this.respuesta(actor);
  }

  /** La misma pregunta, con la respuesta transformada. */
  convertidaCon<R>(descripcion: string, transformar: (valor: T) => R): Pregunta<R> {
    return new Pregunta(descripcion, async actor => transformar(await this.respuesta(actor)));
  }
}
