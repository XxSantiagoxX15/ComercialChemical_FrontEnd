/**
 * HABILIDAD: algo que un actor PUEDE hacer porque tiene con qué hacerlo
 * (un navegador, un buzón de correo, unas credenciales…).
 *
 * Las habilidades son lo único del patrón que conoce las herramientas
 * (Playwright, el sistema de archivos). Las interacciones y las preguntas las
 * piden al actor; las tareas y las pruebas ni se enteran de que existen.
 */
export abstract class Habilidad {
  /** Libera lo que la habilidad tenga abierto (por ejemplo, el navegador). */
  async alTerminar(): Promise<void> {
    // La mayoría de las habilidades no tiene nada que cerrar.
  }
}

/** Una clase de habilidad; sirve para pedirla: `actor.habilidadDe(NavegarPorLaWeb)`. */
export type TipoDeHabilidad<H extends Habilidad> = Function & { prototype: H };
