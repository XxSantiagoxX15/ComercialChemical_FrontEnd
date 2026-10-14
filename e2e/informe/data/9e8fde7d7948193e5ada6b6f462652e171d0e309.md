# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-importacion.spec.ts >> Importación de informes >> un archivo que no es un informe se rechaza con un mensaje de error
- Location: e2e\specs\04-importacion.spec.ts:33:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "No se pudo leer el archivo"
Received string:    "Error al procesar el archivo."

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f1e4]:
  - complementary [ref=f1e5]:
    - generic [ref=f1e6]:
      - img "Comercial Chemical" [ref=f1e8]
      - generic [ref=f1e9]:
        - heading "CHEM-MODINV" [level=2] [ref=f1e10]
        - text: Comercial Chemical S.A.S.
    - navigation [ref=f1e11]:
      - generic [ref=f1e12]: Principal
      - link "dashboard Dashboard" [ref=f1e13] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=f1e14]: dashboard
        - generic [ref=f1e15]: Dashboard
      - generic [ref=f1e16]: Inventario
      - link "inventory_2 Artículos" [ref=f1e17] [cursor=pointer]:
        - /url: /inventario/articulos
        - generic [ref=f1e18]: inventory_2
        - generic [ref=f1e19]: Artículos
      - link "calculate Calculadora de precios" [ref=f1e20] [cursor=pointer]:
        - /url: /inventario/calculadora
        - generic [ref=f1e21]: calculate
        - generic [ref=f1e22]: Calculadora de precios
      - link "swap_horiz Movimientos" [ref=f1e23] [cursor=pointer]:
        - /url: /inventario/movimientos
        - generic [ref=f1e24]: swap_horiz
        - generic [ref=f1e25]: Movimientos
      - link "notifications_active Alertas" [ref=f1e26] [cursor=pointer]:
        - /url: /inventario/alertas
        - generic [ref=f1e27]: notifications_active
        - generic [ref=f1e28]: Alertas
      - generic [ref=f1e29]: Operaciones
      - link "shopping_cart Compras" [ref=f1e30] [cursor=pointer]:
        - /url: /compras/ordenes
        - generic [ref=f1e31]: shopping_cart
        - generic [ref=f1e32]: Compras
      - link "trending_up Pronósticos" [ref=f1e33] [cursor=pointer]:
        - /url: /pronosticos
        - generic [ref=f1e34]: trending_up
        - generic [ref=f1e35]: Pronósticos
      - link "upload_file Importación" [ref=f1e36] [cursor=pointer]:
        - /url: /importacion
        - generic [ref=f1e37]: upload_file
        - generic [ref=f1e38]: Importación
      - generic [ref=f1e39]: Administración
      - link "manage_search Auditoría" [ref=f1e40] [cursor=pointer]:
        - /url: /auditoria
        - generic [ref=f1e41]: manage_search
        - generic [ref=f1e42]: Auditoría
      - link "group Usuarios" [ref=f1e43] [cursor=pointer]:
        - /url: /usuarios
        - generic [ref=f1e44]: group
        - generic [ref=f1e45]: Usuarios
    - generic [ref=f1e47] [cursor=pointer]:
      - generic [ref=f1e48]: logout
      - generic [ref=f1e49]: Cerrar sesión
  - generic [ref=f1e50]:
    - banner [ref=f1e51]:
      - button "Toggle sidebar" [ref=f1e52] [cursor=pointer]:
        - generic [ref=f1e53]: menu
      - generic [ref=f1e54]:
        - text: CHEM-MODINV
        - generic [ref=f1e55]: v1.0
      - generic [ref=f1e57] [cursor=pointer]:
        - generic [ref=f1e58]: A
        - generic [ref=f1e59]:
          - generic [ref=f1e60]: Ada Administradora
          - generic [ref=f1e61]: Administrador
        - generic [ref=f1e62]: expand_more
    - main [ref=f1e63]:
      - generic [ref=f1e65]:
        - heading "Importación de Datos" [level=1] [ref=f1e67]:
          - img [aria-hidden] [ref=f1e68]: upload_file
          - text: Importación de Datos
        - generic [ref=f1e70]:
          - generic [ref=f1e71]:
            - button "Saldos vs Existencias Mínimas" [ref=f1e72]:
              - img [aria-hidden] [ref=f1e73]: inventory
            - button "Kardex" [ref=f1e77]:
              - img [aria-hidden] [ref=f1e78]: receipt_long
          - paragraph [ref=f1e82]: "Sube el reporte de Saldos vs Existencias Mínimas: actualiza el stock actual y el stock mínimo de cada artículo."
        - generic [ref=f1e84]:
          - generic [ref=f1e85] [cursor=pointer]:
            - img [aria-hidden] [ref=f1e86]: description
            - paragraph [ref=f1e87]: no-es-un-informe.xlsx
            - paragraph [ref=f1e88]: 0.0 KB
            - generic [ref=f1e89]:
              - button "Subir Archivo" [ref=f1e90]:
                - img [aria-hidden] [ref=f1e91]: upload
              - button "Cancelar" [ref=f1e95]:
                - img [aria-hidden] [ref=f1e96]: close
          - generic [ref=f1e100]:
            - img [aria-hidden] [ref=f1e101]: error
            - generic [ref=f1e102]:
              - strong [ref=f1e103]: Error en la importación
              - paragraph [ref=f1e104]: Error al procesar el archivo.
        - generic [ref=f1e105]:
          - generic [ref=f1e106]: Historial de Importaciones
          - table [ref=f1e111]:
            - rowgroup [ref=f1e112]:
              - row [ref=f1e113]:
                - columnheader "Fecha" [ref=f1e114]
                - columnheader "Tipo" [ref=f1e115]
                - columnheader "Archivo" [ref=f1e116]
                - columnheader "Estado" [ref=f1e117]
                - columnheader "Registros" [ref=f1e118]
            - rowgroup [ref=f1e119]:
              - row [ref=f1e120]:
                - cell "No hay importaciones registradas" [ref=f1e121]
```

# Test source

```ts
  1   | import { ARTICULOS, ESPERADO, minimoDe, stockDe, totalVendidoDe } from '../datos/informes';
  2   | import { expect, test } from '../reparto';
  3   | import { aNumero } from '../soporte/numeros';
  4   | import {
  5   |   Clic, ElHistorialDeImportaciones, ElIndicadorDelDashboard, ElResultadoDeLaImportacion, ElTexto,
  6   |   ElegirUnArchivo, INFORME, ImportarElInforme, IniciarSesion, IrA, LosArticulos,
  7   |   PantallaDeImportacion, SiSeVe, Verificar,
  8   |   cumple, esFalso, esIgualA, esVerdadero,
  9   | } from '../screenplay';
  10  | 
  11  | // Estas pruebas dependen unas de otras: van en orden (Saldos → Kardex → repetir).
  12  | test.describe.configure({ mode: 'serial' });
  13  | 
  14  | test.describe('Importación de informes', () => {
  15  | 
  16  |   test('«Seleccionar archivo» abre el explorador y muestra el archivo elegido', async ({ administrador }) => {
  17  |     await administrador.intenta(
  18  |       IniciarSesion.conSusCredenciales(),
  19  |       IrA.elModulo('Importación'),
  20  |       ElegirUnArchivo.paraElInformeDe('saldos', INFORME.saldos.archivo),
  21  |       Verificar.que(ElTexto.de(PantallaDeImportacion.archivoElegido), esIgualA(INFORME.saldos.nombre)),
  22  |       Verificar.que(SiSeVe.a(PantallaDeImportacion.subir), esVerdadero()),
  23  |     );
  24  | 
  25  |     // «Cancelar» descarta el archivo y vuelve a ofrecer el botón.
  26  |     await administrador.intenta(
  27  |       Clic.en(PantallaDeImportacion.cancelar),
  28  |       Verificar.que(SiSeVe.a(PantallaDeImportacion.seleccionarArchivo), esVerdadero()),
  29  |       Verificar.que(SiSeVe.a(PantallaDeImportacion.archivoElegido), esFalso()),
  30  |     );
  31  |   });
  32  | 
  33  |   test('un archivo que no es un informe se rechaza con un mensaje de error', async ({ administrador }) => {
  34  |     const noEsUnExcel = {
  35  |       name: 'no-es-un-informe.xlsx',
  36  |       mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  37  |       buffer: Buffer.from('esto es un texto, no un libro de Excel'),
  38  |     };
  39  | 
> 40  |     await administrador.intenta(
      |     ^ Error: expect(received).toContain(expected) // indexOf
  41  |       IniciarSesion.conSusCredenciales(),
  42  |       ImportarElInforme.de('saldos', noEsUnExcel),
  43  |       Verificar.que(ElResultadoDeLaImportacion.mostrado(), cumple('es un error de lectura', resultado => {
  44  |         expect(resultado.titulo).toBe('Error en la importación');
  45  |         expect(resultado.mensaje).toContain('No se pudo leer el archivo');
  46  |       })),
  47  |       Verificar.que(ElHistorialDeImportaciones.completo(), esIgualA([])),
  48  |     );
  49  |   });
  50  | 
  51  |   test('el informe de Saldos crea los artículos con su stock y su mínimo', async ({ administrador }) => {
  52  |     await administrador.intenta(
  53  |       IniciarSesion.conSusCredenciales(),
  54  |       ImportarElInforme.de('saldos', INFORME.saldos.archivo),
  55  |       Verificar.que(ElResultadoDeLaImportacion.mostrado(), esIgualA({
  56  |         titulo: 'Importación exitosa',
  57  |         mensaje: `${ESPERADO.articulos} registros importados correctamente.`,
  58  |       })),
  59  |       Verificar.que(ElHistorialDeImportaciones.completo(), esIgualA([{
  60  |         tipo: 'Saldos vs Existencias Mínimas',
  61  |         archivo: INFORME.saldos.nombre,
  62  |         estado: 'Exitoso',
  63  |         registros: String(ESPERADO.articulos),
  64  |       }])),
  65  |     );
  66  | 
  67  |     // En Artículos está cada uno con el stock sumado de sus bodegas y el mínimo mayor.
  68  |     await administrador.intenta(
  69  |       IrA.elModulo('Artículos'),
  70  |       Verificar.que(LosArticulos.listados(), cumple('coincide con el informe de Saldos', filas => {
  71  |         expect(filas.map(f => f.codigo).sort()).toEqual([...ESPERADO.codigos].sort());
  72  |         for (const articulo of ARTICULOS) {
  73  |           const fila = filas.find(f => f.codigo === articulo.codigo)!;
  74  |           expect(fila.descripcion, articulo.codigo).toBe(articulo.nombre);
  75  |           expect(aNumero(fila.stock_actual), `stock de ${articulo.codigo}`).toBe(stockDe(articulo));
  76  |           expect(aNumero(fila.stock_minimo), `mínimo de ${articulo.codigo}`).toBe(minimoDe(articulo));
  77  |         }
  78  |       })),
  79  |     );
  80  |   });
  81  | 
  82  |   test('el informe de Kardex carga las ventas de cada artículo', async ({ administrador }) => {
  83  |     await administrador.intenta(
  84  |       IniciarSesion.conSusCredenciales(),
  85  |       ImportarElInforme.de('kardex', INFORME.kardex.archivo),
  86  |       Verificar.que(ElResultadoDeLaImportacion.mostrado(), esIgualA({
  87  |         titulo: 'Importación exitosa',
  88  |         mensaje: `${ESPERADO.ventasImportadas} registros importados correctamente.`,
  89  |       })),
  90  |       Verificar.que(ElHistorialDeImportaciones.completo(), cumple('tiene el Kardex arriba y Saldos debajo', filas => {
  91  |         expect(filas).toHaveLength(2);
  92  |         expect(filas[0]).toEqual({
  93  |           tipo: 'Kardex',
  94  |           archivo: INFORME.kardex.nombre,
  95  |           estado: 'Exitoso',
  96  |           registros: String(ESPERADO.ventasImportadas),
  97  |         });
  98  |       })),
  99  |     );
  100 | 
  101 |     // Lo vendido por artículo es la suma de sus ventas (las compras no cuentan,
  102 |     // y las dos facturas iguales del mismo día cuentan las dos); el stock no cambia.
  103 |     await administrador.intenta(
  104 |       IrA.elModulo('Artículos'),
  105 |       Verificar.que(LosArticulos.listados(), cumple('coincide con el Kardex', filas => {
  106 |         expect(filas).toHaveLength(ESPERADO.articulos);
  107 |         for (const articulo of ARTICULOS) {
  108 |           const fila = filas.find(f => f.codigo === articulo.codigo)!;
  109 |           const vendido = totalVendidoDe(articulo);
  110 |           if (vendido > 0) expect(aNumero(fila.total_vendido), `vendido de ${articulo.codigo}`).toBe(vendido);
  111 |           else expect(fila.total_vendido, `vendido de ${articulo.codigo}`).toBe('—');
  112 |           expect(aNumero(fila.stock_actual), `stock de ${articulo.codigo}`).toBe(stockDe(articulo));
  113 |         }
  114 |       })),
  115 |     );
  116 |   });
  117 | 
  118 |   test('volver a subir el mismo Kardex no duplica ninguna venta', async ({ administrador }) => {
  119 |     await administrador.intenta(
  120 |       IniciarSesion.conSusCredenciales(),
  121 |       ImportarElInforme.de('kardex', INFORME.kardex.archivo),
  122 |       Verificar.que(ElResultadoDeLaImportacion.mostrado(), cumple('no importa nada nuevo', resultado => {
  123 |         expect(resultado.titulo).toBe('Importación exitosa');
  124 |         expect(resultado.mensaje).toMatch(/^0 registros importados correctamente\. \d+ filas ya existían/);
  125 |       })),
  126 |       IrA.elModulo('Artículos'),
  127 |       Verificar.que(LosArticulos.listados(), cumple('conserva lo vendido', filas => {
  128 |         for (const articulo of ARTICULOS.filter(a => totalVendidoDe(a) > 0)) {
  129 |           const fila = filas.find(f => f.codigo === articulo.codigo)!;
  130 |           expect(aNumero(fila.total_vendido), `vendido de ${articulo.codigo}`).toBe(totalVendidoDe(articulo));
  131 |         }
  132 |       })),
  133 |     );
  134 |   });
  135 | 
  136 |   test('el Dashboard refleja lo importado', async ({ administrador }) => {
  137 |     await administrador.intenta(
  138 |       IniciarSesion.conSusCredenciales(),
  139 |       Verificar.que(ElIndicadorDelDashboard.llamado('Total Artículos'), esIgualA(String(ESPERADO.articulos))),
  140 |       Verificar.que(ElIndicadorDelDashboard.llamado('Stock Crítico'), esIgualA(String(ESPERADO.enAlerta.length))),
```