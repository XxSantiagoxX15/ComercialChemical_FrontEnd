import { NOMBRE_KARDEX, NOMBRE_SALDOS, rutaDeKardex, rutaDeSaldos } from '../../datos/informes';
import { ENTORNO } from '../../soporte/entorno';
import { Abrir, Adjuntar, Clic, Esperar } from '../interacciones';
import type { Archivo } from '../interacciones';
import { PantallaDeImportacion } from '../interfaz/PantallaDeImportacion';
import { Tarea } from '../nucleo';

export type TipoDeInforme = 'saldos' | 'kardex';

const BOTON_DEL_TIPO = {
  saldos: PantallaDeImportacion.tipoSaldos,
  kardex: PantallaDeImportacion.tipoKardex,
};

/** Los informes de prueba que genera la preparación global (e2e/datos/informes.ts). */
export const INFORME = {
  saldos: { tipo: 'saldos' as const, archivo: rutaDeSaldos(ENTORNO.informes), nombre: NOMBRE_SALDOS },
  kardex: { tipo: 'kardex' as const, archivo: rutaDeKardex(ENTORNO.informes), nombre: NOMBRE_KARDEX },
};

export const ElegirUnArchivo = {
  /** Elige el tipo de informe y un archivo con «Seleccionar archivo», sin subirlo todavía. */
  paraElInformeDe: (tipo: TipoDeInforme, archivo: Archivo) =>
    Tarea.donde(`elige un archivo para el informe de ${tipo}`,
      Clic.en(BOTON_DEL_TIPO[tipo]),
      Adjuntar.elArchivo(archivo).conElExploradorQueAbre(PantallaDeImportacion.seleccionarArchivo),
      Esperar.aQueAparezca(PantallaDeImportacion.archivoElegido),
    ),
};

export const ImportarElInforme = {
  /** Sube el archivo como informe del tipo indicado y espera el resultado (bueno o malo). */
  de: (tipo: TipoDeInforme, archivo: Archivo) =>
    Tarea.donde(`importa un informe de ${tipo}`,
      Abrir.laRuta(PantallaDeImportacion.ruta),
      ElegirUnArchivo.paraElInformeDe(tipo, archivo),
      Clic.en(PantallaDeImportacion.subir),
      Esperar.aQueAparezca(PantallaDeImportacion.resultado, 60_000),
    ),
};

export const ImportarLosInformesDePrueba = {
  /** Deja el sistema con los artículos y las ventas de prueba: primero Saldos, luego Kardex. */
  deSaldosYKardex: () =>
    Tarea.donde('importa los informes de prueba de Saldos y de Kardex',
      ImportarElInforme.de('saldos', INFORME.saldos.archivo),
      ImportarElInforme.de('kardex', INFORME.kardex.archivo),
    ),
};
