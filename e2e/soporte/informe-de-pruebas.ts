import ExcelJS from 'exceljs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import type {
  FullConfig, FullResult, Reporter, Suite, TestCase, TestResult, TestStep,
} from '@playwright/test/reporter';

import { ROL_EN_PANTALLA, USUARIOS } from '../datos/usuarios';

/**
 * INFORME DE PRUEBAS
 *
 * Reporte propio de Playwright. Al terminar cada ejecución escribe, en la
 * carpeta indicada (por defecto e2e/informe-pruebas):
 *
 *   · informe-pruebas.html          Informe en español, listo para imprimir o
 *                                   guardar como PDF (Ctrl+P en el navegador).
 *   · matriz-casos-de-prueba.xlsx   Matriz de casos de prueba: resumen, un caso
 *                                   por fila y el detalle de los pasos.
 *
 * Los pasos salen de las actividades del patrón Screenplay («Ada
 * Administradora inicia sesión…»), así que el informe se lee como un guion.
 * Se registra en playwright.config.ts, en la lista `reporter`.
 */

interface Opciones {
  carpeta?: string;
  proyecto?: string;
}

type Estado = 'aprobada' | 'fallida' | 'omitida' | 'inestable';

interface Paso {
  titulo: string;
  momento: 'preparación' | 'prueba' | 'limpieza';
  duracion: number;
  error?: string;
  subpasos: Paso[];
}

interface Caso {
  id: string;
  modulo: string;
  archivo: string;
  linea: number;
  titulo: string;
  estado: Estado;
  duracion: number;
  intentos: number;
  actores: string[];
  pasos: Paso[];
  error?: string;
  capturas: string[];     // imágenes en base64 (solo de las pruebas que fallan)
}

const ETIQUETA: Record<Estado, string> = {
  aprobada: 'Aprobada', fallida: 'Fallida', omitida: 'No ejecutada', inestable: 'Aprobada al reintentar',
};

const ACTORES = [...Object.values(USUARIOS).map(u => u.nombre), 'Un visitante'];

/** Quita los códigos de color de la terminal que traen los mensajes de error. */
const sinColores = (texto = '') => texto.replace(/\u001b\[[0-9;]*m/g, '');

const escapar = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const segundos = (ms: number) => (ms / 1000).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function duracionLegible(ms: number): string {
  const total = Math.round(ms / 1000);
  const minutos = Math.floor(total / 60);
  return minutos ? `${minutos} min ${total % 60} s` : `${total} s`;
}

export default class InformeDePruebas implements Reporter {
  private readonly carpeta: string;
  private readonly proyecto: string;
  private raiz = process.cwd();
  private inicio = new Date();
  private suite?: Suite;
  private navegador = '';

  constructor(opciones: Opciones = {}) {
    this.carpeta = resolve(opciones.carpeta ?? 'e2e/informe-pruebas');
    this.proyecto = opciones.proyecto ?? 'CHEM-MODINV — Comercial Chemical S.A.S.';
  }

  onBegin(config: FullConfig, suite: Suite): void {
    // Rutas de los archivos relativas a la carpeta del frontend (donde está la configuración).
    this.raiz = config.configFile ? dirname(config.configFile) : config.rootDir;
    this.inicio = new Date();
    this.suite = suite;
    this.navegador = config.projects.map(p => p.name).join(', ');
  }

  async onEnd(resultado: FullResult): Promise<void> {
    if (!this.suite) return;
    const casos = this.suite.allTests().map((test, i) => this.caso(test, i));
    const fin = new Date();

    // Si no llegó a ejecutarse ninguna prueba (por ejemplo, el backend no
    // arrancó), no se escribe nada: se conserva el informe anterior.
    if (casos.every(c => c.estado === 'omitida' && c.pasos.length === 0) && resultado.status !== 'passed') {
      console.log('\n[informe] No se ejecutó ninguna prueba: se conserva el informe anterior.\n');
      return;
    }

    mkdirSync(this.carpeta, { recursive: true });
    const html = join(this.carpeta, 'informe-pruebas.html');
    const excel = join(this.carpeta, 'matriz-casos-de-prueba.xlsx');
    writeFileSync(html, this.html(casos, resultado, fin), 'utf-8');
    await this.excel(casos, fin).xlsx.writeFile(excel);

    const fallidas = casos.filter(c => c.estado === 'fallida').length;
    console.log(`\n[informe] ${casos.length} casos, ${fallidas} fallidos.`);
    console.log(`[informe] ${relative(process.cwd(), html)}`);
    console.log(`[informe] ${relative(process.cwd(), excel)}\n`);
  }

  /** No hace falta que Playwright espere a este reporte para mostrar su salida. */
  printsToStdio(): boolean {
    return false;
  }

  // ── Datos de cada caso ──────────────────────────────────────────────────

  private caso(test: TestCase, indice: number): Caso {
    const resultado: TestResult | undefined = test.results.at(-1);
    const estado: Estado =
      test.outcome() === 'skipped' ? 'omitida'
        : test.outcome() === 'flaky' ? 'inestable'
          : test.outcome() === 'expected' ? 'aprobada' : 'fallida';

    const pasos = resultado ? this.pasosDe(resultado.steps, 'prueba') : [];
    const textoPasos = JSON.stringify(pasos);

    return {
      id: `CP-${String(indice + 1).padStart(2, '0')}`,
      modulo: test.parent.title || relative(this.raiz, test.location.file).replace(/\\/g, '/'),
      archivo: relative(this.raiz, test.location.file).replace(/\\/g, '/'),
      linea: test.location.line,
      titulo: test.title,
      estado,
      duracion: resultado?.duration ?? 0,
      intentos: test.results.length,
      actores: ACTORES.filter(nombre => textoPasos.includes(`"${nombre} `)),
      pasos,
      error: resultado?.errors.length
        ? sinColores(resultado.errors.map(e => e.message ?? e.value ?? '').join('\n\n'))
        : undefined,
      capturas: (resultado?.attachments ?? [])
        .filter(a => a.contentType === 'image/png' && (a.body || a.path))
        .map(a => (a.body ?? readFileSync(a.path!)).toString('base64')),
    };
  }

  /**
   * Las actividades de Screenplay son pasos «test.step». Se toman las más
   * externas; las que ocurren dentro de los ganchos (beforeAll, afterEach…)
   * se marcan como preparación o limpieza.
   */
  private pasosDe(pasos: TestStep[], momento: Paso['momento']): Paso[] {
    const lista: Paso[] = [];
    for (const paso of pasos) {
      if (paso.category === 'test.step') {
        lista.push({
          titulo: paso.title,
          momento,
          duracion: paso.duration,
          error: paso.error ? sinColores(paso.error.message ?? '') : undefined,
          subpasos: this.pasosDe(paso.steps, momento),
        });
      } else if (paso.category === 'hook' || paso.category === 'fixture') {
        const enGancho = /after/i.test(paso.title) ? 'limpieza' : momento === 'prueba' ? 'preparación' : momento;
        lista.push(...this.pasosDe(paso.steps, paso.category === 'hook' ? enGancho : momento));
      }
    }
    return lista;
  }

  // ── Informe HTML ────────────────────────────────────────────────────────

  private html(casos: Caso[], resultado: FullResult, fin: Date): string {
    const cuenta = (estado: Estado) => casos.filter(c => c.estado === estado).length;
    const aprobadas = cuenta('aprobada') + cuenta('inestable');
    const ejecutadas = casos.length - cuenta('omitida');
    const porcentaje = ejecutadas ? Math.round((aprobadas / ejecutadas) * 100) : 0;
    const modulos = [...new Set(casos.map(c => c.modulo))];
    const fecha = fin.toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short' });
    const veredicto = resultado.status === 'passed' && cuenta('fallida') === 0;

    const filasModulos = modulos.map(modulo => {
      const delModulo = casos.filter(c => c.modulo === modulo);
      const ok = delModulo.filter(c => c.estado === 'aprobada' || c.estado === 'inestable').length;
      const mal = delModulo.filter(c => c.estado === 'fallida').length;
      const pct = Math.round((ok / delModulo.length) * 100);
      return `<tr>
        <td>${escapar(modulo)}</td><td class="num">${delModulo.length}</td>
        <td class="num ok">${ok}</td><td class="num ${mal ? 'mal' : ''}">${mal}</td>
        <td><div class="barra"><span style="width:${pct}%"></span></div></td>
        <td class="num">${duracionLegible(delModulo.reduce((t, c) => t + c.duracion, 0))}</td></tr>`;
    }).join('');

    const indice = casos.map(c => `<tr>
        <td><a href="#${c.id}">${c.id}</a></td><td>${escapar(c.modulo)}</td><td>${escapar(c.titulo)}</td>
        <td><span class="estado ${c.estado}">${ETIQUETA[c.estado]}</span></td>
        <td class="num">${segundos(c.duracion)} s</td></tr>`).join('');

    const detalle = casos.map(c => this.htmlDelCaso(c)).join('');

    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Informe de pruebas — CHEM-MODINV</title>
<style>
  :root { --tinta:#1f2937; --suave:#6b7280; --borde:#e5e7eb; --marca:#1a237e; --ok:#15803d; --okf:#dcfce7; --mal:#b91c1c; --malf:#fee2e2; --aviso:#a16207; --avisof:#fef9c3; }
  * { box-sizing: border-box; }
  body { margin:0; font: 14px/1.5 "Segoe UI", system-ui, sans-serif; color:var(--tinta); background:#f8fafc; }
  main { max-width: 1000px; margin: 0 auto; padding: 32px 20px 64px; background:#fff; }
  header { border-bottom: 3px solid var(--marca); padding-bottom: 16px; margin-bottom: 24px; }
  header h1 { margin:0; font-size: 26px; color: var(--marca); }
  header p { margin: 4px 0 0; color: var(--suave); }
  h2 { font-size: 18px; color: var(--marca); margin: 32px 0 12px; border-bottom: 1px solid var(--borde); padding-bottom: 6px; }
  .datos { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px,1fr)); gap: 4px 24px; color: var(--suave); }
  .datos b { color: var(--tinta); font-weight: 600; }
  .tarjetas { display:grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 12px; margin: 20px 0; }
  .tarjeta { border:1px solid var(--borde); border-radius: 8px; padding: 14px; }
  .tarjeta .valor { font-size: 28px; font-weight: 700; }
  .tarjeta .rotulo { color: var(--suave); font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  .veredicto { padding: 12px 16px; border-radius: 8px; font-weight: 600; }
  .veredicto.ok { background: var(--okf); color: var(--ok); }
  .veredicto.mal { background: var(--malf); color: var(--mal); }
  table { width:100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align:left; padding: 7px 8px; border-bottom: 1px solid var(--borde); vertical-align: top; }
  th { background:#f1f5f9; font-weight:600; }
  td.num, th.num { text-align:right; white-space: nowrap; }
  td:first-child a { white-space: nowrap; }
  .ok { color: var(--ok); } .mal { color: var(--mal); font-weight: 600; }
  .barra { height: 8px; background: var(--malf); border-radius: 4px; overflow: hidden; min-width: 80px; }
  .barra span { display:block; height:100%; background: var(--ok); }
  .estado { display:inline-block; padding: 1px 8px; border-radius: 10px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .estado.aprobada { background: var(--okf); color: var(--ok); }
  .estado.fallida { background: var(--malf); color: var(--mal); }
  .estado.inestable, .estado.omitida { background: var(--avisof); color: var(--aviso); }
  a { color: var(--marca); }
  .caso { border:1px solid var(--borde); border-radius: 8px; padding: 14px 16px; margin: 14px 0; break-inside: avoid; }
  .caso.fallida { border-color: #fca5a5; }
  .caso h3 { margin: 0 0 4px; font-size: 15px; display:flex; gap: 10px; align-items: baseline; flex-wrap: wrap; }
  .caso .meta { color: var(--suave); font-size: 12px; margin-bottom: 10px; }
  ol.pasos { margin: 0; padding-left: 22px; }
  ol.pasos li { margin: 2px 0; }
  ol.pasos li.fallo { color: var(--mal); font-weight: 600; }
  .momento { color: var(--suave); font-size: 11px; text-transform: uppercase; margin-right: 4px; }
  .tiempo { color: var(--suave); font-size: 12px; margin-left: 6px; }
  details summary { cursor: pointer; }
  details ol { font-size: 12px; color: var(--suave); }
  pre.error { background: var(--malf); color: #7f1d1d; padding: 10px 12px; border-radius: 6px; white-space: pre-wrap; font-size: 12px; overflow-x:auto; }
  img.captura { max-width: 100%; border: 1px solid var(--borde); border-radius: 6px; margin-top: 8px; }
  footer { margin-top: 40px; color: var(--suave); font-size: 12px; text-align:center; }
  @media print {
    body { background:#fff; } main { padding: 0; max-width: none; }
    a { color: inherit; text-decoration: none; }
    details { display:block; } details > summary { display:none; }
    h2 { break-after: avoid; }
  }
</style>
</head>
<body>
<main>
  <header>
    <h1>Informe de pruebas de punta a punta</h1>
    <p>${escapar(this.proyecto)}</p>
  </header>

  <div class="datos">
    <div>Fecha de ejecución: <b>${fecha}</b></div>
    <div>Duración total: <b>${duracionLegible(fin.getTime() - this.inicio.getTime())}</b></div>
    <div>Herramienta: <b>Playwright · patrón Screenplay</b></div>
    <div>Navegador: <b>${escapar(this.navegador)}</b></div>
  </div>

  <div class="tarjetas">
    <div class="tarjeta"><div class="valor">${casos.length}</div><div class="rotulo">Casos de prueba</div></div>
    <div class="tarjeta"><div class="valor ok">${aprobadas}</div><div class="rotulo">Aprobados</div></div>
    <div class="tarjeta"><div class="valor ${cuenta('fallida') ? 'mal' : ''}">${cuenta('fallida')}</div><div class="rotulo">Fallidos</div></div>
    <div class="tarjeta"><div class="valor">${cuenta('omitida')}</div><div class="rotulo">No ejecutados</div></div>
    <div class="tarjeta"><div class="valor">${porcentaje}%</div><div class="rotulo">Tasa de éxito</div></div>
  </div>

  <div class="veredicto ${veredicto ? 'ok' : 'mal'}">
    ${veredicto
      ? 'Resultado: todas las pruebas ejecutadas pasaron.'
      : `Resultado: ${cuenta('fallida')} caso(s) fallaron. El detalle de cada fallo está más abajo.`}
  </div>

  <h2>1. Alcance y entorno</h2>
  <p>Las pruebas usan la aplicación como lo haría una persona: abren el navegador, inician sesión,
  hacen clic, suben archivos y leen lo que aparece en pantalla. El frontend y el backend funcionan de
  verdad, con el cifrado de la API activo. El backend de pruebas usa una base de datos SQLite propia,
  creada desde cero en cada ejecución, y los correos se guardan como archivos en lugar de enviarse.</p>
  <p>Actores que participan: ${Object.values(USUARIOS).map(u => `<b>${escapar(u.nombre)}</b> (${escapar(ROL_EN_PANTALLA[u.rol] ?? u.rol)})`).join(', ')} y un visitante sin cuenta.</p>

  <h2>2. Resultados por módulo</h2>
  <table>
    <thead><tr><th>Módulo</th><th class="num">Casos</th><th class="num">Aprobados</th><th class="num">Fallidos</th><th>Avance</th><th class="num">Duración</th></tr></thead>
    <tbody>${filasModulos}</tbody>
  </table>

  <h2>3. Casos de prueba</h2>
  <table>
    <thead><tr><th>ID</th><th>Módulo</th><th>Caso</th><th>Resultado</th><th class="num">Duración</th></tr></thead>
    <tbody>${indice}</tbody>
  </table>

  <h2>4. Detalle de la ejecución</h2>
  ${detalle}

  <footer>Generado automáticamente por Playwright al terminar la ejecución · ${fecha}</footer>
</main>
</body>
</html>
`;
  }

  private htmlDelCaso(c: Caso): string {
    const paso = (p: Paso): string => {
      const sub = p.subpasos.length
        ? `<details><summary>${p.subpasos.length} acción(es)</summary><ol>${p.subpasos.map(paso).join('')}</ol></details>`
        : '';
      const momento = p.momento === 'prueba' ? '' : `<span class="momento">${p.momento}</span>`;
      return `<li class="${p.error ? 'fallo' : ''}">${momento}${escapar(p.titulo)}<span class="tiempo">${segundos(p.duracion)} s</span>${sub}</li>`;
    };
    const capturas = c.capturas.map(img => `<img class="captura" alt="Pantalla al fallar" src="data:image/png;base64,${img}">`).join('');

    return `<section class="caso ${c.estado}" id="${c.id}">
    <h3>${c.id} · ${escapar(c.titulo)} <span class="estado ${c.estado}">${ETIQUETA[c.estado]}</span></h3>
    <div class="meta">${escapar(c.modulo)} · ${escapar(c.archivo)}:${c.linea} · ${segundos(c.duracion)} s${c.intentos > 1 ? ` · ${c.intentos} intentos` : ''}${c.actores.length ? ` · Actores: ${c.actores.map(escapar).join(', ')}` : ''}</div>
    ${c.pasos.length ? `<ol class="pasos">${c.pasos.map(paso).join('')}</ol>` : '<p class="meta">Sin pasos registrados.</p>'}
    ${c.error ? `<pre class="error">${escapar(c.error)}</pre>` : ''}
    ${capturas}
  </section>`;
  }

  // ── Matriz en Excel ─────────────────────────────────────────────────────

  private excel(casos: Caso[], fin: Date): ExcelJS.Workbook {
    const libro = new ExcelJS.Workbook();
    libro.creator = 'Playwright';
    libro.created = fin;

    const COLOR = { marca: 'FF1A237E', ok: 'FFDCFCE7', mal: 'FFFEE2E2', aviso: 'FFFEF9C3' };
    const encabezado = (hoja: ExcelJS.Worksheet) => {
      const fila = hoja.getRow(1);
      fila.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      fila.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR.marca } };
      fila.alignment = { vertical: 'middle' };
      hoja.views = [{ state: 'frozen', ySplit: 1 }];
      hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: hoja.columnCount } };
    };
    const relleno = (estado: Estado) => ({
      type: 'pattern' as const, pattern: 'solid' as const,
      fgColor: { argb: estado === 'fallida' ? COLOR.mal : estado === 'aprobada' ? COLOR.ok : COLOR.aviso },
    });

    // Resumen
    const resumen = libro.addWorksheet('Resumen');
    const aprobadas = casos.filter(c => c.estado === 'aprobada' || c.estado === 'inestable').length;
    const fallidas = casos.filter(c => c.estado === 'fallida').length;
    const ejecutadas = casos.filter(c => c.estado !== 'omitida').length;
    resumen.columns = [{ width: 28 }, { width: 50 }];
    resumen.addRows([
      ['Informe de pruebas de punta a punta'],
      ['Proyecto', this.proyecto],
      ['Fecha de ejecución', fin.toLocaleString('es-CO')],
      ['Herramienta', 'Playwright · patrón Screenplay'],
      ['Navegador', this.navegador],
      [],
      ['Casos de prueba', casos.length],
      ['Aprobados', aprobadas],
      ['Fallidos', fallidas],
      ['No ejecutados', casos.length - ejecutadas],
      ['Tasa de éxito', ejecutadas ? aprobadas / ejecutadas : 0],
    ]);
    resumen.getCell('A1').font = { bold: true, size: 14, color: { argb: COLOR.marca } };
    resumen.getCell('B11').numFmt = '0%';
    for (let fila = 2; fila <= 11; fila++) resumen.getCell(`A${fila}`).font = { bold: true };

    // Casos
    const hojaCasos = libro.addWorksheet('Casos de prueba');
    hojaCasos.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Módulo', key: 'modulo', width: 30 },
      { header: 'Caso de prueba', key: 'titulo', width: 60 },
      { header: 'Actores', key: 'actores', width: 30 },
      { header: 'Pasos', key: 'pasos', width: 8 },
      { header: 'Resultado esperado', key: 'esperado', width: 40 },
      { header: 'Resultado obtenido', key: 'estado', width: 22 },
      { header: 'Duración (s)', key: 'duracion', width: 12 },
      { header: 'Observaciones', key: 'error', width: 60 },
      { header: 'Archivo', key: 'archivo', width: 36 },
    ];
    for (const c of casos) {
      const fila = hojaCasos.addRow({
        id: c.id, modulo: c.modulo, titulo: c.titulo, actores: c.actores.join(', '),
        pasos: c.pasos.length,
        esperado: 'Todas las comprobaciones del caso se cumplen',
        estado: ETIQUETA[c.estado],
        duracion: Number((c.duracion / 1000).toFixed(1)),
        error: c.error ? c.error.split('\n').slice(0, 6).join('\n') : '',
        archivo: `${c.archivo}:${c.linea}`,
      });
      fila.getCell('estado').fill = relleno(c.estado);
      fila.alignment = { vertical: 'top', wrapText: true };
    }
    encabezado(hojaCasos);

    // Pasos
    const hojaPasos = libro.addWorksheet('Pasos');
    hojaPasos.columns = [
      { header: 'ID caso', key: 'id', width: 9 },
      { header: '#', key: 'n', width: 5 },
      { header: 'Momento', key: 'momento', width: 13 },
      { header: 'Paso', key: 'titulo', width: 100 },
      { header: 'Resultado', key: 'resultado', width: 12 },
      { header: 'Duración (s)', key: 'duracion', width: 12 },
    ];
    for (const c of casos) {
      c.pasos.forEach((p, i) => {
        const fila = hojaPasos.addRow({
          id: c.id, n: i + 1, momento: p.momento, titulo: p.titulo,
          resultado: p.error ? 'Falló' : 'Correcto',
          duracion: Number((p.duracion / 1000).toFixed(2)),
        });
        if (p.error) fila.getCell('resultado').fill = relleno('fallida');
      });
    }
    encabezado(hojaPasos);

    return libro;
  }
}
