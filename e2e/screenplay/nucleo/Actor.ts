import { test } from '@playwright/test';
import type { Actividad } from './Actividad';
import type { Habilidad, TipoDeHabilidad } from './Habilidad';
import type { Pregunta } from './Pregunta';

/**
 * ACTOR: la persona (o el rol) que usa el sistema en una prueba.
 *
 *   const ada = Actor.llamado('Ada Administradora').quienPuede(NavegarPorLaWeb.con(pagina));
 *   await ada.intenta(IniciarSesion.conSusCredenciales());
 *   const opciones = await ada.responde(LasOpcionesDelMenu.visibles());
 *
 * El actor no sabe nada de Playwright: solo guarda sus habilidades, ejecuta
 * actividades y responde preguntas. Cada actividad queda como un paso con
 * nombre en el informe («Ada Administradora inicia sesión…»).
 */
export class Actor {
  private readonly habilidades: Habilidad[] = [];
  private readonly apuntes = new Map<string, unknown>();

  private constructor(readonly nombre: string) {}

  static llamado(nombre: string): Actor {
    return new Actor(nombre);
  }

  /** Le da al actor una o varias habilidades. */
  quienPuede(...habilidades: Habilidad[]): this {
    this.habilidades.push(...habilidades);
    return this;
  }

  /** Devuelve la habilidad pedida o falla explicando cuál le falta al actor. */
  habilidadDe<H extends Habilidad>(tipo: TipoDeHabilidad<H>): H {
    const habilidad = this.habilidades.find(h => h instanceof tipo);
    if (!habilidad) {
      throw new Error(`${this.nombre} no tiene la habilidad «${tipo.name}». Désela con quienPuede(…).`);
    }
    return habilidad as H;
  }

  /** Ejecuta las actividades en orden. Cada una es un paso del informe. */
  async intenta(...actividades: Actividad[]): Promise<void> {
    for (const actividad of actividades) {
      await test.step(
        `${this.nombre} ${actividad.descripcion}`,
        () => actividad.realizadaPor(this),
        { box: true },   // si falla, el informe señala la línea de la prueba, no esta
      );
    }
  }

  /** Observa el sistema y devuelve la respuesta a la pregunta. */
  responde<T>(pregunta: Pregunta<T>): Promise<T> {
    return pregunta.respondidaPor(this);
  }

  /** Apunta un dato para usarlo más adelante en la misma prueba. */
  recuerda(clave: string, valor: unknown): void {
    this.apuntes.set(clave, valor);
  }

  /** Recupera un dato apuntado con `recuerda`. */
  recordado<T>(clave: string): T {
    if (!this.apuntes.has(clave)) {
      throw new Error(`${this.nombre} no recuerda nada llamado «${clave}».`);
    }
    return this.apuntes.get(clave) as T;
  }

  /** Cierra lo que sus habilidades tengan abierto. Lo llama el reparto al acabar la prueba. */
  async seDespide(): Promise<void> {
    for (const habilidad of this.habilidades) {
      await habilidad.alTerminar();
    }
  }
}
