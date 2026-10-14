import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Cuenta } from '../screenplay/habilidades';

/**
 * Usuarios de prueba. Están en usuarios.json porque los leen dos programas:
 * el backend de pruebas (que los crea en su base de datos al arrancar) y
 * estas pruebas (que inician sesión con ellos).
 */
export type Personaje = 'administrador' | 'analista' | 'compras' | 'olvidadizo' | 'descuidado';

export const USUARIOS: Record<Personaje, Cuenta> =
  JSON.parse(readFileSync(join(__dirname, 'usuarios.json'), 'utf-8'));

/** Nombre del rol tal como lo muestra el encabezado de la aplicación. */
export const ROL_EN_PANTALLA: Record<string, string> = {
  Administrador: 'Administrador',
  Analista_Inventarios: 'Analista de Inventarios',
  Responsable_Compras: 'Responsable de Compras',
};
