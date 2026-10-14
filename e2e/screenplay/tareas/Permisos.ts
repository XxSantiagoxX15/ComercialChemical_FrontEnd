import { MODULOS, PESTANA_DEL_ROL } from '../../datos/modulos';
import type { Rol } from '../../datos/modulos';
import { Abrir, Clic, Esperar } from '../interacciones';
import { Aplicacion } from '../interfaz/Aplicacion';
import { PantallaDeUsuarios, VentanaDePermisos } from '../interfaz/PantallaDeUsuarios';
import { Tarea } from '../nucleo';
import { SiEstaActivo } from '../preguntas/DeLosPermisos';

export const AbrirLosPermisos = {
  delRol: (rol: Rol) =>
    Tarea.donde(`abre los permisos del rol ${rol}`,
      Abrir.laRuta(PantallaDeUsuarios.ruta),
      Clic.en(PantallaDeUsuarios.permisosPorRol),
      Esperar.aQueAparezca(VentanaDePermisos.pestanaDelRol(PESTANA_DEL_ROL[rol])),
      Clic.en(VentanaDePermisos.pestanaDelRol(PESTANA_DEL_ROL[rol])),
    ),
};

export const ConfigurarPermisos = {
  /**
   * Deja al rol EXACTAMENTE con los módulos indicados (por su clave): activa
   * los que falten, apaga los que sobren y guarda. Usuarios no se toca: ese
   * módulo es solo del Administrador.
   */
  delRol: (rol: Rol) => ({
    dejandoActivos: (claves: string[]) =>
      Tarea.dondeElActor(
        `deja al rol ${rol} con los módulos [${claves.join(', ') || 'ninguno'}]`,
        async actor => {
          await actor.intenta(AbrirLosPermisos.delRol(rol));

          let huboCambios = false;
          for (const modulo of MODULOS.filter(m => m.clave !== 'usuarios')) {
            const debeEstarActivo = claves.includes(modulo.clave);
            const estaActivo = await actor.responde(SiEstaActivo.elModulo(modulo.enPermisos));
            if (estaActivo !== debeEstarActivo) {
              await actor.intenta(Clic.en(VentanaDePermisos.interruptorDe(modulo.enPermisos)));
              huboCambios = true;
            }
          }

          if (huboCambios) {
            await actor.intenta(
              Clic.en(VentanaDePermisos.guardar),
              Esperar.aQueAparezca(Aplicacion.aviso),
            );
          }
          await actor.intenta(
            Clic.en(VentanaDePermisos.cerrar),
            Esperar.aQueDesaparezca(VentanaDePermisos.ventana),
          );
        },
      ),
  }),
};
