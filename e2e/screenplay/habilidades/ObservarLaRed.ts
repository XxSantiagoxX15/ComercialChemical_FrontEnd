import type { Page, Request } from '@playwright/test';
import { Habilidad } from '../nucleo';

/** Una petición a la API y su respuesta, tal como viajaron por la red. */
export interface Intercambio {
  metodo: string;
  ruta: string;
  consulta: string;
  encabezados: Record<string, string>;
  enviado: string;
  estado: number;
  recibido: string;
}

/**
 * Habilidad de mirar la pestaña «Network» del navegador: guarda lo que la
 * aplicación envía a la API y lo que recibe, EXACTAMENTE como viaja (es
 * decir, antes de que el interceptor lo descifre). Sirve para comprobar que
 * por la red no pasa ningún dato legible.
 */
export class ObservarLaRed extends Habilidad {
  private readonly pendientes: Promise<void>[] = [];
  private readonly vistos: Intercambio[] = [];

  private constructor(pagina: Page, private readonly prefijo: string) {
    super();
    pagina.on('requestfinished', peticion => {
      this.pendientes.push(this.anotar(peticion));
    });
  }

  /** Empieza a anotar las peticiones cuya ruta empiece por `prefijo`. */
  static de(pagina: Page, prefijo = '/api/'): ObservarLaRed {
    return new ObservarLaRed(pagina, prefijo);
  }

  /** Todo lo anotado hasta ahora, en el orden en que terminó. */
  async intercambios(): Promise<Intercambio[]> {
    await Promise.all(this.pendientes);
    return [...this.vistos];
  }

  private async anotar(peticion: Request): Promise<void> {
    const url = new URL(peticion.url());
    if (!url.pathname.startsWith(this.prefijo) || peticion.method() === 'OPTIONS') return;
    try {
      const respuesta = await peticion.response();
      if (!respuesta) return;
      const cuerpo = await respuesta.body();
      this.vistos.push({
        metodo: peticion.method(),
        ruta: url.pathname,
        consulta: url.search,
        encabezados: peticion.headers(),
        enviado: peticion.postDataBuffer()?.toString('latin1') ?? '',
        estado: respuesta.status(),
        recibido: cuerpo.toString('latin1'),
      });
    } catch {
      // La página se cerró antes de leer la respuesta: no hay nada que anotar.
    }
  }
}
