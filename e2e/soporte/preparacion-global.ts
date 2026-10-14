import { generarInformes } from '../datos/informes';
import { ENTORNO } from './entorno';

/**
 * Se ejecuta una vez, antes de la primera prueba y con los servidores ya
 * levantados.
 *
 *  1. Comprueba que el backend del puerto 8000 es el de PRUEBAS: si fuera el
 *     de trabajo, las pruebas importarían archivos y cambiarían permisos y
 *     contraseñas sobre datos reales, así que se detiene todo antes de empezar.
 *  2. Genera los dos Excel de prueba que usa la importación.
 */
export default async function prepararTodo(): Promise<void> {
  let estado: { e2e?: boolean; base_de_datos?: string } = {};
  try {
    const respuesta = await fetch(`${ENTORNO.urlBackend}/e2e/estado/`);
    if (respuesta.ok) estado = await respuesta.json();
  } catch {
    // Sin respuesta: se trata igual que un backend que no es el de pruebas.
  }

  if (estado.e2e !== true) {
    throw new Error(
      'El backend que responde en el puerto 8000 NO es el de pruebas.\n' +
      'Detén tu "python manage.py runserver" habitual y vuelve a ejecutar: ' +
      'Playwright levanta su propio backend con una base de datos aparte.',
    );
  }
  await generarInformes(ENTORNO.informes);
  console.log(`[e2e] Backend de pruebas listo (base: ${estado.base_de_datos}).`);
}
