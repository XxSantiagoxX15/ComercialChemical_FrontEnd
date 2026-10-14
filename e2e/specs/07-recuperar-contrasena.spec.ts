import { expect, test, USUARIOS } from '../reparto';
import {
  Abrir, CambiarSuClave, Clic, ElEnlaceDelCorreo, ElErrorDeInicioDeSesion, ElTexto, ElUltimoCorreo,
  ElUsuarioEnSesion, Escribir, Esperar, IniciarSesion, LaRutaActual, LeerElCodigo, LosCorreos,
  PantallaDeLogin, PantallaDeRecuperacion, PedirUnCodigo, RevisarSuCorreo, SiEstaHabilitado,
  TenerUnaCuenta, Verificar, contiene, cumple, esFalso, esIgualA, tieneTamano,
} from '../screenplay';
import { ENTORNO } from '../soporte/entorno';

test.describe('Recuperar la contraseña con un código enviado al correo', () => {

  test('Olga recibe el código por correo, cambia su contraseña y entra con la nueva', async ({ olvidadizo: olga }) => {
    const cuenta = olga.habilidadDe(TenerUnaCuenta);
    const claveAnterior = cuenta.clave;
    const claveNueva = `Nueva#${Date.now()}`;

    await olga.intenta(
      PedirUnCodigo.paraSuCuenta(),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Escribe el código')),
      LeerElCodigo.queLeLlegoPorCorreo(),
    );

    // El correo es el esperado: asunto con el código, logo incrustado y enlace a la pantalla.
    const codigo = olga.recordado<string>('codigo');
    await olga.intenta(
      Verificar.que(ElUltimoCorreo.recibido(), cumple('es el correo del código', correo => {
        expect(correo.asunto).toBe(`${codigo} es tu código para restablecer la contraseña`);
        expect(correo.texto).toContain(`Hola, ${cuenta.nombre}`);
        expect(correo.html).toContain(codigo);
        expect(correo.html).toContain('cid:logo');
        expect(correo.conLogo).toBe(true);
      })),
      Verificar.que(ElEnlaceDelCorreo.recibido(),
        contiene(`/recuperar?correo=${encodeURIComponent(cuenta.correo)}`)),
    );

    // Un código equivocado no sirve…
    const codigoEquivocado = codigo === '000000' ? '111111' : '000000';
    await olga.intenta(
      CambiarSuClave.conElCodigo(codigoEquivocado, claveNueva),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.error), contiene('El código no es válido o ya venció')),
    );

    // …y con el correcto la contraseña cambia.
    await olga.intenta(
      CambiarSuClave.conElCodigoQueRecibio(claveNueva),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Contraseña actualizada')),
      Clic.en(PantallaDeRecuperacion.irAlLogin),
      Esperar.aLaRuta(PantallaDeLogin.ruta),
    );

    // La anterior ya no entra; la nueva sí.
    await olga.intenta(
      IniciarSesion.con(cuenta.correo, claveAnterior),
      Verificar.que(ElErrorDeInicioDeSesion.mostrado(), contiene('Credenciales inválidas')),
      IniciarSesion.conSusCredenciales(),
      Verificar.que(ElUsuarioEnSesion.segunElEncabezado(),
        cumple('es Olga', usuario => expect(usuario.nombre).toBe(cuenta.nombre))),
    );

    // Y el código, ya usado, no sirve por segunda vez.
    await olga.intenta(
      Abrir.laRuta(`/recuperar?correo=${encodeURIComponent(cuenta.correo)}`),
      CambiarSuClave.conElCodigo(codigo, 'Otra#Clave2026'),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.error), contiene('El código no es válido o ya venció')),
    );
  });

  test('pedir otro código enseguida no envía un segundo correo', async ({ analista }) => {
    await analista.intenta(
      PedirUnCodigo.paraSuCuenta(),
      Verificar.que(LosCorreos.recibidos(), tieneTamano(1)),
      Clic.en(PantallaDeRecuperacion.enviarOtroCodigo),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.aviso), contiene('Si pasó más de un minuto')),
      Verificar.que(LosCorreos.recibidos(), tieneTamano(1)),
    );
  });

  test('con un correo que no existe la pantalla responde igual y no se envía nada', async ({ visitante }) => {
    const inexistente = `nadie.${Date.now()}@chem.test`;

    // El visitante puede mirar el buzón de esa dirección para comprobar que sigue vacío.
    visitante.quienPuede(RevisarSuCorreo.en(ENTORNO.correos, inexistente));

    await visitante.intenta(
      PedirUnCodigo.paraElCorreo(inexistente),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Escribe el código')),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.guia), contiene(inexistente)),
      Verificar.que(LosCorreos.recibidos(), tieneTamano(0)),
    );
  });

  test('el enlace del correo lleva directo al paso del código y exige repetir bien la contraseña', async ({ visitante }) => {
    const correo = USUARIOS.analista.correo;

    await visitante.intenta(
      Abrir.laRuta(`/recuperar?correo=${encodeURIComponent(correo)}`),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Escribe el código')),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.guia), contiene(correo)),
      Escribir.elTexto('123456').en(PantallaDeRecuperacion.codigo),
      Escribir.laClave('Clave#Uno2026').en(PantallaDeRecuperacion.claveNueva),
      Escribir.laClave('Clave#Dos2026').en(PantallaDeRecuperacion.repetirClave),
      Verificar.que(ElTexto.de(PantallaDeRecuperacion.clavesDistintas), contiene('no son iguales')),
      Verificar.que(SiEstaHabilitado.a(PantallaDeRecuperacion.cambiarClave), esFalso()),
      Verificar.que(LaRutaActual.delNavegador(), esIgualA(PantallaDeRecuperacion.ruta)),
    );
  });
});
