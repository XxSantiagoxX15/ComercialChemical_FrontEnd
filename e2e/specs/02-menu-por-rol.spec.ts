import { fueraDelMenuDe, menuDe, MODULOS_POR_DEFECTO } from '../datos/modulos';
import type { Rol } from '../datos/modulos';
import { expect, test } from '../reparto';
import {
  ElUsuarioEnSesion, IniciarSesion, IrA, LaRutaActual, LasOpcionesDelMenu, Verificar,
  cumple, esIgualA,
} from '../screenplay';
import type { Actor } from '../screenplay';

/** El menú tiene justo las opciones del rol y cada una abre su pantalla sin perder la sesión. */
async function veSusModulosYAbreCadaUno(actor: Actor, rol: Rol) {
  const opciones = menuDe(MODULOS_POR_DEFECTO[rol]);

  await actor.intenta(
    IniciarSesion.conSusCredenciales(),
    Verificar.que(LasOpcionesDelMenu.visibles(), esIgualA(opciones)),
  );
  for (const opcion of opciones) {
    await actor.intenta(
      IrA.elModulo(opcion),
      Verificar.que(ElUsuarioEnSesion.segunElEncabezado(),
        cumple('sigue mostrando su nombre', usuario => expect(usuario.nombre).not.toBe(''))),
    );
  }
}

/** Escribir a mano la dirección de un módulo ajeno lo devuelve a su pantalla inicial. */
async function noEntraPorLaDireccionALoQueNoTiene(actor: Actor, rol: Rol) {
  await actor.intenta(IniciarSesion.conSusCredenciales());

  for (const modulo of fueraDelMenuDe(MODULOS_POR_DEFECTO[rol])) {
    await actor.intenta(
      IrA.laDireccion(modulo.ruta),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA('/dashboard')),
    );
  }
}

test.describe('El menú muestra solo los módulos del rol', () => {

  test('el Administrador ve todos los módulos y puede abrir cada uno', async ({ administrador }) => {
    await veSusModulosYAbreCadaUno(administrador, 'Administrador');
  });

  test('el Analista de Inventarios ve solo sus módulos y puede abrir cada uno', async ({ analista }) => {
    await veSusModulosYAbreCadaUno(analista, 'Analista_Inventarios');
  });

  test('el Responsable de Compras ve solo sus módulos y puede abrir cada uno', async ({ compras }) => {
    await veSusModulosYAbreCadaUno(compras, 'Responsable_Compras');
  });

  test('el Analista no entra a un módulo ajeno escribiendo su dirección', async ({ analista }) => {
    await noEntraPorLaDireccionALoQueNoTiene(analista, 'Analista_Inventarios');
  });

  test('el Responsable de Compras no entra a un módulo ajeno escribiendo su dirección', async ({ compras }) => {
    await noEntraPorLaDireccionALoQueNoTiene(compras, 'Responsable_Compras');
  });

  test('sin sesión, cualquier dirección de la aplicación lleva al login', async ({ visitante }) => {
    for (const ruta of ['/dashboard', '/usuarios', '/importacion']) {
      await visitante.intenta(
        IrA.laDireccion(ruta),
        Verificar.que(LaRutaActual.delNavegador(), esIgualA('/login')),
      );
    }
  });
});
