import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClavesCanal, abrirCanal } from '../cifrado/canal-cripto';

/** Estado del canal cifrado para esta carga de la aplicación. */
export interface EstadoCanal {
  /** Prefijos de las rutas de la API que viajan cifradas (los define el backend). */
  rutas: string[];
  /** Rutas que nunca se cifran aunque un prefijo las abarque (health, documentación). */
  publicas: string[];
  /** Claves acordadas con el servidor; null si el cifrado está apagado. */
  claves: ClavesCanal | null;
}

/**
 * Abre el canal cifrado con la API: pide al backend su clave pública y la
 * lista de rutas cifradas, y acuerda las claves. Se hace una sola vez por
 * carga de la aplicación; las claves viven solo en memoria.
 */
@Injectable({ providedIn: 'root' })
export class CanalCifradoService {
  // HttpClient propio, sin interceptores: esta petición es la que permite
  // cifrar las demás, así que no puede pasar por el interceptor de cifrado.
  private http = new HttpClient(inject(HttpBackend));
  private readonly urlCanal = `${environment.apiUrl}/api/auth/canal/`;
  private enCurso: Promise<EstadoCanal> | null = null;

  /** true si la URL es de nuestra API (y no es la del propio canal). */
  esDeLaApi(url: string): boolean {
    return url.startsWith(`${environment.apiUrl}/api/`) && !url.startsWith(this.urlCanal);
  }

  estado(): Promise<EstadoCanal> {
    if (!this.enCurso) this.enCurso = this.abrir();
    return this.enCurso;
  }

  /** Olvida las claves; el siguiente uso vuelve a acordarlas con el servidor. */
  reiniciar(): void {
    this.enCurso = null;
  }

  private async abrir(): Promise<EstadoCanal> {
    let info: any;
    try {
      info = await firstValueFrom(this.http.get<any>(this.urlCanal));
    } catch {
      // Backend sin canal o caído: se sigue sin cifrar. Si alguna ruta lo
      // exige, el backend lo dirá y el interceptor volverá a intentarlo.
      return { rutas: [], publicas: [], claves: null };
    }
    const rutas: string[] = Array.isArray(info?.rutas) ? info.rutas : [];
    const publicas: string[] = Array.isArray(info?.publicas) ? info.publicas : [];
    if (!info?.activo || rutas.length === 0 || !info?.clave_publica) {
      return { rutas: [], publicas: [], claves: null };
    }
    return { rutas, publicas, claves: await abrirCanal(info.clave_publica) };
  }

  /** true si esa ruta de la API viaja cifrada. */
  static cifra(estado: EstadoCanal, ruta: string): boolean {
    if (!estado.claves) return false;
    if (estado.publicas.some(publica => ruta.startsWith(publica))) return false;
    return estado.rutas.some(prefijo => ruta.startsWith(prefijo));
  }
}