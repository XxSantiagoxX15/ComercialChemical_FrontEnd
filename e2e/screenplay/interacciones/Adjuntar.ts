import { basename } from 'node:path';
import { NavegarPorLaWeb } from '../habilidades';
import type { Elemento } from '../interfaz/Elemento';
import { Interaccion } from '../nucleo';

/** Un archivo del disco (su ruta) o uno creado en memoria para la prueba. */
export type Archivo = string | { name: string; mimeType: string; buffer: Buffer };

const nombreDe = (archivo: Archivo) => (typeof archivo === 'string' ? basename(archivo) : archivo.name);

export const Adjuntar = {
  elArchivo: (archivo: Archivo) => ({
    /**
     * Hace clic en el botón y elige el archivo en el explorador que se abre.
     * Si el botón NO abre el explorador de archivos, la interacción falla.
     */
    conElExploradorQueAbre: (boton: Elemento) =>
      Interaccion.donde(
        `elige el archivo «${nombreDe(archivo)}» en el explorador que abre ${boton.descripcion}`,
        async actor => {
          const pagina = actor.habilidadDe(NavegarPorLaWeb).pagina;
          const explorador = pagina.waitForEvent('filechooser');
          await boton.en(pagina).click();
          await (await explorador).setFiles(archivo);
        },
      ),
  }),
};
