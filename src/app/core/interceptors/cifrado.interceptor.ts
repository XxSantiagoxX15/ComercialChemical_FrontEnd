import {
  HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpParams, HttpRequest, HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, of, switchMap, throwError } from 'rxjs';
import { CanalCifradoService } from '../services/canal-cifrado-service';
import {
  ClavesCanal, cifrarBinario, cifrarCadena, cifrarTexto, contexto, descifrarBinario,
  descifrarTexto, esSobre, formularioABytes, tieneMagia,
} from '../cifrado/canal-cripto';

/**
 * Cifra lo que sale hacia la API y descifra lo que vuelve, en las rutas que
 * el backend marca como cifradas:
 *   - el cuerpo (JSON y formularios con archivos),
 *   - los parámetros de la URL (?buscar=...),
 *   - la respuesta (JSON y descargas PDF/Excel) y los mensajes de error.
 * Los servicios y las pantallas no cambian: siguen enviando y recibiendo
 * objetos, FormData y Blob normales. Lo único distinto es lo que viaja por
 * la red (y lo que se ve en la pestaña Network).
 */
export const cifradoInterceptor: HttpInterceptorFn = (req, next) => {
  const canal = inject(CanalCifradoService);
  return canal.esDeLaApi(req.url) ? enviar(req, next, canal, true) : next(req);
};

/** Códigos con los que el backend avisa que hay que volver a abrir el canal. */
const CODIGOS_DE_CANAL = ['cifrado_invalido', 'cifrado_requerido'];

class RespuestaIlegible extends Error {}

function enviar(
  req: HttpRequest<unknown>, next: HttpHandlerFn, canal: CanalCifradoService, puedeReintentar: boolean,
): Observable<HttpEvent<unknown>> {
  return from(canal.estado()).pipe(
    switchMap(estado => {
      const ruta = new URL(req.url, globalThis.location?.origin).pathname;
      const claves = estado.claves;
      if (!claves || !CanalCifradoService.cifra(estado, ruta)) {
        return conReintento(next(req));
      }
      return conReintento(
        from(cifrarPeticion(req, ruta, claves)).pipe(
          switchMap(cifrada => next(cifrada)),
          switchMap(evento => evento instanceof HttpResponse
            ? from(descifrarRespuesta(evento, req.method, ruta, claves))
            : of(evento)),
          catchError(error => from(descifrarError(error, req.method, ruta, claves)).pipe(
            switchMap(claro => throwError(() => claro)),
          )),
        ),
      );
    }),
  );

  // Si el backend dice que el canal no sirve (cambió su clave, o esta ruta
  // pasó a exigir cifrado), se acuerdan claves nuevas y se repite una vez.
  function conReintento(flujo: Observable<HttpEvent<unknown>>): Observable<HttpEvent<unknown>> {
    return flujo.pipe(
      catchError(error => {
        if (puedeReintentar && esFalloDeCanal(error)) {
          canal.reiniciar();
          return enviar(req, next, canal, false);
        }
        if (error instanceof RespuestaIlegible) {
          return throwError(() => new HttpErrorResponse({
            status: 0, statusText: 'Respuesta ilegible', url: req.url,
            error: { error: 'No se pudo descifrar la respuesta del servidor.' },
          }));
        }
        return throwError(() => error);
      }),
    );
  }
}

function esFalloDeCanal(error: unknown): boolean {
  if (error instanceof RespuestaIlegible) return true;
  return error instanceof HttpErrorResponse
    && error.status === 400
    && CODIGOS_DE_CANAL.includes(error.error?.codigo);
}

// ── Petición ────────────────────────────────────────────────────────────────

async function cifrarPeticion(
  req: HttpRequest<unknown>, ruta: string, claves: ClavesCanal,
): Promise<HttpRequest<unknown>> {
  // El encabezado va siempre: con él el servidor sabe con qué clave responder.
  const encabezados: Record<string, string> = { 'X-Canal': claves.encabezado };
  const cambios: { url?: string; params?: HttpParams; body?: unknown } = {};

  // Parámetros de la URL: salen de la dirección y viajan cifrados en un encabezado.
  const corte = req.urlWithParams.indexOf('?');
  if (corte >= 0) {
    const consulta = req.urlWithParams.slice(corte + 1);
    cambios.url = req.urlWithParams.slice(0, corte);
    cambios.params = new HttpParams();
    if (consulta) {
      encabezados['X-Canal-Consulta'] = await cifrarCadena(
        claves.peticion, consulta, contexto('CON', req.method, ruta));
    }
  }

  // Cuerpo.
  const cuerpo = req.body;
  const ctx = contexto('PET', req.method, ruta);
  if (cuerpo instanceof FormData) {
    // Formulario (con o sin archivos): se cifra el multipart completo.
    const { tipo, bytes } = await formularioABytes(cuerpo);
    cambios.body = aBuffer(await cifrarBinario(claves.peticion, tipo, bytes, ctx));
    encabezados['Content-Type'] = 'application/octet-stream';
  } else if (cuerpo instanceof Blob || cuerpo instanceof ArrayBuffer) {
    const bytes = new Uint8Array(cuerpo instanceof Blob ? await cuerpo.arrayBuffer() : cuerpo);
    const tipo = (cuerpo instanceof Blob && cuerpo.type) || 'application/octet-stream';
    cambios.body = aBuffer(await cifrarBinario(claves.peticion, tipo, bytes, ctx));
    encabezados['Content-Type'] = 'application/octet-stream';
  } else if (cuerpo !== null && cuerpo !== undefined) {
    // Objetos y arreglos (lo habitual): JSON cifrado dentro de un sobre.
    cambios.body = await cifrarTexto(claves.peticion, JSON.stringify(cuerpo), ctx);
    encabezados['Content-Type'] = 'application/json';
  }

  return req.clone({ ...cambios, setHeaders: encabezados });
}

function aBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

// ── Respuesta ───────────────────────────────────────────────────────────────

async function descifrarRespuesta(
  respuesta: HttpResponse<unknown>, metodo: string, ruta: string, claves: ClavesCanal,
): Promise<HttpResponse<unknown>> {
  const cuerpo = respuesta.body;
  const ctx = contexto('RES', metodo, ruta);
  try {
    if (esSobre(cuerpo)) {
      return respuesta.clone({ body: JSON.parse(await descifrarTexto(claves.respuesta, cuerpo, ctx)) });
    }
    // Descargas: llegan como Blob o ArrayBuffer cifrados.
    if (cuerpo instanceof Blob || cuerpo instanceof ArrayBuffer) {
      const crudo = new Uint8Array(cuerpo instanceof Blob ? await cuerpo.arrayBuffer() : cuerpo);
      if (!tieneMagia(crudo)) return respuesta;
      const { tipo, datos } = await descifrarBinario(claves.respuesta, crudo, ctx);
      return respuesta.clone({
        body: cuerpo instanceof Blob ? new Blob([datos as BlobPart], { type: tipo }) : aBuffer(datos),
      });
    }
    return respuesta;   // respuestas vacías
  } catch {
    throw new RespuestaIlegible();
  }
}

/** Los errores del backend (400, 403...) también llegan cifrados: se abren
 *  para que las pantallas sigan leyendo `err.error` como siempre. */
async function descifrarError(
  error: unknown, metodo: string, ruta: string, claves: ClavesCanal,
): Promise<unknown> {
  if (!(error instanceof HttpErrorResponse)) return error;
  const reconstruir = (cuerpo: unknown) => new HttpErrorResponse({
    error: cuerpo, headers: error.headers, status: error.status,
    statusText: error.statusText, url: error.url ?? undefined,
  });
  const ctx = contexto('RES', metodo, ruta);
  try {
    if (esSobre(error.error)) {
      return reconstruir(JSON.parse(await descifrarTexto(claves.respuesta, error.error, ctx)));
    }
    // En las descargas (responseType 'blob') Angular entrega el error como Blob.
    if (error.error instanceof Blob) {
      let json: unknown;
      try { json = JSON.parse(await error.error.text()); } catch { return error; }
      if (esSobre(json)) {
        const claro = await descifrarTexto(claves.respuesta, json, ctx);
        return reconstruir(new Blob([claro], { type: 'application/json' }));
      }
      // Rechazo del propio canal (llega en claro): se deja como objeto para
      // que el reintento lo reconozca.
      if (CODIGOS_DE_CANAL.includes((json as any)?.codigo)) return reconstruir(json);
    }
    return error;
  } catch {
    return new RespuestaIlegible();
  }
}