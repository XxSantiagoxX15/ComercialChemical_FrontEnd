import { Abrir, Clic, Escribir, Esperar } from '../interacciones';
import { Aplicacion } from '../interfaz/Aplicacion';
import { PantallaDePronosticos } from '../interfaz/PantallaDePronosticos';
import { Tarea } from '../nucleo';

export const CalcularElPronostico = {
  /** Botón «Pronóstico masivo»: calcula el de todos los artículos con ventas. */
  deTodosLosArticulos: () =>
    Tarea.donde('calcula el pronóstico de todos los artículos',
      Abrir.laRuta(PantallaDePronosticos.ruta),
      Clic.en(PantallaDePronosticos.pronosticoMasivo),
      Esperar.aQueAparezca(Aplicacion.aviso, 120_000),
    ),

  /** Busca el artículo, elige el horizonte y pulsa «Generar Pronóstico». */
  delArticulo: (codigo: string, meses = 3) =>
    Tarea.donde(`calcula el pronóstico a ${meses} meses del artículo ${codigo}`,
      ElegirElArticulo.conCodigo(codigo),
      Clic.en(PantallaDePronosticos.horizonte(meses)),
      Clic.en(PantallaDePronosticos.generar),
    ),
};

export const ElegirElArticulo = {
  conCodigo: (codigo: string) =>
    Tarea.donde(`elige el artículo ${codigo} en la pantalla de pronósticos`,
      Abrir.laRuta(PantallaDePronosticos.ruta),
      Escribir.elTexto(codigo).en(PantallaDePronosticos.buscadorDeArticulo),
      Clic.en(PantallaDePronosticos.articuloSugerido(codigo)),
      Esperar.aQueAparezca(PantallaDePronosticos.historialDisponible),
    ),
};

export const VerLaPestana = {
  de: (nombre: string) =>
    Tarea.donde(`abre la pestaña «${nombre}» de pronósticos`,
      Clic.en(PantallaDePronosticos.pestana(nombre)),
    ),
};
