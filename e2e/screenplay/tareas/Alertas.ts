import { Abrir, Clic, Esperar } from '../interacciones';
import { Aplicacion } from '../interfaz/Aplicacion';
import { PantallaDeAlertas } from '../interfaz/PantallasDeInventario';
import { Tarea } from '../nucleo';

export const VerLasAlertas = {
  deStock: () =>
    Tarea.donde('abre las alertas de stock',
      Abrir.laRuta(PantallaDeAlertas.ruta),
      Esperar.aQueAparezca(PantallaDeAlertas.verIgnoradas),
    ),

  ignoradas: () =>
    Tarea.donde('despliega las alertas ignoradas', Clic.en(PantallaDeAlertas.verIgnoradas)),
};

export const MarcarLaAlerta = {
  /** Botón «No me interesa» de la alerta de ese artículo. */
  comoNoMeInteresa: (codigo: string) =>
    Tarea.donde(`marca «No me interesa» en la alerta del artículo ${codigo}`,
      Clic.en(PantallaDeAlertas.noMeInteresa(codigo)),
      Esperar.aQueAparezca(Aplicacion.aviso),
    ),
};

export const ReactivarLaAlerta = {
  de: (codigo: string) =>
    Tarea.donde(`reactiva la alerta del artículo ${codigo}`,
      Clic.en(PantallaDeAlertas.reactivar(codigo)),
      Esperar.aQueDesaparezca(PantallaDeAlertas.reactivar(codigo)),
    ),
};
