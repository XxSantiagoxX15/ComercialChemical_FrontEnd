import { PantallaDePronosticos } from '../interfaz/PantallaDePronosticos';
import { Pregunta } from '../nucleo';
import { ElTexto } from './DeLaPantalla';
import { LasFilas } from './DeLasTablas';

export const ElPronostico = {
  /** Las filas de «Detalle del Pronóstico»: período y demanda proyectada. */
  calculado: () =>
    LasFilas.de(PantallaDePronosticos.filasDelPronostico).conLasColumnas('fecha', 'demanda_proyectada'),

  modeloUsado: () => ElTexto.de(PantallaDePronosticos.modeloUsado),

  error: () => ElTexto.de(PantallaDePronosticos.errorDeCalculo),
};

export const ElAnalisisDeVentas = {
  delArticulo: () =>
    Pregunta.sobre('el análisis estadístico del artículo', async actor => ({
      periodos: await actor.responde(ElTexto.de(PantallaDePronosticos.estadistica('Períodos históricos'))),
      media: await actor.responde(ElTexto.de(PantallaDePronosticos.estadistica('Media de ventas'))),
      tendencia: await actor.responde(ElTexto.de(PantallaDePronosticos.tendencia)),
    })),
};

export const ElHistorialDisponible = {
  delArticulo: () => ElTexto.de(PantallaDePronosticos.historialDisponible),
};

export const LosMasVendidos = {
  listados: () =>
    LasFilas.de(PantallaDePronosticos.filasDeLaPestana).conLasColumnas('codigo')
      .convertidaCon('los códigos de los más vendidos, en orden', filas => filas.map(f => f.codigo)),
};

export const LasRecomendaciones = {
  /** Cada recomendación de compra, en el orden de prioridad en que se muestran. */
  listadas: () =>
    LasFilas.de(PantallaDePronosticos.filasDeLaPestana)
      .conLasColumnas('articulo', 'stock_actual', 'demanda_proyectada', 'cantidad_recomendada', 'prioridad')
      .convertidaCon('las recomendaciones de compra', filas => filas.map(fila => ({
        codigo: fila.articulo.split(' ')[0],
        stock: fila.stock_actual,
        demanda: fila.demanda_proyectada,
        comprar: fila.cantidad_recomendada,
        prioridad: fila.prioridad,
      }))),

  contador: () => ElTexto.de(PantallaDePronosticos.contadorDeRecomendaciones),
};
