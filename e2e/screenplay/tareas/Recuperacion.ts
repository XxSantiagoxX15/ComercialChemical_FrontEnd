import { TenerUnaCuenta } from '../habilidades';
import { Abrir, Clic, Escribir, Esperar, Verificar, coincideCon } from '../interacciones';
import { PantallaDeLogin } from '../interfaz/PantallaDeLogin';
import { PantallaDeRecuperacion } from '../interfaz/PantallaDeRecuperacion';
import { Tarea } from '../nucleo';
import { ElCodigoDeRecuperacion } from '../preguntas/DelCorreo';

export const PedirUnCodigo = {
  /** Desde el login: «¿Olvidaste tu contraseña?», su correo y «Enviar código». */
  paraSuCuenta: () =>
    Tarea.dondeElActor('pide un código para recuperar su contraseña', async actor => {
      await actor.intenta(PedirUnCodigo.paraElCorreo(actor.habilidadDe(TenerUnaCuenta).correo));
    }),

  paraElCorreo: (correo: string) =>
    Tarea.donde(`pide un código de recuperación para ${correo}`,
      Abrir.laRuta(PantallaDeLogin.ruta),
      Clic.en(PantallaDeLogin.olvideMiClave),
      Esperar.aLaRuta(PantallaDeRecuperacion.ruta),
      Escribir.elTexto(correo).en(PantallaDeRecuperacion.correo),
      Clic.en(PantallaDeRecuperacion.enviarCodigo),
      Esperar.aQueAparezca(PantallaDeRecuperacion.codigo),
    ),
};

export const LeerElCodigo = {
  /** Espera a que llegue el correo y apunta el código para usarlo después. */
  queLeLlegoPorCorreo: () =>
    Tarea.dondeElActor('lee en su correo el código de recuperación', async actor => {
      await actor.intenta(Verificar.que(ElCodigoDeRecuperacion.recibidoPorCorreo(), coincideCon(/^\d{6}$/)));
      actor.recuerda('codigo', await actor.responde(ElCodigoDeRecuperacion.recibidoPorCorreo()));
    }),
};

export const CambiarSuClave = {
  /** Rellena el paso del código (código, contraseña nueva dos veces) y lo envía. */
  conElCodigo: (codigo: string, nueva: string) =>
    Tarea.donde('envía el código con su contraseña nueva',
      Escribir.elTexto(codigo).en(PantallaDeRecuperacion.codigo),
      Escribir.laClave(nueva).en(PantallaDeRecuperacion.claveNueva),
      Escribir.laClave(nueva).en(PantallaDeRecuperacion.repetirClave),
      Clic.en(PantallaDeRecuperacion.cambiarClave),
    ),

  /** Usa el código que apuntó al leer su correo y, desde ahí, recuerda la contraseña nueva. */
  conElCodigoQueRecibio: (nueva: string) =>
    Tarea.dondeElActor('cambia su contraseña con el código que recibió', async actor => {
      await actor.intenta(
        CambiarSuClave.conElCodigo(actor.recordado<string>('codigo'), nueva),
        Esperar.aQueAparezca(PantallaDeRecuperacion.irAlLogin),
      );
      actor.habilidadDe(TenerUnaCuenta).cambiaSuClavePor(nueva);
    }),
};
