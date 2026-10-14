import { ROL_EN_PANTALLA, test, USUARIOS } from '../reparto';
import {
  CerrarSesion, Clic, ElErrorDeInicioDeSesion, ElUsuarioEnSesion, Escribir, IniciarSesion, IrA,
  LaRutaActual, LosTextos, PantallaDeLogin, SiEstaHabilitado, SiHaySesionGuardada, SiSeVe, Verificar,
  contiene, esFalso, esIgualA, esVerdadero,
} from '../screenplay';

/** El backend bloquea la cuenta al quinto intento fallido (MAX_FAILED_ATTEMPTS). */
const INTENTOS_PERMITIDOS = 5;

test.describe('Inicio y cierre de sesión', () => {

  test('el Administrador entra con sus credenciales y llega al Dashboard', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA('/dashboard')),
      Verificar.que(ElUsuarioEnSesion.segunElEncabezado(), esIgualA({
        nombre: USUARIOS.administrador.nombre,
        rol: ROL_EN_PANTALLA['Administrador'],
      })),
      Verificar.que(SiHaySesionGuardada.enElNavegador(), esVerdadero()),
    );
  });

  test('con una contraseña equivocada no entra y ve «Credenciales inválidas»', async ({ analista }) => {
    await analista.intenta(
      IniciarSesion.conUnaClaveEquivocada(),
      Verificar.que(ElErrorDeInicioDeSesion.mostrado(), contiene('Credenciales inválidas')),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA('/login')),
      Verificar.que(SiHaySesionGuardada.enElNavegador(), esFalso()),
    );
  });

  test('tras cinco contraseñas equivocadas la cuenta se bloquea: ni la correcta entra', async ({ descuidado }) => {
    for (let intento = 1; intento <= INTENTOS_PERMITIDOS; intento++) {
      await descuidado.intenta(IniciarSesion.conUnaClaveEquivocada());
    }

    await descuidado.intenta(
      IniciarSesion.sinEsperarElResultado(),
      Verificar.que(SiSeVe.a(PantallaDeLogin.error), esVerdadero()),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA('/login')),
      Verificar.que(SiHaySesionGuardada.enElNavegador(), esFalso()),
    );
  });

  test('el botón Ingresar no se activa hasta que el correo y la contraseña son válidos', async ({ visitante }) => {
    await visitante.intenta(
      IrA.laDireccion('/login'),
      Verificar.que(SiEstaHabilitado.a(PantallaDeLogin.ingresar), esFalso()),
      Escribir.elTexto('esto-no-es-un-correo').en(PantallaDeLogin.correo),
      Escribir.laClave('123').en(PantallaDeLogin.clave),
      Clic.en(PantallaDeLogin.titulo),
      Verificar.que(LosTextos.de(PantallaDeLogin.erroresDeCampo),
        esIgualA(['Formato de correo inválido', 'Mínimo 6 caracteres'])),
      Verificar.que(SiEstaHabilitado.a(PantallaDeLogin.ingresar), esFalso()),
      Escribir.elTexto('alguien@chem.test').en(PantallaDeLogin.correo),
      Escribir.laClave('123456').en(PantallaDeLogin.clave),
      Verificar.que(SiEstaHabilitado.a(PantallaDeLogin.ingresar), esVerdadero()),
    );
  });

  test('al cerrar sesión vuelve al login y ya no puede entrar al Dashboard', async ({ compras }) => {
    await compras.intenta(
      IniciarSesion.conSusCredenciales(),
      CerrarSesion.desdeElMenu(),
      Verificar.que(SiHaySesionGuardada.enElNavegador(), esFalso()),
      IrA.laDireccion('/dashboard'),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA('/login')),
    );
  });
});
