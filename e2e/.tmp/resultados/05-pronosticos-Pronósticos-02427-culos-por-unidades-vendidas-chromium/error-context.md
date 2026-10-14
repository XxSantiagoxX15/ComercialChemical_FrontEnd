# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-pronosticos.spec.ts >> Pronósticos >> «Más Vendidos» ordena los artículos por unidades vendidas
- Location: e2e\specs\05-pronosticos.spec.ts:70:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Array [
-   "9102",
    "9101",
+   "9102",
    "9105",
    "9103",
    "9106",
  ]

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=e4]:
  - complementary [ref=e5]:
    - generic [ref=e6]:
      - img "Comercial Chemical" [ref=e8]
      - generic [ref=e9]:
        - heading "CHEM-MODINV" [level=2] [ref=e10]
        - text: Comercial Chemical S.A.S.
    - navigation [ref=e11]:
      - generic [ref=e12]: Principal
      - link "dashboard Dashboard" [ref=e13] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=e14]: dashboard
        - generic [ref=e15]: Dashboard
      - generic [ref=e16]: Inventario
      - link "inventory_2 Artículos" [ref=e17] [cursor=pointer]:
        - /url: /inventario/articulos
        - generic [ref=e18]: inventory_2
        - generic [ref=e19]: Artículos
      - link "swap_horiz Movimientos" [ref=e20] [cursor=pointer]:
        - /url: /inventario/movimientos
        - generic [ref=e21]: swap_horiz
        - generic [ref=e22]: Movimientos
      - link "notifications_active Alertas" [ref=e23] [cursor=pointer]:
        - /url: /inventario/alertas
        - generic [ref=e24]: notifications_active
        - generic [ref=e25]: Alertas
      - generic [ref=e26]: Operaciones
      - link "trending_up Pronósticos" [ref=e27] [cursor=pointer]:
        - /url: /pronosticos
        - generic [ref=e28]: trending_up
        - generic [ref=e29]: Pronósticos
    - generic [ref=e31] [cursor=pointer]:
      - generic [ref=e32]: logout
      - generic [ref=e33]: Cerrar sesión
  - generic [ref=e34]:
    - banner [ref=e35]:
      - button "Toggle sidebar" [ref=e36] [cursor=pointer]:
        - generic [ref=e37]: menu
      - generic [ref=e38]:
        - text: CHEM-MODINV
        - generic [ref=e39]: v1.0
      - generic [ref=e41] [cursor=pointer]:
        - generic [ref=e42]: A
        - generic [ref=e43]:
          - generic [ref=e44]: Andrés Analista
          - generic [ref=e45]: Analista de Inventarios
        - generic [ref=e46]: expand_more
    - main [ref=e47]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - heading "Forecasting & Pronósticos" [level=1] [ref=e51]:
            - img [aria-hidden] [ref=e52]: auto_graph
            - text: Forecasting & Pronósticos
          - generic [ref=e53]:
            - button "Pronóstico masivo" [ref=e54]:
              - img [aria-hidden] [ref=e55]: bolt
            - button "Actualizar" [ref=e59]:
              - img [aria-hidden] [ref=e60]: refresh
        - generic [ref=e64]:
          - generic [ref=e65]:
            - tablist [ref=e67]:
              - generic [ref=e68]:
                - tab [ref=e69] [cursor=pointer]:
                  - generic [ref=e71]:
                    - img [aria-hidden] [ref=e72]: trending_up
                    - text: Forecasting
                - tab [active] [selected] [ref=e73] [cursor=pointer]:
                  - generic [ref=e75]:
                    - img [aria-hidden] [ref=e76]: bar_chart
                    - text: Más Vendidos
                - tab [ref=e77] [cursor=pointer]:
                  - generic [ref=e79]:
                    - img [aria-hidden] [ref=e80]: shopping_cart
                    - text: Recomendaciones
                - tab [ref=e81] [cursor=pointer]:
                  - generic [ref=e83]:
                    - img [aria-hidden] [ref=e84]: precision_manufacturing
                    - text: Producción
                - tab [ref=e85] [cursor=pointer]:
                  - generic [ref=e87]:
                    - img [aria-hidden] [ref=e88]: compare_arrows
                    - text: Comparar Periodos
                - tab [ref=e89] [cursor=pointer]:
                  - generic [ref=e91]:
                    - img [aria-hidden] [ref=e92]: fact_check
                    - text: Reporte de Necesidades
            - generic [ref=e93] [cursor=pointer]
          - generic [ref=e95]:
            - tabpanel [aria-hidden] [ref=e96]
            - tabpanel "Más Vendidos" [ref=e97]:
              - generic [ref=e104]:
                - generic [ref=e105]:
                  - generic [ref=e106]: Top 20 Artículos
                  - generic [ref=e109]:
                    - button "PDF" [ref=e110]:
                      - img [aria-hidden] [ref=e111]: picture_as_pdf
                    - button "Excel" [ref=e115]:
                      - img [aria-hidden] [ref=e116]: grid_on
                - table [ref=e121]:
                  - rowgroup [ref=e122]:
                    - row [ref=e123]:
                      - columnheader "#" [ref=e124]
                      - columnheader "Código" [ref=e125]
                      - columnheader "Descripción" [ref=e126]
                      - columnheader "Total Vendido" [ref=e127]
                  - rowgroup [ref=e128]:
                    - row [ref=e129]:
                      - cell "#1" [ref=e130]
                      - cell [ref=e132]:
                        - strong [ref=e133]: "9101"
                      - cell "ACIDO CITRICO E2E KILO" [ref=e134]
                      - cell [ref=e135]:
                        - strong [ref=e136]: "485"
                    - row [ref=e137]:
                      - cell "#2" [ref=e138]
                      - cell [ref=e140]:
                        - strong [ref=e141]: "9102"
                      - cell "BICARBONATO DE SODIO E2E KILO" [ref=e142]
                      - cell [ref=e143]:
                        - strong [ref=e144]: "362"
                    - row [ref=e145]:
                      - cell "#3" [ref=e146]
                      - cell [ref=e148]:
                        - strong [ref=e149]: "9105"
                      - cell "ALCOHOL ISOPROPILICO E2E LITRO" [ref=e150]
                      - cell [ref=e151]:
                        - strong [ref=e152]: "249"
                    - row [ref=e153]:
                      - cell "#4" [ref=e154]
                      - cell [ref=e156]:
                        - strong [ref=e157]: "9103"
                      - cell "GLICERINA E2E GALON" [ref=e158]
                      - cell [ref=e159]:
                        - strong [ref=e160]: "149"
                    - row [ref=e161]:
                      - cell "#5" [ref=e162]
                      - cell [ref=e164]:
                        - strong [ref=e165]: "9106"
                      - cell "VASELINA E2E LIBRA" [ref=e166]
                      - cell [ref=e167]:
                        - strong [ref=e168]: "17"
            - tabpanel [aria-hidden] [ref=e169]
            - tabpanel [aria-hidden] [ref=e170]
            - tabpanel [aria-hidden] [ref=e171]
            - tabpanel [aria-hidden] [ref=e172]
```

# Test source

```ts
  1   | import { ARTICULOS, ESPERADO, mesesAPronosticar, minimoDe, MESES_DE_HISTORIA } from '../datos/informes';
  2   | import { enEscena, expect, test } from '../reparto';
  3   | import { aNumero } from '../soporte/numeros';
  4   | import {
  5   |   CalcularElPronostico, Clic, ElAnalisisDeVentas, ElAviso, ElHistorialDisponible, ElPronostico,
  6   |   ElegirElArticulo, Escribir, ImportarLosInformesDePrueba, IniciarSesion, IrA, LasRecomendaciones,
  7   |   LosMasVendidos, PantallaDePronosticos, VerLaPestana, Verificar, contiene, cumple, esIgualA,
  8   | } from '../screenplay';
  9   | 
  10  | // El pronóstico masivo va primero: las recomendaciones salen de él.
  11  | test.describe.configure({ mode: 'serial' });
  12  | 
  13  | test.describe('Pronósticos', () => {
  14  | 
  15  |   // Antecedente: el sistema ya tiene los artículos y las ventas de prueba.
  16  |   test.beforeAll(async ({ browser }) => {
  17  |     await enEscena(browser, 'administrador', ada => ada.intenta(
  18  |       IniciarSesion.conSusCredenciales(),
  19  |       ImportarLosInformesDePrueba.deSaldosYKardex(),
  20  |     ));
  21  |   });
  22  | 
  23  |   test('el pronóstico masivo calcula todos los artículos que tienen ventas', async ({ administrador }) => {
  24  |     const conVentas = ESPERADO.articulosConVentas.length;
  25  | 
  26  |     await administrador.intenta(
  27  |       IniciarSesion.conSusCredenciales(),
  28  |       CalcularElPronostico.deTodosLosArticulos(),
  29  |       Verificar.que(ElAviso.emergente(), contiene(`Pronóstico calculado para ${conVentas}/${conVentas} artículos.`)),
  30  |     );
  31  |   });
  32  | 
  33  |   test('el pronóstico de un artículo proyecta los meses siguientes con valores razonables', async ({ analista }) => {
  34  |     const articulo = ESPERADO.conVentasCrecientes;
  35  |     const menorVenta = Math.min(...articulo.ventasPorMes);
  36  |     const mayorVenta = Math.max(...articulo.ventasPorMes);
  37  | 
  38  |     await analista.intenta(
  39  |       IniciarSesion.conSusCredenciales(),
  40  |       CalcularElPronostico.delArticulo(articulo.codigo, 3),
  41  |       Verificar.que(ElHistorialDisponible.delArticulo(),
  42  |         contiene(`Historial disponible: ${MESES_DE_HISTORIA} mes(es) de ventas`)),
  43  |       Verificar.que(ElPronostico.calculado(), cumple('trae los 3 meses siguientes, con demanda creíble', filas => {
  44  |         expect(filas.map(f => f.fecha.slice(0, 7))).toEqual(mesesAPronosticar(3));
  45  |         for (const fila of filas) {
  46  |           const demanda = aNumero(fila.demanda_proyectada);
  47  |           expect(demanda, `demanda de ${fila.fecha}`).toBeGreaterThan(menorVenta / 2);
  48  |           expect(demanda, `demanda de ${fila.fecha}`).toBeLessThan(mayorVenta * 2);
  49  |         }
  50  |       })),
  51  |       Verificar.que(ElAnalisisDeVentas.delArticulo(), cumple('resume bien el historial', analisis => {
  52  |         expect(analisis.periodos).toBe(String(MESES_DE_HISTORIA));
  53  |         expect(analisis.tendencia).toContain('Creciente');
  54  |       })),
  55  |       Verificar.que(ElPronostico.modeloUsado(), contiene('Modelo usado:')),
  56  |     );
  57  |   });
  58  | 
  59  |   test('un artículo sin ventas avisa de que no se puede pronosticar', async ({ analista }) => {
  60  |     await analista.intenta(
  61  |       IniciarSesion.conSusCredenciales(),
  62  |       ElegirElArticulo.conCodigo(ESPERADO.sinVentas.codigo),
  63  |       Verificar.que(ElHistorialDisponible.delArticulo(), contiene('Sin historial de ventas')),
  64  |       Clic.en(PantallaDePronosticos.generar),
  65  |       Verificar.que(ElPronostico.error(), contiene('no tiene historial de ventas')),
  66  |       Verificar.que(ElPronostico.calculado(), esIgualA([])),
  67  |     );
  68  |   });
  69  | 
  70  |   test('«Más Vendidos» ordena los artículos por unidades vendidas', async ({ analista }) => {
> 71  |     await analista.intenta(
      |     ^ Error: expect(received).toEqual(expected) // deep equality
  72  |       IniciarSesion.conSusCredenciales(),
  73  |       IrA.elModulo('Pronósticos'),
  74  |       VerLaPestana.de('Más Vendidos'),
  75  |       Verificar.que(LosMasVendidos.listados(), esIgualA(ESPERADO.masVendidos)),
  76  |     );
  77  |   });
  78  | 
  79  |   test('«Recomendaciones» prioriza lo que está bajo mínimo y calcula cuánto comprar', async ({ compras }) => {
  80  |     const minimoPorCodigo = new Map(ARTICULOS.map(a => [a.codigo, minimoDe(a)]));
  81  | 
  82  |     await compras.intenta(
  83  |       IniciarSesion.conSusCredenciales(),
  84  |       IrA.elModulo('Pronósticos'),
  85  |       VerLaPestana.de('Recomendaciones'),
  86  |       Verificar.que(LasRecomendaciones.listadas(), cumple('sigue la regla de compra', filas => {
  87  |         expect(filas.map(f => f.codigo).sort()).toEqual([...ESPERADO.codigos].sort());
  88  | 
  89  |         // Primero, los que están por debajo de su mínimo: prioridad crítica.
  90  |         const criticos = filas.slice(0, ESPERADO.enAlerta.length);
  91  |         expect(criticos.map(f => f.codigo).sort()).toEqual([...ESPERADO.enAlerta].sort());
  92  |         for (const fila of criticos) expect(fila.prioridad, fila.codigo).toContain('Crítico');
  93  | 
  94  |         // Cantidad a comprar = demanda − (stock − mínimo), nunca negativa.
  95  |         for (const fila of filas) {
  96  |           const sobrante = aNumero(fila.stock) - minimoPorCodigo.get(fila.codigo)!;
  97  |           const esperada = Math.max(aNumero(fila.demanda) - sobrante, 0);
  98  |           expect(Math.abs(aNumero(fila.comprar) - esperada), `comprar de ${fila.codigo}`).toBeLessThanOrEqual(1);
  99  |         }
  100 |       })),
  101 |     );
  102 | 
  103 |     // El filtro deja solo el artículo buscado.
  104 |     const buscado = ESPERADO.masVendidos[0];
  105 |     await compras.intenta(
  106 |       Escribir.elTexto(buscado).en(PantallaDePronosticos.filtroDeRecomendaciones),
  107 |       Verificar.que(LasRecomendaciones.contador(), contiene(`1 de ${ESPERADO.articulos} artículos`)),
  108 |       Verificar.que(LasRecomendaciones.listadas(),
  109 |         cumple('muestra solo ese artículo', filas => expect(filas.map(f => f.codigo)).toEqual([buscado]))),
  110 |     );
  111 |   });
  112 | });
  113 | 
```