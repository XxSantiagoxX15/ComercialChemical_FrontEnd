import { menuDe, MODULOS, MODULOS_POR_DEFECTO, moduloDe } from '../datos/modulos';
import { test } from '../reparto';
import {
  AbrirLosPermisos, Clic, ConfigurarPermisos, ElTexto, ElTituloDeLaPantalla, IniciarSesion, IrA,
  LaRutaActual, LasOpcionesDelMenu, LasSeccionesDelMenu, PantallaSinAcceso, SiEstaActivo,
  SiLaImagenCargo, SiSePuedeCambiar, SiSeVe, VentanaDePermisos, Verificar,
  contiene, esFalso, esIgualA, esVerdadero, incluye, noIncluye,
} from '../screenplay';

const ROL = 'Responsable_Compras';
const DE_FABRICA = MODULOS_POR_DEFECTO[ROL];

test.describe('Permisos por rol', () => {

  // Cada prueba cambia los permisos del rol de Compras: al terminar se
  // devuelven a como estaban para no afectar a las pruebas siguientes.
  test.afterEach(async ({ administrador }) => {
    await administrador.intenta(ConfigurarPermisos.delRol(ROL).dejandoActivos(DE_FABRICA));
  });

  test('quitarle un módulo a un rol lo saca de su menú y le cierra la pantalla', async ({ administrador, compras }) => {
    const sinPronosticos = DE_FABRICA.filter(clave => clave !== 'pronosticos');

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ConfigurarPermisos.delRol(ROL).dejandoActivos(sinPronosticos),
    );

    await compras.intenta(
      IniciarSesion.conSusCredenciales(),
      Verificar.que(LasOpcionesDelMenu.visibles(), esIgualA(menuDe(sinPronosticos))),
      IrA.laDireccion(moduloDe('pronosticos').ruta),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA('/dashboard')),
    );
  });

  test('darle un módulo nuevo a un rol lo añade a su menú y le abre la pantalla', async ({ administrador, compras }) => {
    const conCalculadora = [...DE_FABRICA, 'calculadora_precios'];

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ConfigurarPermisos.delRol(ROL).dejandoActivos(conCalculadora),
    );

    await compras.intenta(
      IniciarSesion.conSusCredenciales(),
      Verificar.que(LasOpcionesDelMenu.visibles(), esIgualA(menuDe(conCalculadora))),
      IrA.elModulo('Calculadora de precios'),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA(moduloDe('calculadora_precios').ruta)),
    );
  });

  test('el cambio llega a quien ya tenía la sesión abierta, sin volver a entrar', async ({ administrador, compras }) => {
    await compras.intenta(
      IniciarSesion.conSusCredenciales(),
      Verificar.que(LasOpcionesDelMenu.visibles(), incluye('Pronósticos')),
    );

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ConfigurarPermisos.delRol(ROL).dejandoActivos(DE_FABRICA.filter(clave => clave !== 'pronosticos')),
    );

    // Carla sigue con su sesión: le basta moverse a otra pantalla.
    await compras.intenta(
      IrA.elModulo('Alertas'),
      Verificar.que(LasOpcionesDelMenu.visibles(), noIncluye('Pronósticos')),
    );
  });

  test('un rol sin ningún módulo ve la pantalla con el logo de la empresa', async ({ administrador, compras }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ConfigurarPermisos.delRol(ROL).dejandoActivos([]),
    );

    await compras.intenta(
      IniciarSesion.conSusCredenciales(),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA(PantallaSinAcceso.ruta)),
      Verificar.que(ElTexto.de(PantallaSinAcceso.titulo), contiene('Todavía no tienes módulos asignados')),
      Verificar.que(SiLaImagenCargo.de(PantallaSinAcceso.logo), esVerdadero()),
      Verificar.que(LasOpcionesDelMenu.visibles(), esIgualA([])),
      Verificar.que(LasSeccionesDelMenu.visibles(), esIgualA([])),
    );

    // Tampoco entra escribiendo una dirección: vuelve a la misma pantalla.
    await compras.intenta(
      IrA.laDireccion('/dashboard'),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA(PantallaSinAcceso.ruta)),
      Clic.en(PantallaSinAcceso.volverAComprobar),
      Verificar.que(ElTexto.de(PantallaSinAcceso.aviso), contiene('sigue sin módulos')),
    );

    // Cuando el Administrador le devuelve sus módulos, «Volver a comprobar» lo deja entrar.
    await administrador.intenta(ConfigurarPermisos.delRol(ROL).dejandoActivos(DE_FABRICA));
    await compras.intenta(
      Clic.en(PantallaSinAcceso.volverAComprobar),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA('/dashboard')),
      Verificar.que(LasOpcionesDelMenu.visibles(), esIgualA(menuDe(DE_FABRICA))),
      Verificar.que(ElTituloDeLaPantalla.actual(), contiene('Dashboard')),
    );
  });

  test('los permisos del Administrador no se pueden modificar', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      AbrirLosPermisos.delRol('Administrador'),
      Verificar.que(SiSeVe.a(VentanaDePermisos.avisoDelAdministrador), esVerdadero()),
    );
    for (const modulo of MODULOS) {
      await administrador.intenta(
        Verificar.que(SiEstaActivo.elModulo(modulo.enPermisos), esVerdadero()),
        Verificar.que(SiSePuedeCambiar.elModulo(modulo.enPermisos), esFalso()),
      );
    }
  });
});
