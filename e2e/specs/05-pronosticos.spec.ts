import { ARTICULOS, ESPERADO, mesesAPronosticar, minimoDe, MESES_DE_HISTORIA } from '../datos/informes';
import { enEscena, expect, test } from '../reparto';
import { aNumero } from '../soporte/numeros';
import {
  CalcularElPronostico, Clic, ElAnalisisDeVentas, ElAviso, ElHistorialDisponible, ElPronostico,
  ElegirElArticulo, Escribir, ImportarLosInformesDePrueba, IniciarSesion, IrA, LasRecomendaciones,
  LosMasVendidos, PantallaDePronosticos, VerLaPestana, Verificar, contiene, cumple, esIgualA,
} from '../screenplay';

// El pronóstico masivo va primero: las recomendaciones salen de él.
test.describe.configure({ mode: 'serial' });

test.describe('Pronósticos', () => {

  // Antecedente: el sistema ya tiene los artículos y las ventas de prueba.
  test.beforeAll(async ({ browser }) => {
    await enEscena(browser, 'administrador', ada => ada.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarLosInformesDePrueba.deSaldosYKardex(),
    ));
  });

  test('el pronóstico masivo calcula todos los artículos que tienen ventas', async ({ administrador }) => {
    const conVentas = ESPERADO.articulosConVentas.length;

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      CalcularElPronostico.deTodosLosArticulos(),
      Verificar.que(ElAviso.emergente(), contiene(`Pronóstico calculado para ${conVentas}/${conVentas} artículos.`)),
    );
  });

  test('el pronóstico de un artículo proyecta los meses siguientes con valores razonables', async ({ analista }) => {
    const articulo = ESPERADO.conVentasCrecientes;
    const menorVenta = Math.min(...articulo.ventasPorMes);
    const mayorVenta = Math.max(...articulo.ventasPorMes);

    await analista.intenta(
      IniciarSesion.conSusCredenciales(),
      CalcularElPronostico.delArticulo(articulo.codigo, 3),
      Verificar.que(ElHistorialDisponible.delArticulo(),
        contiene(`Historial disponible: ${MESES_DE_HISTORIA} mes(es) de ventas`)),
      Verificar.que(ElPronostico.calculado(), cumple('trae los 3 meses siguientes, con demanda creíble', filas => {
        expect(filas.map(f => f.fecha.slice(0, 7))).toEqual(mesesAPronosticar(3));
        for (const fila of filas) {
          const demanda = aNumero(fila.demanda_proyectada);
          expect(demanda, `demanda de ${fila.fecha}`).toBeGreaterThan(menorVenta / 2);
          expect(demanda, `demanda de ${fila.fecha}`).toBeLessThan(mayorVenta * 2);
        }
      })),
      Verificar.que(ElAnalisisDeVentas.delArticulo(), cumple('resume bien el historial', analisis => {
        expect(analisis.periodos).toBe(String(MESES_DE_HISTORIA));
        expect(analisis.tendencia).toContain('Creciente');
      })),
      Verificar.que(ElPronostico.modeloUsado(), contiene('Modelo usado:')),
    );
  });

  test('un artículo sin ventas avisa de que no se puede pronosticar', async ({ analista }) => {
    await analista.intenta(
      IniciarSesion.conSusCredenciales(),
      ElegirElArticulo.conCodigo(ESPERADO.sinVentas.codigo),
      Verificar.que(ElHistorialDisponible.delArticulo(), contiene('Sin historial de ventas')),
      Clic.en(PantallaDePronosticos.generar),
      Verificar.que(ElPronostico.error(), contiene('no tiene historial de ventas')),
      Verificar.que(ElPronostico.calculado(), esIgualA([])),
    );
  });

  test('«Más Vendidos» ordena los artículos por unidades vendidas', async ({ analista }) => {
    await analista.intenta(
      IniciarSesion.conSusCredenciales(),
      IrA.elModulo('Pronósticos'),
      VerLaPestana.de('Más Vendidos'),
      Verificar.que(LosMasVendidos.listados(), esIgualA(ESPERADO.masVendidos)),
    );
  });

  test('«Recomendaciones» prioriza lo que está bajo mínimo y calcula cuánto comprar', async ({ compras }) => {
    const minimoPorCodigo = new Map(ARTICULOS.map(a => [a.codigo, minimoDe(a)]));

    await compras.intenta(
      IniciarSesion.conSusCredenciales(),
      IrA.elModulo('Pronósticos'),
      VerLaPestana.de('Recomendaciones'),
      Verificar.que(LasRecomendaciones.listadas(), cumple('sigue la regla de compra', filas => {
        expect(filas.map(f => f.codigo).sort()).toEqual([...ESPERADO.codigos].sort());

        // Primero, los que están por debajo de su mínimo: prioridad crítica.
        const criticos = filas.slice(0, ESPERADO.enAlerta.length);
        expect(criticos.map(f => f.codigo).sort()).toEqual([...ESPERADO.enAlerta].sort());
        for (const fila of criticos) expect(fila.prioridad, fila.codigo).toContain('Crítico');

        // Cantidad a comprar = demanda − (stock − mínimo), nunca negativa.
        for (const fila of filas) {
          const sobrante = aNumero(fila.stock) - minimoPorCodigo.get(fila.codigo)!;
          const esperada = Math.max(aNumero(fila.demanda) - sobrante, 0);
          expect(Math.abs(aNumero(fila.comprar) - esperada), `comprar de ${fila.codigo}`).toBeLessThanOrEqual(1);
        }
      })),
    );

    // El filtro deja solo el artículo buscado.
    const buscado = ESPERADO.masVendidos[0];
    await compras.intenta(
      Escribir.elTexto(buscado).en(PantallaDePronosticos.filtroDeRecomendaciones),
      Verificar.que(LasRecomendaciones.contador(), contiene(`1 de ${ESPERADO.articulos} artículos`)),
      Verificar.que(LasRecomendaciones.listadas(),
        cumple('muestra solo ese artículo', filas => expect(filas.map(f => f.codigo)).toEqual([buscado]))),
    );
  });
});
