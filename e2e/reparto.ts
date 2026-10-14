import { test as base, expect } from '@playwright/test';
import type { Browser } from '@playwright/test';
import { ROL_EN_PANTALLA, USUARIOS } from './datos/usuarios';
import type { Personaje } from './datos/usuarios';
import { Actor, NavegarPorLaWeb, ObservarLaRed, RevisarSuCorreo, TenerUnaCuenta } from './screenplay';
import type { Cuenta } from './screenplay';
import { ENTORNO } from './soporte/entorno';

/**
 * EL REPARTO: los actores que pueden aparecer en una prueba.
 *
 * Una prueba pide por nombre los que necesita y Playwright se los entrega ya
 * preparados, cada uno con su propio navegador (sesiones independientes):
 *
 *   test('…', async ({ administrador, analista }) => { … });
 *
 * Al terminar la prueba cada actor cierra su navegador.
 */
export interface Reparto {
  /** Ada Administradora — rol Administrador: lo ve y lo configura todo. */
  administrador: Actor;
  /** Andrés Analista — rol Analista de Inventarios. */
  analista: Actor;
  /** Carla Compras — rol Responsable de Compras. */
  compras: Actor;
  /** Olga Olvidadiza — olvidó su contraseña y la recupera por correo. */
  olvidadizo: Actor;
  /** Darío Descuidado — se equivoca de contraseña hasta bloquear su cuenta. */
  descuidado: Actor;
  /** Alguien sin cuenta: solo tiene un navegador. */
  visitante: Actor;
  /**
   * Para los personajes que nacen durante la prueba (por ejemplo, el usuario
   * que el Administrador acaba de crear): devuelve un actor con esa cuenta.
   */
  nuevoActor: (cuenta: Cuenta) => Promise<Actor>;
}

async function conNavegador(navegador: Browser, actor: Actor): Promise<Actor> {
  const pagina = await (await navegador.newContext()).newPage();
  return actor.quienPuede(NavegarPorLaWeb.con(pagina), ObservarLaRed.de(pagina));
}

/** Un actor con cuenta: navegador propio, sus credenciales y su buzón de correo. */
export async function contratar(navegador: Browser, cuenta: Cuenta): Promise<Actor> {
  const actor = await conNavegador(navegador, Actor.llamado(cuenta.nombre));
  return actor.quienPuede(
    TenerUnaCuenta.con(cuenta),
    RevisarSuCorreo.en(ENTORNO.correos, cuenta.correo),
  );
}

function personaje(clave: Personaje) {
  return async ({ browser }: { browser: Browser }, usar: (actor: Actor) => Promise<void>) => {
    const actor = await contratar(browser, USUARIOS[clave]);
    await usar(actor);
    await actor.seDespide();
  };
}

/**
 * Para preparar datos antes de un grupo de pruebas (test.beforeAll), donde
 * todavía no hay reparto: un personaje entra en escena, hace lo indicado y
 * se despide.
 */
export async function enEscena(
  navegador: Browser, clave: Personaje, guion: (actor: Actor) => Promise<void>,
): Promise<void> {
  const actor = await contratar(navegador, USUARIOS[clave]);
  try {
    await guion(actor);
  } finally {
    await actor.seDespide();
  }
}

export const test = base.extend<Reparto>({
  administrador: personaje('administrador'),
  analista: personaje('analista'),
  compras: personaje('compras'),
  olvidadizo: personaje('olvidadizo'),
  descuidado: personaje('descuidado'),

  visitante: async ({ browser }, usar) => {
    const actor = await conNavegador(browser, Actor.llamado('Un visitante'));
    await usar(actor);
    await actor.seDespide();
  },

  nuevoActor: async ({ browser }, usar) => {
    const creados: Actor[] = [];
    await usar(async cuenta => {
      const actor = await contratar(browser, cuenta);
      creados.push(actor);
      return actor;
    });
    for (const actor of creados) await actor.seDespide();
  },
});

export { expect, ROL_EN_PANTALLA, USUARIOS };
