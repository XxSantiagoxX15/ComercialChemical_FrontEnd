import { NavegarPorLaWeb } from '../habilidades';
import { Interaccion } from '../nucleo';

export const Aceptar = {
  /** Deja dicho que SÍ a la próxima ventana de confirmación del navegador. */
  laProximaConfirmacion: () =>
    Interaccion.donde('acepta la confirmación que aparezca', async actor => {
      actor.habilidadDe(NavegarPorLaWeb).pagina.once('dialog', dialogo => dialogo.accept());
    }),
};
