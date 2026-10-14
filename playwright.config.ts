import { defineConfig, devices } from '@playwright/test';
import { ENTORNO } from './e2e/soporte/entorno';

/**
 * Pruebas de punta a punta de CHEM-MODINV (Playwright + patrón Screenplay).
 *
 *   npx playwright test            ejecuta todo
 *   npx playwright test --ui       modo interactivo
 *   npx playwright show-report e2e/informe
 *
 * Al terminar se generan también e2e/informe-pruebas/informe-pruebas.html y
 * e2e/informe-pruebas/matriz-casos-de-prueba.xlsx.
 *
 * Playwright levanta los dos servidores:
 *   · el backend de PRUEBAS (e2e/backend/servidor.py): base SQLite nueva en
 *     cada ejecución, con usuarios de prueba; nunca toca la base de trabajo;
 *   · el frontend (npm start), salvo que ya esté abierto en el puerto 4200.
 */
export default defineConfig({
  testDir: './e2e/specs',
  outputDir: './e2e/.tmp/resultados',
  globalSetup: './e2e/soporte/preparacion-global.ts',

  // Todas las pruebas comparten una sola base de datos y algunas cambian
  // permisos o importan datos: se ejecutan de una en una y en orden.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env['CI'],

  timeout: 60_000,
  expect: { timeout: 10_000 },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/informe', open: 'never' }],
    // Informe en español (HTML imprimible) y matriz de casos en Excel.
    ['./e2e/soporte/informe-de-pruebas.ts', { carpeta: 'e2e/informe-pruebas' }],
  ],

  use: {
    baseURL: ENTORNO.urlFrontend,
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: [
    {
      name: 'backend de pruebas',
      command: `"${ENTORNO.python}" "e2e/backend/servidor.py"`,
      url: `${ENTORNO.urlBackend}/e2e/estado/`,
      // Nunca se reutiliza: cada ejecución empieza con la base recién creada.
      reuseExistingServer: false,
      timeout: 120_000,
      env: { BACKEND_DIR: ENTORNO.backend, E2E_TMP: ENTORNO.temporal },
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      name: 'frontend',
      command: 'npm start',
      url: ENTORNO.urlFrontend,
      reuseExistingServer: true,
      timeout: 240_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});