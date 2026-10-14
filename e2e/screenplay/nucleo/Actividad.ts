import type { Actor } from './Actor';

/**
 * ACTIVIDAD: cualquier cosa que un actor puede intentar. Hay dos clases:
 *
 *   · Interacción → un gesto mínimo sobre el sistema (clic, escribir, abrir).
 *   · Tarea       → un objetivo del negocio (iniciar sesión, importar un
 *                   informe), hecho a base de interacciones y de otras tareas.
 *
 * La descripción se escribe para leerse detrás del nombre del actor:
 * «Ada Administradora» + «inicia sesión con sus credenciales».
 */
export interface Actividad {
  readonly descripcion: string;
  realizadaPor(actor: Actor): Promise<void>;
}

/** Gesto mínimo. Es el único tipo de actividad que usa habilidades directamente. */
export class Interaccion implements Actividad {
  private constructor(
    readonly descripcion: string,
    private readonly accion: (actor: Actor) => Promise<void>,
  ) {}

  static donde(descripcion: string, accion: (actor: Actor) => Promise<void>): Interaccion {
    return new Interaccion(descripcion, accion);
  }

  realizadaPor(actor: Actor): Promise<void> {
    return this.accion(actor);
  }
}

/**
 * Objetivo del negocio. Nunca usa habilidades directamente: solo encadena
 * interacciones, otras tareas y, si tiene que decidir algo, preguntas.
 */
export class Tarea implements Actividad {
  private constructor(
    readonly descripcion: string,
    private readonly plan: (actor: Actor) => Promise<void>,
  ) {}

  /** Tarea que siempre hace los mismos pasos, en orden. */
  static donde(descripcion: string, ...pasos: Actividad[]): Tarea {
    return new Tarea(descripcion, actor => actor.intenta(...pasos));
  }

  /**
   * Tarea cuyos pasos dependen del actor (sus credenciales, por ejemplo) o de
   * lo que encuentre en pantalla. El plan recibe al actor y lo dirige con
   * `actor.intenta(…)` y `actor.responde(…)`.
   */
  static dondeElActor(descripcion: string, plan: (actor: Actor) => Promise<void>): Tarea {
    return new Tarea(descripcion, plan);
  }

  realizadaPor(actor: Actor): Promise<void> {
    return this.plan(actor);
  }
}
