import { NavegarPorLaWeb } from '../habilidades';
import { Aplicacion } from '../interfaz/Aplicacion';
import { PantallaDeLogin } from '../interfaz/PantallaDeLogin';
import { Pregunta } from '../nucleo';
import { ElTexto, LosTextos } from './DeLaPantalla';

export const LasOpcionesDelMenu = {
  visibles: () => LosTextos.de(Aplicacion.opcionesDelMenu),
};

export const LasSeccionesDelMenu = {
  visibles: () => LosTextos.de(Aplicacion.seccionesDelMenu),
};

export const ElUsuarioEnSesion = {
  /** Nombre y rol que muestra el encabezado de la aplicación. */
  segunElEncabezado: () =>
    Pregunta.sobre('el usuario que muestra el encabezado', async actor => ({
      nombre: await actor.responde(ElTexto.de(Aplicacion.nombreDelUsuario)),
      rol: await actor.responde(ElTexto.de(Aplicacion.rolDelUsuario)),
    })),
};

export const ElTituloDeLaPantalla = {
  actual: () => ElTexto.de(Aplicacion.tituloDeLaPantalla),
};

export const ElAviso = {
  emergente: () => ElTexto.de(Aplicacion.aviso),
};

export const ElErrorDeInicioDeSesion = {
  mostrado: () => ElTexto.de(PantallaDeLogin.error),
};

export const SiHaySesionGuardada = {
  enElNavegador: () =>
    Pregunta.sobre('si el navegador tiene una sesión guardada', async actor =>
      actor.habilidadDe(NavegarPorLaWeb).pagina.evaluate(() => localStorage.getItem('token') !== null)),
};
