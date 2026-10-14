import { TenerUnaCuenta } from '../habilidades';
import { Abrir, Clic, Escribir, Esperar } from '../interacciones';
import { Aplicacion } from '../interfaz/Aplicacion';
import { PantallaDeLogin } from '../interfaz/PantallaDeLogin';
import { Tarea } from '../nucleo';

const enviarElFormulario = (correo: string, clave: string) => [
  Abrir.laRuta(PantallaDeLogin.ruta),
  Escribir.elTexto(correo).en(PantallaDeLogin.correo),
  Escribir.laClave(clave).en(PantallaDeLogin.clave),
  Clic.en(PantallaDeLogin.ingresar),
];

export const IniciarSesion = {
  /** Entra con el correo y la contraseña del propio actor y espera a estar dentro. */
  conSusCredenciales: () =>
    Tarea.dondeElActor('inicia sesión con sus credenciales', async actor => {
      const cuenta = actor.habilidadDe(TenerUnaCuenta);
      await actor.intenta(
        ...enviarElFormulario(cuenta.correo, cuenta.clave),
        Esperar.aQueAparezca(Aplicacion.nombreDelUsuario),
      );
    }),

  /** Envía el formulario con su correo y su contraseña, sin esperar a que lo acepten. */
  sinEsperarElResultado: () =>
    Tarea.dondeElActor('envía el formulario de inicio de sesión con sus credenciales', async actor => {
      const cuenta = actor.habilidadDe(TenerUnaCuenta);
      await actor.intenta(...enviarElFormulario(cuenta.correo, cuenta.clave));
    }),

  /** Envía el formulario con los datos indicados, sin esperar a que lo acepten. */
  con: (correo: string, clave: string) =>
    Tarea.donde(`intenta iniciar sesión como ${correo}`, ...enviarElFormulario(correo, clave)),

  /** Usa su correo real, pero una contraseña que no es la suya. */
  conUnaClaveEquivocada: () =>
    Tarea.dondeElActor('intenta iniciar sesión con una contraseña equivocada', async actor => {
      const cuenta = actor.habilidadDe(TenerUnaCuenta);
      await actor.intenta(
        ...enviarElFormulario(cuenta.correo, 'no-es-mi-clave'),
        Esperar.aQueAparezca(PantallaDeLogin.error),
      );
    }),
};

export const CerrarSesion = {
  desdeElMenu: () =>
    Tarea.donde('cierra su sesión desde el menú',
      Clic.en(Aplicacion.cerrarSesion),
      Esperar.aLaRuta(PantallaDeLogin.ruta),
    ),
};
