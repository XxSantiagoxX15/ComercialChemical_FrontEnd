import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Rutas y direcciones que usan la configuración de Playwright, la preparación
 * global y las pruebas. Todo se puede cambiar con variables de entorno.
 */
const FRONTEND = resolve(__dirname, '..', '..');
const E2E = join(FRONTEND, 'e2e');

/**
 * Carpeta del backend: la de BACKEND_DIR o, si no se indica, la primera de
 * estas que tenga manage.py. La segunda es para cuando el frontend está dentro
 * de su propia carpeta (…\Comercial_Chemical_Frontend\ComercialChemicalFrontEnd).
 */
function buscarBackend(): string {
  if (process.env['BACKEND_DIR']) return resolve(process.env['BACKEND_DIR']);
  const candidatos = [
    join(FRONTEND, '..', 'Comercia_Chemical_Backend'),
    join(FRONTEND, '..', '..', 'Comercia_Chemical_Backend'),
    join(FRONTEND, '..', 'Comercial_Chemical_Backend'),
    join(FRONTEND, '..', '..', 'Comercial_Chemical_Backend'),
  ].map(c => resolve(c));
  return candidatos.find(c => existsSync(join(c, 'manage.py'))) ?? candidatos[0];
}

const carpetaDelBackend = buscarBackend();

/** Python del entorno virtual del backend si existe; si no, el del sistema. */
function buscarPython(): string {
  if (process.env['PYTHON']) return process.env['PYTHON'];
  const candidatos = [
    join(carpetaDelBackend, 'venv', 'Scripts', 'python.exe'),
    join(carpetaDelBackend, '.venv', 'Scripts', 'python.exe'),
    join(carpetaDelBackend, 'venv', 'bin', 'python'),
    join(carpetaDelBackend, '.venv', 'bin', 'python'),
  ];
  return candidatos.find(existsSync) ?? (process.platform === 'win32' ? 'python' : 'python3');
}

const temporal = resolve(process.env['E2E_TMP'] ?? join(E2E, '.tmp'));

export const ENTORNO = {
  frontend: FRONTEND,
  e2e: E2E,
  backend: carpetaDelBackend,
  python: buscarPython(),
  temporal,
  correos: join(temporal, 'correos'),
  informes: join(temporal, 'informes'),
  /** Dirección de la aplicación. localhost (no una IP) para que el cifrado funcione. */
  urlFrontend: process.env['E2E_FRONTEND_URL'] ?? 'http://localhost:4200',
  /** El frontend llama siempre al puerto 8000 del mismo equipo. */
  urlBackend: 'http://127.0.0.1:8000',
};
