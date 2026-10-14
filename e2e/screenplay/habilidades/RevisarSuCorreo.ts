import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Habilidad } from '../nucleo';

/** Un correo tal como lo guardó el backend de pruebas (e2e/backend/buzon_e2e.py). */
export interface Correo {
  para: string[];
  asunto: string;
  texto: string;
  html: string;
  conLogo: boolean;
  archivo: string;
}

/**
 * Habilidad de leer el buzón propio. En las pruebas el backend no envía
 * correos de verdad: los deja como archivos en una carpeta, y el actor lee
 * de ahí solo los que van dirigidos a su dirección.
 */
export class RevisarSuCorreo extends Habilidad {
  private constructor(
    private readonly carpeta: string,
    private readonly direccion: string,
  ) {
    super();
  }

  static en(carpeta: string, direccion: string): RevisarSuCorreo {
    return new RevisarSuCorreo(carpeta, direccion);
  }

  /** Correos recibidos, del más antiguo al más reciente. */
  recibidos(): Correo[] {
    return RevisarSuCorreo.todosLosDe(this.carpeta)
      .filter(correo => correo.para.some(d => d.toLowerCase() === this.direccion.toLowerCase()));
  }

  private static todosLosDe(carpeta: string): Correo[] {
    if (!existsSync(carpeta)) return [];
    return readdirSync(carpeta)
      .filter(nombre => nombre.endsWith('.json'))
      .sort()                              // el nombre empieza por la hora de envío
      .map(nombre => {
        const dato = JSON.parse(readFileSync(join(carpeta, nombre), 'utf-8'));
        return {
          para: dato.para ?? [],
          asunto: dato.asunto ?? '',
          texto: dato.texto ?? '',
          html: dato.html ?? '',
          conLogo: Boolean(dato.con_logo),
          archivo: nombre,
        };
      });
  }
}
