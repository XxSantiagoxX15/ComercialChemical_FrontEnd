# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-cifrado.spec.ts >> Cifrado de punta a punta: en la pantalla se lee, en la red no >> el archivo que se importa también viaja cifrado
- Location: e2e\specs\09-cifrado.spec.ts:83:7

# Error details

```
Error: petición cifrada

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

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
            - img [aria-hidden] [ref=f1e86]: cloud_upload
            - paragraph [ref=f1e87]: Arrastra tu archivo aquí o
            - button "Seleccionar archivo" [ref=f1e88]:
              - img [aria-hidden] [ref=f1e89]: folder_open
            - paragraph [ref=f1e93]: "Formatos aceptados: .xlsx, .xls, .csv"
          - generic [ref=f1e94]:
            - img [aria-hidden] [ref=f1e95]: check_circle
            - generic [ref=f1e96]:
              - strong [ref=f1e97]: Importación exitosa
              - paragraph [ref=f1e98]: 6 registros importados correctamente.
              - text: "Registros procesados: 6"
        - generic [ref=f1e99]:
          - generic [ref=f1e100]: Historial de Importaciones
          - table [ref=f1e105]:
            - rowgroup [ref=f1e106]:
              - row [ref=f1e107]:
                - columnheader "Fecha" [ref=f1e108]
                - columnheader "Tipo" [ref=f1e109]
                - columnheader "Archivo" [ref=f1e110]
                - columnheader "Estado" [ref=f1e111]
                - columnheader "Registros" [ref=f1e112]
            - rowgroup [ref=f1e113]:
              - row [ref=f1e114]:
                - cell "13/10/2026 23:07" [ref=f1e115]
                - cell "Saldos vs Existencias Mínimas" [ref=f1e116]
                - cell "Informe Saldos Vs Existencias Minimas E2E.xlsx" [ref=f1e117]
                - cell "Exitoso" [ref=f1e118]
                - cell "6" [ref=f1e120]
              - row [ref=f1e121]:
                - cell "13/10/2026 23:07" [ref=f1e122]
                - cell "Kardex" [ref=f1e123]
                - cell "Informe Kardex E2E.xlsx" [ref=f1e124]
                - cell "Exitoso" [ref=f1e125]
                - cell "0" [ref=f1e127]
              - row [ref=f1e128]:
                - cell "13/10/2026 23:07" [ref=f1e129]
                - cell "Saldos vs Existencias Mínimas" [ref=f1e130]
                - cell "Informe Saldos Vs Existencias Minimas E2E.xlsx" [ref=f1e131]
                - cell "Exitoso" [ref=f1e132]
                - cell "6" [ref=f1e134]
              - row [ref=f1e135]:
                - cell "13/10/2026 23:06" [ref=f1e136]
                - cell "Kardex" [ref=f1e137]
                - cell "Informe Kardex E2E.xlsx" [ref=f1e138]
                - cell "Exitoso" [ref=f1e139]
                - cell "0" [ref=f1e141]
              - row [ref=f1e142]:
                - cell "13/10/2026 23:06" [ref=f1e143]
                - cell "Saldos vs Existencias Mínimas" [ref=f1e144]
                - cell "Informe Saldos Vs Existencias Minimas E2E.xlsx" [ref=f1e145]
                - cell "Exitoso" [ref=f1e146]
                - cell "6" [ref=f1e148]
              - row [ref=f1e149]:
                - cell "13/10/2026 23:05" [ref=f1e150]
                - cell "Kardex" [ref=f1e151]
                - cell "Informe Kardex E2E.xlsx" [ref=f1e152]
                - cell "Exitoso" [ref=f1e153]
                - cell "88" [ref=f1e155]
              - row [ref=f1e156]:
                - cell "13/10/2026 23:05" [ref=f1e157]
                - cell "Saldos vs Existencias Mínimas" [ref=f1e158]
                - cell "Informe Saldos Vs Existencias Minimas E2E.xlsx" [ref=f1e159]
                - cell "Exitoso" [ref=f1e160]
                - cell "6" [ref=f1e162]
```

# Test source

```ts
  1   | import { ARTICULOS } from '../datos/informes';
  2   | import { expect, test, USUARIOS } from '../reparto';
  3   | import {
  4   |   ElResultadoDeLaImportacion, ElUsuarioEnSesion, INFORME, ImportarElInforme, ImportarLosInformesDePrueba,
  5   |   IniciarSesion, IrA, LoQueViajoPorLaRed, LosArticulos, TenerUnaCuenta, VerLaPestana, Verificar, cumple,
  6   | } from '../screenplay';
  7   | import { esUnSobreCifrado, RUTAS_PUBLICAS } from '../soporte/cifrado';
  8   | 
  9   | test.describe('Cifrado de punta a punta: en la pantalla se lee, en la red no', () => {
  10  | 
  11  |   test('el correo y la contraseña del login no se ven en la red, ni tampoco la respuesta', async ({ analista }) => {
  12  |     const cuenta = analista.habilidadDe(TenerUnaCuenta);
  13  | 
  14  |     await analista.intenta(
  15  |       IniciarSesion.conSusCredenciales(),
  16  |       // En la pantalla, la información se lee con normalidad…
  17  |       Verificar.que(ElUsuarioEnSesion.segunElEncabezado(),
  18  |         cumple('muestra su nombre', usuario => expect(usuario.nombre).toBe(cuenta.nombre))),
  19  |       // …pero lo que viajó por la red es ilegible.
  20  |       Verificar.que(LoQueViajoPorLaRed.hacia('/api/auth/login/'), cumple('va cifrado en los dos sentidos', vistos => {
  21  |         expect(vistos).toHaveLength(1);
  22  |         const [login] = vistos;
  23  |         expect(login.estado).toBe(200);
  24  |         expect(login.encabezados['x-canal'], 'clave pública del navegador').toBeTruthy();
  25  | 
  26  |         expect(esUnSobreCifrado(login.enviado), 'petición cifrada').toBe(true);
  27  |         expect(login.enviado).not.toContain(cuenta.correo);
  28  |         expect(login.enviado).not.toContain(cuenta.clave);
  29  | 
  30  |         expect(esUnSobreCifrado(login.recibido), 'respuesta cifrada').toBe(true);
  31  |         expect(login.recibido).not.toContain('access_token');
  32  |         expect(login.recibido).not.toContain(cuenta.nombre);
  33  |       })),
  34  |     );
  35  |   });
  36  | 
  37  |   test('al recorrer la aplicación, ninguna petición deja datos legibles en la red', async ({ administrador }) => {
  38  |     await administrador.intenta(
  39  |       IniciarSesion.conSusCredenciales(),
  40  |       ImportarLosInformesDePrueba.deSaldosYKardex(),
  41  |       IrA.elModulo('Dashboard'),
  42  |       IrA.elModulo('Artículos'),
  43  |       Verificar.que(LosArticulos.listados(),
  44  |         cumple('muestra los artículos importados', filas => expect(filas.length).toBe(ARTICULOS.length))),
  45  |       IrA.elModulo('Alertas'),
  46  |       IrA.elModulo('Movimientos'),
  47  |       IrA.elModulo('Compras'),
  48  |       IrA.elModulo('Pronósticos'),
  49  |       VerLaPestana.de('Más Vendidos'),
  50  |       VerLaPestana.de('Recomendaciones'),
  51  |       IrA.elModulo('Auditoría'),
  52  |       IrA.elModulo('Usuarios'),
  53  |     );
  54  | 
  55  |     const legibles = [
  56  |       ...ARTICULOS.map(articulo => articulo.nombre),
  57  |       ...Object.values(USUARIOS).flatMap(usuario => [usuario.correo, usuario.nombre]),
  58  |     ];
  59  | 
  60  |     await administrador.intenta(
  61  |       Verificar.que(LoQueViajoPorLaRed.haciaLaApi(), cumple('todo va cifrado y nada falló', todos => {
  62  |         const privados = todos.filter(i => !RUTAS_PUBLICAS.includes(i.ruta));
  63  |         expect(privados.length).toBeGreaterThan(20);
  64  | 
  65  |         for (const visto of privados) {
  66  |           const cual = `${visto.metodo} ${visto.ruta}`;
  67  |           expect(visto.estado, `${cual}: respondió bien`).toBeLessThan(400);
  68  |           expect(visto.consulta, `${cual}: sin parámetros legibles en la dirección`).toBe('');
  69  |           if (visto.enviado) expect(esUnSobreCifrado(visto.enviado), `${cual}: petición cifrada`).toBe(true);
  70  |           if (visto.recibido) expect(esUnSobreCifrado(visto.recibido), `${cual}: respuesta cifrada`).toBe(true);
  71  |           for (const texto of legibles) {
  72  |             expect(visto.recibido.includes(texto), `${cual}: no deja ver «${texto}»`).toBe(false);
  73  |           }
  74  |         }
  75  | 
  76  |         // Las pantallas con filtros mandan sus parámetros cifrados en un encabezado.
  77  |         const conParametros = privados.filter(i => i.encabezados['x-canal-consulta']);
  78  |         expect(conParametros.length, 'peticiones con parámetros cifrados').toBeGreaterThan(0);
  79  |       })),
  80  |     );
  81  |   });
  82  | 
  83  |   test('el archivo que se importa también viaja cifrado', async ({ administrador }) => {
> 84  |     await administrador.intenta(
      |     ^ Error: petición cifrada
  85  |       IniciarSesion.conSusCredenciales(),
  86  |       ImportarElInforme.de('saldos', INFORME.saldos.archivo),
  87  |       Verificar.que(ElResultadoDeLaImportacion.mostrado(),
  88  |         cumple('se importó', resultado => expect(resultado.titulo).toBe('Importación exitosa'))),
  89  |       Verificar.que(LoQueViajoPorLaRed.hacia('/api/importacion/upload/'), cumple('no deja ver el archivo', vistos => {
  90  |         expect(vistos).toHaveLength(1);
  91  |         const [subida] = vistos;
  92  |         expect(esUnSobreCifrado(subida.enviado), 'petición cifrada').toBe(true);
  93  |         expect(subida.enviado).not.toContain(INFORME.saldos.nombre);
  94  |         expect(subida.enviado).not.toContain('tipo_informe');
  95  |         expect(subida.enviado).not.toContain('Informe_Saldos_Existencias_Minimas');
  96  |         // Un .xlsx sin cifrar se reconoce por estos textos internos.
  97  |         expect(subida.enviado).not.toContain('xl/worksheets');
  98  |         expect(esUnSobreCifrado(subida.recibido), 'respuesta cifrada').toBe(true);
  99  |       })),
  100 |     );
  101 |   });
  102 | });
  103 | 
```