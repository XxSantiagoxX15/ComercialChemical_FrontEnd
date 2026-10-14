import { menuDe, MODULOS_POR_DEFECTO } from '../datos/modulos';
import { expect, test, USUARIOS } from '../reparto';
import {
  CambiarElEstado, CrearElUsuario, ElAviso, ElCodigoDeRecuperacion, ElEnlaceDelCorreo,
  ElErrorDeInicioDeSesion, ElTexto, ElUltimoCorreo, EnviarUnCodigo, FormularioDeUsuario,
  IniciarSesion, LasOpcionesDelMenu, LosCorreos, PantallaDeUsuarios, SiSeVe, Verificar,
  coincideCon, contiene, cumple, esIgualA, esVerdadero, tieneTamano,
} from '../screenplay';
import type { Cuenta } from '../screenplay';

/** Una persona nueva en cada ejecución, para poder repetir la prueba sin chocar con la anterior. */
const personaNueva = (nombre: string): Cuenta => ({
  nombre,
  correo: `${nombre.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@chem.test`,
  clave: 'Inicial#2026',
  rol: 'Analista_Inventarios',
});

test.describe('Gestión de usuarios', () => {

  test('al crear un usuario le llega el correo de bienvenida y ya puede entrar', async ({ administrador, nuevoActor }) => {
    const cuenta = personaNueva('Nora Nueva');
    const nora = await nuevoActor(cuenta);

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      CrearElUsuario.conLosDatos(cuenta),
      Verificar.que(ElAviso.emergente(), contiene(`Se envió un correo de bienvenida a ${cuenta.correo}`)),
      Verificar.que(ElTexto.de(PantallaDeUsuarios.estadoDe(cuenta.correo)), esIgualA('Activo')),
    );

    await nora.intenta(
      Verificar.que(LosCorreos.recibidos(), tieneTamano(1)),
      Verificar.que(ElUltimoCorreo.recibido(), cumple('es el correo de bienvenida', correo => {
        expect(correo.asunto).toBe('Bienvenido a CHEM-MODINV');
        expect(correo.texto).toContain(`Hola, ${cuenta.nombre}`);
        expect(correo.texto).toContain(`Usuario: ${cuenta.correo}`);
        expect(correo.texto).toContain('Rol: Analista de Inventarios');
        expect(correo.html).toContain('cid:logo');
        expect(correo.conLogo).toBe(true);
        // La contraseña nunca viaja por correo.
        expect(correo.texto + correo.html).not.toContain(cuenta.clave);
      })),
      Verificar.que(ElEnlaceDelCorreo.recibido(), coincideCon(/\/login$/)),
    );

    // Entra con la contraseña que le dio el Administrador y ve el menú de su rol.
    await nora.intenta(
      IniciarSesion.conSusCredenciales(),
      Verificar.que(LasOpcionesDelMenu.visibles(), esIgualA(menuDe(MODULOS_POR_DEFECTO['Analista_Inventarios']))),
    );
  });

  test('no se puede crear un usuario con un correo que ya existe', async ({ administrador }) => {
    const repetido: Cuenta = { ...personaNueva('Rita Repetida'), correo: USUARIOS.analista.correo };

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      CrearElUsuario.intentandoCon(repetido),
      Verificar.que(SiSeVe.a(FormularioDeUsuario.error), esVerdadero()),
      // La ventana sigue abierta: no se creó nada.
      Verificar.que(SiSeVe.a(FormularioDeUsuario.ventana), esVerdadero()),
    );
  });

  test('un usuario desactivado no puede entrar hasta que lo reactivan', async ({ administrador, nuevoActor }) => {
    const cuenta = personaNueva('Ines Inactiva');
    const ines = await nuevoActor(cuenta);

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      CrearElUsuario.conLosDatos(cuenta),
      CambiarElEstado.delUsuario(cuenta.correo),
      Verificar.que(ElTexto.de(PantallaDeUsuarios.estadoDe(cuenta.correo)), esIgualA('Inactivo')),
    );
    await ines.intenta(
      IniciarSesion.sinEsperarElResultado(),
      Verificar.que(ElErrorDeInicioDeSesion.mostrado(), contiene('Credenciales inválidas')),
    );

    await administrador.intenta(
      CambiarElEstado.delUsuario(cuenta.correo),
      Verificar.que(ElTexto.de(PantallaDeUsuarios.estadoDe(cuenta.correo)), esIgualA('Activo')),
    );
    await ines.intenta(IniciarSesion.conSusCredenciales());
  });

  test('el Administrador envía un código para que otro usuario restablezca su contraseña', async ({ administrador, compras }) => {
    const correoDeCarla = USUARIOS.compras.correo;

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      EnviarUnCodigo.alUsuario(correoDeCarla),
      Verificar.que(ElAviso.emergente(), contiene(`Se envió un código a ${correoDeCarla}`)),
    );

    // A Carla le llega el código, con la explicación de que lo pidió un administrador.
    await compras.intenta(
      Verificar.que(ElCodigoDeRecuperacion.recibidoPorCorreo(), coincideCon(/^\d{6}$/)),
      Verificar.que(ElUltimoCorreo.recibido(),
        cumple('explica quién lo pidió', correo =>
          expect(correo.texto).toContain('Un administrador solicitó restablecer la contraseña'))),
    );
  });
});
