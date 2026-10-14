import { NavegarPorLaWeb } from '../habilidades';
import type { Elemento } from '../interfaz/Elemento';
import { VentanaDePermisos } from '../interfaz/PantallaDeUsuarios';
import { Pregunta } from '../nucleo';

export const SiEstaActivo = {
  /** Estado del interruptor de un módulo en la pestaña abierta de la ventana de permisos. */
  elModulo: (nombre: string) =>
    Pregunta.sobre(`si está activo el módulo «${nombre}»`, async actor => {
      const interruptor = VentanaDePermisos.interruptorDe(nombre).en(actor.habilidadDe(NavegarPorLaWeb).pagina);
      return (await interruptor.getAttribute('aria-checked')) === 'true';
    }),
};

export const SiSePuedeCambiar = {
  elModulo: (nombre: string) =>
    Pregunta.sobre(`si se puede cambiar el módulo «${nombre}»`, async actor =>
      VentanaDePermisos.interruptorDe(nombre).en(actor.habilidadDe(NavegarPorLaWeb).pagina).isEnabled()),
};

export const SiLaImagenCargo = {
  /** Una imagen «se ve» de verdad solo si el navegador pudo descargarla y dibujarla. */
  de: (elemento: Elemento) =>
    Pregunta.sobre(`si se cargó la imagen ${elemento.conDe}`, async actor => {
      const imagen = elemento.en(actor.habilidadDe(NavegarPorLaWeb).pagina).first();
      if (!(await imagen.isVisible())) return false;
      return imagen.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    }),
};
