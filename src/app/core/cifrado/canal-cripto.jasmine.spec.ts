import {
  aBase64, abrirCanal, cifrarBinario, cifrarTexto, ClavesCanal, contexto, deBase64,
  descifrarBinario, descifrarTexto, esSobre, formularioABytes, MAGIA, tieneMagia,
} from './canal-cripto';

/**
 * Criptografía del canal cifrado. Para comprobarla de verdad, la prueba hace
 * de servidor: tiene su propio par de claves y deriva sus claves AES con el
 * mismo procedimiento que el backend (ECDH P-256 + HKDF-SHA256).
 */
describe('Canal cifrado: criptografía (Jasmine)', () => {
  const CURVA = { name: 'ECDH', namedCurve: 'P-256' };
  const texto = new TextEncoder();
  const lector = new TextDecoder();

  interface Servidor { peticion: CryptoKey; respuesta: CryptoKey; }

  let navegador: ClavesCanal;
  let servidor: Servidor;

  /** Lo que hace el backend al recibir la clave pública del navegador (encabezado X-Canal). */
  async function clavesDelServidor(par: CryptoKeyPair, publicaNavegador: string): Promise<Servidor> {
    const api = crypto.subtle;
    const navegadorBytes = deBase64(publicaNavegador);
    const servidorBytes = new Uint8Array(await api.exportKey('raw', par.publicKey));
    const publica = await api.importKey('raw', navegadorBytes as BufferSource, CURVA, false, []);
    const secreto = await api.deriveBits({ name: 'ECDH', public: publica }, par.privateKey, 256);

    const ambas = new Uint8Array([...navegadorBytes, ...servidorBytes]);
    const sal = await api.digest('SHA-256', ambas);
    const base = await api.importKey('raw', secreto, 'HKDF', false, ['deriveKey']);
    const derivar = (sentido: string, uso: KeyUsage) => api.deriveKey(
      { name: 'HKDF', hash: 'SHA-256', salt: sal, info: texto.encode(`chem-modinv/canal/v1/${sentido}`) },
      base, { name: 'AES-GCM', length: 256 }, false, [uso]);
    return { peticion: await derivar('peticion', 'decrypt'), respuesta: await derivar('respuesta', 'encrypt') };
  }

  async function servidorAbre(clave: CryptoKey, datosBase64: string, ctx: Uint8Array): Promise<string> {
    const sellado = deBase64(datosBase64);
    const claro = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: sellado.subarray(0, 12) as BufferSource, additionalData: ctx as BufferSource },
      clave, sellado.subarray(12) as BufferSource);
    return lector.decode(claro);
  }

  async function servidorSella(clave: CryptoKey, datos: Uint8Array, ctx: Uint8Array): Promise<Uint8Array> {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cifrado = new Uint8Array(await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv, additionalData: ctx as BufferSource }, clave, datos as BufferSource));
    return new Uint8Array([...iv, ...cifrado]);
  }

  beforeEach(async () => {
    const parServidor = await crypto.subtle.generateKey(CURVA, true, ['deriveBits']) as CryptoKeyPair;
    const publicaServidor = aBase64(new Uint8Array(await crypto.subtle.exportKey('raw', parServidor.publicKey)));
    navegador = await abrirCanal(publicaServidor);
    servidor = await clavesDelServidor(parServidor, navegador.encabezado);
  });

  describe('peticiones y respuestas', () => {
    const login = JSON.stringify({ correo: 'ada@chem.test', contrasena: 'Secreta#2026' });
    const ctxLogin = () => contexto('PET', 'post', '/api/auth/login/');

    it('el servidor descifra lo que envía el navegador', async () => {
      const sobre = await cifrarTexto(navegador.peticion, login, ctxLogin());
      expect(await servidorAbre(servidor.peticion, sobre.datos, ctxLogin())).toBe(login);
    });

    it('el navegador descifra lo que responde el servidor', async () => {
      const ctx = contexto('RES', 'POST', '/api/auth/login/');
      const respuesta = '{"access_token":"abc","user":{"nombre_completo":"Ada"}}';
      const sellado = await servidorSella(servidor.respuesta, texto.encode(respuesta), ctx);
      expect(await descifrarTexto(navegador.respuesta, { cifrado: 'v1', datos: aBase64(sellado) }, ctx))
        .toBe(respuesta);
    });

    it('por la red solo viaja un sobre: ni el correo ni la contraseña se pueden leer', async () => {
      const sobre = await cifrarTexto(navegador.peticion, login, ctxLogin());
      expect(esSobre(sobre)).toBeTrue();
      const visible = JSON.stringify(sobre) + atob(sobre.datos);
      expect(visible).not.toContain('ada@chem.test');
      expect(visible).not.toContain('Secreta#2026');
    });

    it('el mismo mensaje cifrado dos veces da resultados distintos', async () => {
      const a = await cifrarTexto(navegador.peticion, login, ctxLogin());
      const b = await cifrarTexto(navegador.peticion, login, ctxLogin());
      expect(a.datos).not.toBe(b.datos);
    });
  });

  describe('integridad: cualquier alteración se rechaza', () => {
    const ctx = () => contexto('RES', 'GET', '/api/auth/me/');
    let sobre: { cifrado: 'v1'; datos: string };

    beforeEach(async () => {
      const sellado = await servidorSella(servidor.respuesta, texto.encode('{"rol":"Analista"}'), ctx());
      sobre = { cifrado: 'v1', datos: aBase64(sellado) };
    });

    it('si se cambia un solo byte del mensaje', async () => {
      const bytes = deBase64(sobre.datos);
      bytes[bytes.length - 1] ^= 0x01;
      await expectAsync(descifrarTexto(navegador.respuesta, { cifrado: 'v1', datos: aBase64(bytes) }, ctx()))
        .toBeRejected();
    });

    it('si la respuesta de una ruta se hace pasar por la de otra', async () => {
      await expectAsync(descifrarTexto(navegador.respuesta, sobre, contexto('RES', 'GET', '/api/auth/usuarios/')))
        .toBeRejected();
    });

    it('si cambia el método o el sentido del mensaje', async () => {
      await expectAsync(descifrarTexto(navegador.respuesta, sobre, contexto('RES', 'POST', '/api/auth/me/')))
        .toBeRejected();
      await expectAsync(descifrarTexto(navegador.respuesta, sobre, contexto('PET', 'GET', '/api/auth/me/')))
        .toBeRejected();
    });

    it('lo que envía el navegador no se puede descifrar con la clave de las respuestas', async () => {
      const propio = await cifrarTexto(navegador.peticion, 'hola', ctx());
      await expectAsync(descifrarTexto(navegador.respuesta, propio, ctx())).toBeRejected();
    });
  });

  describe('archivos (subidas y descargas)', () => {
    const ctx = () => contexto('RES', 'GET', '/api/pronosticos/mas-vendidos/exportar/');

    it('lo binario cifrado empieza por la marca del canal', async () => {
      const cifrado = await cifrarBinario(navegador.peticion, 'application/pdf', new Uint8Array([1, 2, 3]), ctx());
      expect(tieneMagia(cifrado)).toBeTrue();
      expect(Array.from(cifrado.subarray(0, MAGIA.length))).toEqual(Array.from(MAGIA));
      expect(tieneMagia(new Uint8Array([37, 80, 68, 70]))).toBeFalse();   // «%PDF» sin cifrar
    });

    it('una descarga del servidor se descifra con su tipo y sus bytes originales', async () => {
      const pdf = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55, 0, 255]);
      const sellado = await servidorSella(servidor.respuesta, new Uint8Array([...texto.encode('application/pdf\n'), ...pdf]), ctx());
      const resultado = await descifrarBinario(navegador.respuesta, new Uint8Array([...MAGIA, ...sellado]), ctx());
      expect(resultado.tipo).toBe('application/pdf');
      expect(Array.from(resultado.datos)).toEqual(Array.from(pdf));
    });

    it('rechaza un binario sin la línea del tipo de contenido', async () => {
      const sellado = await servidorSella(servidor.respuesta, texto.encode('sin-salto-de-linea'), ctx());
      await expectAsync(descifrarBinario(navegador.respuesta, new Uint8Array([...MAGIA, ...sellado]), ctx()))
        .toBeRejectedWithError(/mal formado/);
    });

    it('arma el formulario de la importación igual que el navegador', async () => {
      const formulario = new FormData();
      formulario.append('file', new File(['contenido-excel'], 'Informe "Kardex".xlsx', { type: 'application/vnd.ms-excel' }));
      formulario.append('tipo_informe', 'Informe_Kardex');

      const { tipo, bytes } = await formularioABytes(formulario);
      const frontera = tipo.split('boundary=')[1];
      const cuerpo = lector.decode(bytes);

      expect(tipo).toMatch(/^multipart\/form-data; boundary=----chem[0-9a-f]{32}$/);
      expect(cuerpo).toContain('name="file"; filename="Informe %22Kardex%22.xlsx"');
      expect(cuerpo).toContain('Content-Type: application/vnd.ms-excel\r\n\r\ncontenido-excel\r\n');
      expect(cuerpo).toContain('name="tipo_informe"\r\n\r\nInforme_Kardex\r\n');
      expect(cuerpo.endsWith(`--${frontera}--\r\n`)).toBeTrue();
    });
  });

  describe('utilidades', () => {
    it('base64 conserva archivos grandes byte a byte', () => {
      const grande = Uint8Array.from({ length: 100_000 }, (_, i) => (i * 7919) % 256);
      expect(Array.from(deBase64(aBase64(grande)))).toEqual(Array.from(grande));
    });

    it('solo reconoce como sobre el formato exacto del canal', () => {
      expect(esSobre({ cifrado: 'v1', datos: 'abc' })).toBeTrue();
      expect(esSobre({ cifrado: 'v2', datos: 'abc' })).toBeFalse();
      expect(esSobre({ cifrado: 'v1', datos: 'abc', extra: 1 })).toBeFalse();
      expect(esSobre({ results: [] })).toBeFalse();
      expect(esSobre(null)).toBeFalse();
    });
  });
});