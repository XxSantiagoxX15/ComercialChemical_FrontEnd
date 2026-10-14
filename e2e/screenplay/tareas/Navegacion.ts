import { MODULOS } from '../../datos/modulos';
import { Abrir, Clic, Esperar } from '../interacciones';
import { Aplicacion } from '../interfaz/Aplicacion';
import { Tarea } from '../nucleo';

const rutaDe = (opcion: string): string => {
  const modulo = MODULOS.find(m => m.enMenu === opcion);
  if (!modulo) throw new Error(`El menú no tiene ninguna opción llamada «${opcion}».`);
  return modulo.ruta;
};

export const IrA = {
  /** Entra a un módulo haciendo clic en su opción del menú lateral. */
  elModulo: (opcion: string) =>
    Tarea.donde(`entra a «${opcion}» desde el menú`,
      Clic.en(Aplicacion.opcionDelMenu(opcion)),
      Esperar.aLaRuta(rutaDe(opcion)),
      Esperar.aQueAparezca(Aplicacion.tituloDeLaPantalla),
    ),

  /** Escribe la dirección a mano, como quien intenta saltarse el menú. */
  laDireccion: (ruta: string) =>
    Tarea.donde(`escribe la dirección ${ruta} en el navegador`, Abrir.laRuta(ruta)),
};
