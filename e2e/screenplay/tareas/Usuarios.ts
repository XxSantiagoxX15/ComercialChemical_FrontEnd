import type { Cuenta } from '../habilidades';
import { Abrir, Aceptar, Clic, Escribir, Esperar } from '../interacciones';
import { Aplicacion } from '../interfaz/Aplicacion';
import { FormularioDeUsuario, PantallaDeUsuarios } from '../interfaz/PantallaDeUsuarios';
import { Tarea } from '../nucleo';

const rellenarElFormulario = (cuenta: Cuenta) => [
  Abrir.laRuta(PantallaDeUsuarios.ruta),
  Clic.en(PantallaDeUsuarios.nuevoUsuario),
  Escribir.elTexto(cuenta.nombre).en(FormularioDeUsuario.nombre),
  Escribir.elTexto(cuenta.correo).en(FormularioDeUsuario.correo),
  Clic.en(FormularioDeUsuario.rol),
  Clic.en(FormularioDeUsuario.opcionDeRol(cuenta.rol)),
  Escribir.laClave(cuenta.clave).en(FormularioDeUsuario.clave),
  Clic.en(FormularioDeUsuario.crear),
];

export const CrearElUsuario = {
  /** Rellena «Nuevo Usuario», lo crea y espera a verlo en la tabla. */
  conLosDatos: (cuenta: Cuenta) =>
    Tarea.donde(`crea el usuario ${cuenta.correo} con el rol ${cuenta.rol}`,
      ...rellenarElFormulario(cuenta),
      Esperar.aQueDesaparezca(FormularioDeUsuario.ventana),
      Esperar.aQueAparezca(PantallaDeUsuarios.filaDe(cuenta.correo)),
    ),

  /** Igual, pero sin esperar a que se cree (para probar los rechazos). */
  intentandoCon: (cuenta: Cuenta) =>
    Tarea.donde(`intenta crear el usuario ${cuenta.correo}`, ...rellenarElFormulario(cuenta)),
};

export const CambiarElEstado = {
  /** Pulsa el botón de activar/desactivar de la fila y espera el aviso. */
  delUsuario: (correo: string) =>
    Tarea.donde(`activa o desactiva al usuario ${correo}`,
      Abrir.laRuta(PantallaDeUsuarios.ruta),
      Clic.en(PantallaDeUsuarios.activarODesactivarA(correo)),
      Esperar.aQueAparezca(Aplicacion.aviso),
    ),
};

export const EnviarUnCodigo = {
  /** Botón de la fila «enviar código para restablecer la contraseña», aceptando la confirmación. */
  alUsuario: (correo: string) =>
    Tarea.donde(`envía un código de restablecimiento al usuario ${correo}`,
      Abrir.laRuta(PantallaDeUsuarios.ruta),
      Aceptar.laProximaConfirmacion(),
      Clic.en(PantallaDeUsuarios.enviarCodigoA(correo)),
      Esperar.aQueAparezca(Aplicacion.aviso),
    ),
};
