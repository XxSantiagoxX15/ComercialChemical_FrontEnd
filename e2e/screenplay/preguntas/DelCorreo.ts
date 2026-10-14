import { RevisarSuCorreo } from '../habilidades';
import type { Correo } from '../habilidades';
import { Pregunta } from '../nucleo';

const SIN_CORREO: Correo = { para: [], asunto: '', texto: '', html: '', conLogo: false, archivo: '' };

export const LosCorreos = {
  recibidos: () =>
    Pregunta.sobre('los correos que ha recibido', async actor =>
      actor.habilidadDe(RevisarSuCorreo).recibidos()),
};

export const ElUltimoCorreo = {
  /** El correo más reciente de su buzón (vacío si todavía no llegó ninguno). */
  recibido: () =>
    Pregunta.sobre('el último correo que recibió', async actor =>
      actor.habilidadDe(RevisarSuCorreo).recibidos().at(-1) ?? SIN_CORREO),
};

export const ElCodigoDeRecuperacion = {
  /** El código de 6 dígitos del último correo («» si no hay correo o no trae código). */
  recibidoPorCorreo: () =>
    ElUltimoCorreo.recibido().convertidaCon('el código de recuperación que le llegó por correo',
      correo => correo.texto.match(/Tu código es: (\d{6})/)?.[1] ?? ''),
};

export const ElEnlaceDelCorreo = {
  /** La dirección del botón del último correo (login o recuperación). */
  recibido: () =>
    ElUltimoCorreo.recibido().convertidaCon('el enlace del último correo',
      correo => correo.texto.match(/https?:\/\/\S+/)?.[0] ?? ''),
};
