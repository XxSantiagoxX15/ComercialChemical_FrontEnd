/**
 * Cómo reconocer, mirando la red, que un mensaje va cifrado. El canal de la
 * aplicación envía dos formas de «sobre»:
 *
 *   · JSON     {"cifrado":"v1","datos":"<base64>"}        (peticiones y respuestas normales)
 *   · binario  \0CHEM-CIFRADO-v1\0 + bytes cifrados         (archivos que se suben o se descargan)
 */
const MARCA_BINARIA = '\u0000CHEM-CIFRADO-v1\u0000';

export function esUnSobreCifrado(cuerpo: string): boolean {
  if (cuerpo.startsWith(MARCA_BINARIA)) return true;
  try {
    const sobre = JSON.parse(cuerpo);
    return sobre?.cifrado === 'v1'
      && typeof sobre.datos === 'string'
      && /^[A-Za-z0-9+/]+=*$/.test(sobre.datos)
      && Object.keys(sobre).length === 2;
  } catch {
    return false;
  }
}

/** Rutas que el backend deja sin cifrar a propósito (no llevan datos del negocio). */
export const RUTAS_PUBLICAS = ['/api/auth/canal/', '/api/auth/health/', '/api/inventario/health/'];
