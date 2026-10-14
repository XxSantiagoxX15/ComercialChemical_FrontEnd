import { PantallaDeImportacion } from '../interfaz/PantallaDeImportacion';
import { PantallaDeAlertas, PantallaDeArticulos, PantallaDeDashboard } from '../interfaz/PantallasDeInventario';
import { Pregunta } from '../nucleo';
import { ElTexto } from './DeLaPantalla';
import { LasFilas } from './DeLasTablas';

export const ElResultadoDeLaImportacion = {
  mostrado: () =>
    Pregunta.sobre('el resultado de la importación', async actor => ({
      titulo: await actor.responde(ElTexto.de(PantallaDeImportacion.tituloDelResultado)),
      mensaje: await actor.responde(ElTexto.de(PantallaDeImportacion.mensajeDelResultado)),
    })),
};

export const ElHistorialDeImportaciones = {
  /** Del más reciente al más antiguo, como lo muestra la pantalla. */
  completo: () =>
    LasFilas.de(PantallaDeImportacion.filasDelHistorial).conLasColumnas('tipo', 'archivo', 'estado', 'registros'),
};

export const LosArticulos = {
  listados: () =>
    LasFilas.de(PantallaDeArticulos.filas)
      .conLasColumnas('codigo', 'descripcion', 'stock_actual', 'stock_minimo', 'total_vendido'),
};

export const LasAlertasDeStock = {
  /** Códigos de los artículos con alerta vigente. */
  vigentes: () =>
    LasFilas.de(PantallaDeAlertas.filas).conLasColumnas('codigo')
      .convertidaCon('los códigos con alerta de stock vigente', filas => filas.map(f => f.codigo).sort()),

  ignoradas: () =>
    LasFilas.de(PantallaDeAlertas.filasIgnoradas).conLasColumnas('codigo')
      .convertidaCon('los códigos con alerta ignorada', filas => filas.map(f => f.codigo).sort()),
};

export const ElIndicadorDelDashboard = {
  llamado: (rotulo: string) => ElTexto.de(PantallaDeDashboard.indicador(rotulo)),
};
