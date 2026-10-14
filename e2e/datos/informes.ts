import ExcelJS from 'exceljs';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Informes de prueba para la importación.
 *
 * Son dos Excel pequeños con la MISMA estructura que los que exporta el
 * sistema contable (títulos, encabezado, filas de bodega, subtotales…), pero
 * con pocos artículos inventados. Así cada prueba sabe de antemano qué debe
 * quedar en el sistema: los valores esperados (ESPERADO, al final) se
 * calculan aquí, a partir de estos mismos datos, sin usar el importador.
 *
 * Las ventas se reparten en los últimos 12 meses completos anteriores a hoy,
 * de modo que los archivos nunca «envejecen».
 */

export interface ArticuloDePrueba {
  codigo: string;
  nombre: string;
  /** Una entrada por bodega: el importador suma los saldos y toma el mínimo mayor. */
  bodegas: { minimo: number; saldo: number }[];
  /** Unidades vendidas en cada uno de los últimos meses (del más antiguo al más reciente). */
  ventasPorMes: number[];
  /** Si es true, cada mes se vende en dos ventas IDÉNTICAS el mismo día. */
  ventasRepetidas?: boolean;
}

export const MESES_DE_HISTORIA = 12;
const PRECIO_UNITARIO = 12_500;
const COMPRA_INICIAL = 10;

export const ARTICULOS: ArticuloDePrueba[] = [
  {
    // Stock de sobra y ventas que crecen mes a mes.
    codigo: '9101', nombre: 'ACIDO CITRICO E2E KILO',
    bodegas: [{ minimo: 50, saldo: 120 }],
    ventasPorMes: [30, 32, 35, 33, 38, 40, 42, 41, 45, 47, 50, 52],
  },
  {
    // El más vendido, con stock por debajo del mínimo. Sus ventas vienen
    // duplicadas a propósito: dos facturas iguales el mismo día son dos ventas.
    codigo: '9102', nombre: 'BICARBONATO DE SODIO E2E KILO',
    bodegas: [{ minimo: 80, saldo: 20 }],
    ventasPorMes: [60, 58, 62, 60, 58, 60, 64, 60, 58, 62, 62, 60],
    ventasRepetidas: true,
  },
  {
    // Está en dos bodegas: stock 3 + 2 = 5 y mínimo 30 (el mayor de los dos).
    codigo: '9103', nombre: 'GLICERINA E2E GALON',
    bodegas: [{ minimo: 30, saldo: 3 }, { minimo: 10, saldo: 2 }],
    ventasPorMes: [12, 10, 14, 11, 13, 12, 15, 12, 11, 14, 13, 12],
  },
  {
    // Agotado y sin ninguna venta: no se le puede calcular pronóstico.
    codigo: '9104', nombre: 'SODA CAUSTICA E2E KILO',
    bodegas: [{ minimo: 40, saldo: 0 }],
    ventasPorMes: [],
  },
  {
    // Sin mínimo configurado y con stock: no genera alerta.
    codigo: '9105', nombre: 'ALCOHOL ISOPROPILICO E2E LITRO',
    bodegas: [{ minimo: 0, saldo: 60 }],
    ventasPorMes: [20, 22, 19, 21, 20, 23, 22, 20, 21, 19, 22, 20],
  },
  {
    // Solo vendió en los dos últimos meses: historial corto.
    codigo: '9106', nombre: 'VASELINA E2E LIBRA',
    bodegas: [{ minimo: 10, saldo: 45 }],
    ventasPorMes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 9],
  },
];

// ── Cálculos sobre los datos (independientes del importador) ────────────────

const suma = (numeros: number[]) => numeros.reduce((total, n) => total + n, 0);
const dosCifras = (n: number) => String(n).padStart(2, '0');

export const stockDe = (articulo: ArticuloDePrueba) => suma(articulo.bodegas.map(b => b.saldo));
export const minimoDe = (articulo: ArticuloDePrueba) => Math.max(...articulo.bodegas.map(b => b.minimo));
export const totalVendidoDe = (articulo: ArticuloDePrueba) => suma(articulo.ventasPorMes);

/** Los últimos meses completos, del más antiguo al más reciente. */
export function mesesDeHistoria(hoy = new Date()): { anio: number; mes: number }[] {
  const meses = [];
  for (let atras = MESES_DE_HISTORIA; atras >= 1; atras--) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - atras, 1);
    meses.push({ anio: fecha.getFullYear(), mes: fecha.getMonth() + 1 });
  }
  return meses;
}

/** Los meses que siguen al último mes con ventas, como «AAAA-MM»: son los que hay que pronosticar. */
export function mesesAPronosticar(cantidad: number, hoy = new Date()): string[] {
  const meses = [];
  for (let adelante = 0; adelante < cantidad; adelante++) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + adelante, 1);
    meses.push(`${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}`);
  }
  return meses;
}

interface Venta { dia: number; concepto: string; unidades: number; }

/** Cómo se reparte en facturas lo vendido en un mes. */
function ventasDelMes(articulo: ArticuloDePrueba, unidades: number): Venta[] {
  if (unidades <= 0) return [];
  if (articulo.ventasRepetidas) {
    const mitad = unidades / 2;
    return [
      { dia: 10, concepto: 'FACTURACION PUNTO DE VENTA', unidades: mitad },
      { dia: 10, concepto: 'FACTURACION PUNTO DE VENTA', unidades: mitad },
    ];
  }
  const primera = Math.round(unidades * 0.6);
  return [
    { dia: 5, concepto: 'FACTURA A CLIENTES', unidades: primera },
    { dia: 18, concepto: 'REMISION A CLIENTES', unidades: unidades - primera },
  ];
}

const filasDeVenta = (articulo: ArticuloDePrueba) =>
  suma(articulo.ventasPorMes.map(unidades => ventasDelMes(articulo, unidades).length));

/** Hay alerta si el stock no supera el mínimo, o si no hay mínimo y el stock es 0 o menos. */
const estaEnAlerta = (articulo: ArticuloDePrueba) =>
  minimoDe(articulo) > 0 ? stockDe(articulo) <= minimoDe(articulo) : stockDe(articulo) <= 0;

const conVentas = ARTICULOS.filter(a => totalVendidoDe(a) > 0);

/** Lo que debe verse en el sistema después de importar los dos informes. */
export const ESPERADO = {
  articulos: ARTICULOS.length,
  codigos: ARTICULOS.map(a => a.codigo),
  ventasImportadas: suma(ARTICULOS.map(filasDeVenta)),
  articulosConVentas: conVentas.map(a => a.codigo),
  enAlerta: ARTICULOS.filter(estaEnAlerta).map(a => a.codigo),
  /** Códigos de los artículos con ventas, del más vendido al menos vendido. */
  masVendidos: [...conVentas].sort((a, b) => totalVendidoDe(b) - totalVendidoDe(a)).map(a => a.codigo),
  conVentasCrecientes: ARTICULOS.find(a => a.codigo === '9101')!,
  sinVentas: ARTICULOS.find(a => totalVendidoDe(a) === 0)!,
};

// ── Construcción de los Excel ───────────────────────────────────────────────

type Fila = (string | number | null)[];

function filasDeSaldos(): Fila[] {
  const filas: Fila[] = [
    ['COMERCIAL CHEMICAL S.A.S. '],
    [],
    ['SALDOS VS EXISTENCIAS MÍNIMAS'],
    ['FECHA DE CORTE (ARCHIVO DE PRUEBA E2E)'],
    ['CÓDIGO', 'NOMBRE', 'UNI', 'EXISTENCIA MINIMA', 'SALDO', 'CANTIDAD A REORDENAR', 'COSTO TOTAL'],
  ];
  const totalDeBodegas = Math.max(...ARTICULOS.map(a => a.bodegas.length));
  for (let bodega = 0; bodega < totalDeBodegas; bodega++) {
    const nombreBodega = `00${bodega + 1} BODEGA DE PRUEBA ${bodega + 1}`;
    filas.push([null, `BODEGA: ${nombreBodega}`]);
    filas.push([null, 'INVENTARIOS - MERCANCIAS NO FABRICADAS POR LA EMPRESA']);
    for (const articulo of ARTICULOS) {
      const enBodega = articulo.bodegas[bodega];
      if (!enBodega) continue;
      const reordenar = Math.max(0, enBodega.minimo - enBodega.saldo);
      filas.push([articulo.codigo, articulo.nombre, 'UNI', enBodega.minimo, enBodega.saldo,
        reordenar, enBodega.saldo * PRECIO_UNITARIO]);
    }
    // Filas que el importador debe saltarse: el código comodín y los subtotales.
    filas.push(['9999', 'ARTICULO COMODIN (NO SE IMPORTA)', 'UNI', 0, 0, 0, 0]);
    filas.push(['SUBTOTAL INVENTARIOS - MERCANCIAS NO FABRICADAS POR LA EMPRESA', null, null, null, null, null, 0]);
    filas.push([`SUBTOTAL BODEGA ${nombreBodega}`, null, null, null, null, null, 0]);
    filas.push([]);
  }
  filas.push(['TOTAL EMPRESA', null, null, null, null, null, 0]);
  return filas;
}

function filasDeKardex(hoy = new Date()): Fila[] {
  const meses = mesesDeHistoria(hoy);
  const primerMes = meses[0];
  const finDelMesAnterior = new Date(primerMes.anio, primerMes.mes - 1, 0);
  const fecha = (dia: number, mes: { anio: number; mes: number }) =>
    `${dosCifras(dia)}/${dosCifras(mes.mes)}/${mes.anio}`;
  const desde = fecha(1, primerMes);
  const ultimoMes = meses[meses.length - 1];
  const hasta = fecha(new Date(ultimoMes.anio, ultimoMes.mes, 0).getDate(), ultimoMes);

  const filas: Fila[] = [
    ['COMERCIAL CHEMICAL S.A.S. '],
    ['KARDEX DE INVENTARIO'],
    [`DESDE EL ${desde} HASTA EL ${hasta}`],
    ['FECHA', 'PR', 'DOC N°', 'CONCEPTO', 'ENTRADAS', 'SALIDAS', 'SALDO', 'VALOR', 'COSTO UNITARIO'],
    [],
    ['BODEGA: 001 BODEGA DE PRUEBA 1'],
    ['INVENTARIOS - MERCANCIAS NO FABRICADAS POR LA EMPRESA'],
    ['GRUPO: PRUEBAS E2E'],
  ];

  let documento = 1000;
  for (const articulo of ARTICULOS) {
    const vendido = totalVendidoDe(articulo);
    const compra = vendido > 0 ? COMPRA_INICIAL : 0;
    // Saldo inicial tal que, tras la compra y todas las ventas, quede el stock del informe de saldos.
    let saldo = stockDe(articulo) + vendido - compra;
    let entradas = 0;
    let salidas = 0;

    filas.push([null, articulo.codigo, `${articulo.nombre} UNI`]);
    filas.push([
      `${dosCifras(finDelMesAnterior.getDate())}/${dosCifras(finDelMesAnterior.getMonth() + 1)}/${finDelMesAnterior.getFullYear()}`,
      null, null, 'SALDO QUE VIENE', null, null, saldo, saldo * PRECIO_UNITARIO, PRECIO_UNITARIO,
    ]);

    if (compra > 0) {
      // Una compra: es una ENTRADA, no debe contarse como venta.
      saldo += compra;
      entradas += compra;
      filas.push([fecha(2, primerMes), null, String(++documento).padStart(10, '0'),
        'COMPRA A PROVEEDORES', compra, 0, saldo, compra * PRECIO_UNITARIO, PRECIO_UNITARIO]);
    }

    articulo.ventasPorMes.forEach((unidades, indice) => {
      for (const venta of ventasDelMes(articulo, unidades)) {
        saldo -= venta.unidades;
        salidas += venta.unidades;
        filas.push([fecha(venta.dia, meses[indice]), 'HR1', String(++documento).padStart(10, '0'),
          venta.concepto, 0, venta.unidades, saldo, -venta.unidades * PRECIO_UNITARIO, 0]);
      }
    });

    filas.push(['SUBTOTAL ARTÍCULO:', null, null, null, entradas, salidas, saldo, 0, 0]);
    filas.push([]);
  }

  filas.push(['SUBTOTAL GRUPO: PRUEBAS E2E', null, null, null, null, null, null, 0, null]);
  filas.push(['SUBTOTAL BODEGA: 001 BODEGA DE PRUEBA 1', null, null, null, null, null, null, 0, null]);
  filas.push([]);
  filas.push([null, null, null, 'TOTAL EMPRESA', null, null, null, 0, null]);
  return filas;
}

async function guardarExcel(ruta: string, filas: Fila[]): Promise<void> {
  const libro = new ExcelJS.Workbook();
  const hoja = libro.addWorksheet('Informe');
  for (const fila of filas) hoja.addRow(fila);
  await libro.xlsx.writeFile(ruta);
}

export const NOMBRE_SALDOS = 'Informe Saldos Vs Existencias Minimas E2E.xlsx';
export const NOMBRE_KARDEX = 'Informe Kardex E2E.xlsx';

export const rutaDeSaldos = (carpeta: string) => join(carpeta, NOMBRE_SALDOS);
export const rutaDeKardex = (carpeta: string) => join(carpeta, NOMBRE_KARDEX);

/** Escribe los dos informes en la carpeta indicada. La llama la preparación global. */
export async function generarInformes(carpeta: string): Promise<void> {
  mkdirSync(carpeta, { recursive: true });
  await guardarExcel(rutaDeSaldos(carpeta), filasDeSaldos());
  await guardarExcel(rutaDeKardex(carpeta), filasDeKardex());
}
