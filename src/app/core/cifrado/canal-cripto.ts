/**
 * Criptografía del canal cifrado con la API (lado del navegador).
 *
 * Es el espejo de apps/auth/cifrado.py del backend:
 *  - acuerdo de clave ECDH sobre la curva P-256,
 *  - derivación HKDF-SHA256 de dos claves AES-256-GCM (una por sentido),
 *  - cada mensaje con un vector de inicialización aleatorio y atado al
 *    método y la ruta de la petición.
 *
 * Formatos en la red:
 *   JSON     → {"cifrado": "v1", "datos": base64(iv + cifrado)}
 *   Binario  → MAGIA + iv + cifrado de "<content-type original>\n<bytes>".
 *              Para formularios con archivos y para descargas (PDF, Excel).
 *   Consulta → base64(iv + cifrado) de "a=1&b=2", en un encabezado.
 *
 * Usa la API Web Crypto del navegador; no depende de Angular ni de librerías.
 */

export const VERSION_CANAL = 'v1';

/** Lo que viaja por la red (y se ve en la pestaña Network) en vez del JSON. */
export interface SobreCifrado {
  cifrado: typeof VERSION_CANAL;
  datos: string;
}

/** Claves acordadas con el servidor para esta carga de la aplicación. */
export interface ClavesCanal {
  /** Cifra lo que el navegador envía. */
  peticion: CryptoKey;
  /** Descifra lo que el servidor responde. */
  respuesta: CryptoKey;
  /** Clave pública del navegador, para el encabezado X-Canal. */
  encabezado: string;
}

const CURVA = { name: 'ECDH', namedCurve: 'P-256' } as const;
const TAM_IV = 12;
const codificador = new TextEncoder();
const decodificador = new TextDecoder();

function subtle(): SubtleCrypto {
  const api = globalThis.crypto?.subtle;
  if (!api) {
    // Los navegadores solo exponen Web Crypto en páginas seguras.
    throw new Error(
      'El cifrado de datos necesita que el sistema se abra por HTTPS (o en localhost).'
    );
  }
  return api;
}

export function aBase64(bytes: Uint8Array): string {
  let binario = '';
  const TROZO = 0x8000;   // por trozos: String.fromCharCode no admite arreglos enormes
  for (let i = 0; i < bytes.length; i += TROZO) {
    binario += String.fromCharCode(...bytes.subarray(i, i + TROZO));
  }
  return btoa(binario);
}

export function deBase64(texto: string): Uint8Array {
  const binario = atob(texto);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

export function esSobre(valor: unknown): valor is SobreCifrado {
  if (!valor || typeof valor !== 'object') return false;
  const v = valor as Record<string, unknown>;
  return Object.keys(v).length === 2 && v['cifrado'] === VERSION_CANAL && typeof v['datos'] === 'string';
}

/** Dato autenticado: ata el mensaje a su sentido, método y ruta.
 *  PET = cuerpo de la petición, CON = consulta de la URL, RES = respuesta. */
export function contexto(sentido: 'PET' | 'CON' | 'RES', metodo: string, ruta: string): Uint8Array {
  return codificador.encode(`${sentido}|${metodo.toUpperCase()}|${ruta}`);
}

/**
 * Genera el par de claves del navegador y acuerda las claves AES con el
 * servidor a partir de su clave pública. Ninguna clave AES viaja por la red.
 */
export async function abrirCanal(clavePublicaServidor: string): Promise<ClavesCanal> {
  const api = subtle();
  const par = await api.generateKey(CURVA, false, ['deriveBits']);
  const publicaNavegador = new Uint8Array(await api.exportKey('raw', par.publicKey));
  const publicaServidorBytes = deBase64(clavePublicaServidor);
  const publicaServidor = await api.importKey(
    'raw', publicaServidorBytes as BufferSource, CURVA, false, []);

  const secreto = await api.deriveBits({ name: 'ECDH', public: publicaServidor }, par.privateKey, 256);

  const ambas = new Uint8Array(publicaNavegador.length + publicaServidorBytes.length);
  ambas.set(publicaNavegador, 0);
  ambas.set(publicaServidorBytes, publicaNavegador.length);
  const sal = await api.digest('SHA-256', ambas as BufferSource);

  const base = await api.importKey('raw', secreto, 'HKDF', false, ['deriveKey']);
  const derivar = (sentido: string, uso: KeyUsage) => api.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: sal, info: codificador.encode(`chem-modinv/canal/v1/${sentido}`) as BufferSource },
    base, { name: 'AES-GCM', length: 256 }, false, [uso]);

  return {
    peticion: await derivar('peticion', 'encrypt'),
    respuesta: await derivar('respuesta', 'decrypt'),
    encabezado: aBase64(publicaNavegador),
  };
}

// ── Sellar y abrir (AES-GCM) ────────────────────────────────────────────────

async function sellar(clave: CryptoKey, datos: Uint8Array, ctx: Uint8Array): Promise<Uint8Array> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(TAM_IV));
  const cifrado = new Uint8Array(await subtle().encrypt(
    { name: 'AES-GCM', iv: iv as BufferSource, additionalData: ctx as BufferSource },
    clave, datos as BufferSource));
  return unir(iv, cifrado);
}

async function abrir(clave: CryptoKey, sellado: Uint8Array, ctx: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await subtle().decrypt(
    { name: 'AES-GCM', iv: sellado.subarray(0, TAM_IV) as BufferSource, additionalData: ctx as BufferSource },
    clave, sellado.subarray(TAM_IV) as BufferSource));
}

function unir(...partes: Uint8Array[]): Uint8Array {
  const todo = new Uint8Array(partes.reduce((n, p) => n + p.length, 0));
  let pos = 0;
  for (const parte of partes) { todo.set(parte, pos); pos += parte.length; }
  return todo;
}

// ── Texto (JSON y consulta de la URL) ───────────────────────────────────────

/** Cifra un texto y devuelve base64(iv + cifrado). */
export async function cifrarCadena(clave: CryptoKey, texto: string, ctx: Uint8Array): Promise<string> {
  return aBase64(await sellar(clave, codificador.encode(texto), ctx));
}

export async function cifrarTexto(clave: CryptoKey, texto: string, ctx: Uint8Array): Promise<SobreCifrado> {
  return { cifrado: VERSION_CANAL, datos: await cifrarCadena(clave, texto, ctx) };
}

export async function descifrarTexto(clave: CryptoKey, sobre: SobreCifrado, ctx: Uint8Array): Promise<string> {
  return decodificador.decode(await abrir(clave, deBase64(sobre.datos), ctx));
}

// ── Binario (formularios con archivos y descargas) ──────────────────────────

/** Marca con la que empieza todo contenido binario cifrado. */
export const MAGIA = new Uint8Array([0, ...codificador.encode('CHEM-CIFRADO-v1'), 0]);

export function tieneMagia(bytes: Uint8Array): boolean {
  return bytes.length > MAGIA.length && MAGIA.every((b, i) => bytes[i] === b);
}

/** Cifra bytes junto con su content-type: MAGIA + iv + cifrado("<tipo>\n<datos>"). */
export async function cifrarBinario(
  clave: CryptoKey, tipo: string, datos: Uint8Array, ctx: Uint8Array,
): Promise<Uint8Array> {
  return unir(MAGIA, await sellar(clave, unir(codificador.encode(`${tipo}\n`), datos), ctx));
}

/** Inverso de cifrarBinario: devuelve el content-type original y los bytes. */
export async function descifrarBinario(
  clave: CryptoKey, crudo: Uint8Array, ctx: Uint8Array,
): Promise<{ tipo: string; datos: Uint8Array }> {
  const claro = await abrir(clave, crudo.subarray(MAGIA.length), ctx);
  const corte = claro.indexOf(10);   // primer salto de línea
  if (corte < 0) throw new Error('Mensaje binario mal formado.');
  return { tipo: decodificador.decode(claro.subarray(0, corte)), datos: claro.subarray(corte + 1) };
}

/**
 * Convierte un FormData en los bytes multipart que enviaría el navegador,
 * para poder cifrarlos. Devuelve también el content-type con su frontera.
 */
export async function formularioABytes(formulario: FormData): Promise<{ tipo: string; bytes: Uint8Array }> {
  const azar = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const frontera = '----chem' + Array.from(azar, b => b.toString(16).padStart(2, '0')).join('');
  // Los nombres van entre comillas en la cabecera: se escapan como hace el navegador.
  const escapar = (t: string) => t.replace(/\r\n|\r|\n/g, '%0D%0A').replace(/"/g, '%22');
  const partes: Uint8Array[] = [];
  const texto = (t: string) => partes.push(codificador.encode(t));

  for (const [nombre, valor] of formulario.entries()) {
    texto(`--${frontera}\r\n`);
    if (typeof valor === 'string') {
      texto(`Content-Disposition: form-data; name="${escapar(nombre)}"\r\n\r\n${valor}\r\n`);
    } else {
      texto(`Content-Disposition: form-data; name="${escapar(nombre)}"; filename="${escapar(valor.name || 'archivo')}"\r\n`);
      texto(`Content-Type: ${valor.type || 'application/octet-stream'}\r\n\r\n`);
      partes.push(new Uint8Array(await valor.arrayBuffer()));
      texto('\r\n');
    }
  }
  texto(`--${frontera}--\r\n`);
  return { tipo: `multipart/form-data; boundary=${frontera}`, bytes: unir(...partes) };
}