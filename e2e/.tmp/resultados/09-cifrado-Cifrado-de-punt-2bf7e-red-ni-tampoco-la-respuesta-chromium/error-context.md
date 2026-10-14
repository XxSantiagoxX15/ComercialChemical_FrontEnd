# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-cifrado.spec.ts >> Cifrado de punta a punta: en la pantalla se lee, en la red no >> el correo y la contraseña del login no se ven en la red, ni tampoco la respuesta
- Location: e2e\specs\09-cifrado.spec.ts:11:7

# Error details

```
Error: clave pública del navegador

expect(received).toBeTruthy()

Received: undefined

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
          - heading "Dashboard" [level=1] [ref=e51]:
            - img [aria-hidden] [ref=e52]: dashboard
            - text: Dashboard
          - button [ref=e53]:
            - generic [ref=e54]:
              - img [aria-hidden] [ref=e55]: refresh
              - text: Actualizar
        - generic [ref=e58]:
          - generic [ref=e59]:
            - generic [ref=e60]:
              - img [aria-hidden] [ref=e62]: inventory_2
              - generic [ref=e63]:
                - generic [ref=e64]: "6"
                - generic [ref=e65]: Total Artículos
            - link "Ver todos →" [ref=e67] [cursor=pointer]:
              - /url: /inventario/articulos
          - generic [ref=e71]:
            - generic [ref=e72]:
              - img [aria-hidden] [ref=e74]: warning
              - generic [ref=e75]:
                - generic [ref=e76]: "3"
                - generic [ref=e77]: Stock Crítico
            - link "Ver alertas →" [ref=e79] [cursor=pointer]:
              - /url: /inventario/alertas
          - generic [ref=e83]:
            - generic [ref=e84]:
              - img [aria-hidden] [ref=e86]: shopping_cart
              - generic [ref=e87]:
                - generic [ref=e88]: —
                - generic [ref=e89]: Órdenes Pendientes
            - generic [ref=e90]: Sin acceso
          - generic [ref=e92]:
            - generic [ref=e93]:
              - img [aria-hidden] [ref=e95]: trending_up
              - generic [ref=e96]:
                - generic [ref=e97]: —
                - generic [ref=e98]: Pronósticos
            - link "Ver pronósticos →" [ref=e100] [cursor=pointer]:
              - /url: /pronosticos
        - generic [ref=e106]:
          - generic [ref=e107]:
            - img [aria-hidden] [ref=e108]: show_chart
            - text: Demanda Histórica vs. Proyectada
          - generic [ref=e109]: "Suma mensual de todos los artículos — línea sólida: histórico, línea punteada: pronóstico"
        - generic [ref=e115]:
          - generic [ref=e116]:
            - img [aria-hidden] [ref=e117]: bar_chart
            - text: Top 10 Productos Más Vendidos
          - generic [ref=e118]: Total histórico vendido por artículo
        - generic [ref=e122]:
          - generic [ref=e123]:
            - img [aria-hidden] [ref=e124]: warning
            - generic [ref=e125]:
              - generic [ref=e126]: Alertas de Stock Crítico
              - generic [ref=e127]: Artículos que requieren atención inmediata
          - generic [ref=e128]:
            - generic [ref=e129]:
              - generic [ref=e130]:
                - generic [ref=e131]:
                  - generic [ref=e132]: "9104"
                  - generic [ref=e133]: SODA CAUSTICA E2E KILO
                - generic [ref=e134]:
                  - generic [ref=e135]: 0 / 40
                  - generic [ref=e136]: 0%
              - generic [ref=e140]:
                - generic [ref=e141]:
                  - generic [ref=e142]: "9103"
                  - generic [ref=e143]: GLICERINA E2E GALON
                - generic [ref=e144]:
                  - generic [ref=e145]: 5 / 30
                  - generic [ref=e146]: 17%
              - generic [ref=e150]:
                - generic [ref=e151]:
                  - generic [ref=e152]: "9102"
                  - generic [ref=e153]: BICARBONATO DE SODIO E2E KILO
                - generic [ref=e154]:
                  - generic [ref=e155]: 20 / 80
                  - generic [ref=e156]: 25%
            - separator [ref=e160]
            - link "Ver todas las alertas (3)" [ref=e162] [cursor=pointer]:
              - /url: /inventario/alertas
        - generic [ref=e166]:
          - generic [ref=e167]:
            - generic [ref=e168]:
              - img [aria-hidden] [ref=e169]: hourglass_bottom
              - generic [ref=e170]:
                - generic [ref=e171]: Riesgo de Agotamiento
                - generic [ref=e172]: 2 de 5 artículos con pronóstico se agotan en 30 días o menos
            - generic [ref=e174]:
              - generic [ref=e175]:
                - generic [ref=e176]:
                  - generic [ref=e177]: "9103"
                  - generic [ref=e178]: GLICERINA E2E GALON
                - generic [ref=e179]: 11 día(s)
              - generic [ref=e183]:
                - generic [ref=e184]:
                  - generic [ref=e185]: "9102"
                  - generic [ref=e186]: BICARBONATO DE SODIO E2E KILO
                - generic [ref=e187]: 20 día(s)
              - generic [ref=e191]:
                - generic [ref=e192]:
                  - generic [ref=e193]: "9101"
                  - generic [ref=e194]: ACIDO CITRICO E2E KILO
                - generic [ref=e195]: 63 día(s)
              - generic [ref=e199]:
                - generic [ref=e200]:
                  - generic [ref=e201]: "9105"
                  - generic [ref=e202]: ALCOHOL ISOPROPILICO E2E LITRO
                - generic [ref=e203]: 87 día(s)
              - generic [ref=e207]:
                - generic [ref=e208]:
                  - generic [ref=e209]: "9106"
                  - generic [ref=e210]: VASELINA E2E LIBRA
                - generic [ref=e211]: 113 día(s)
            - link "Ver módulo de pronósticos →" [ref=e216] [cursor=pointer]:
              - /url: /pronosticos
          - generic [ref=e220]:
            - generic [ref=e221]:
              - img [aria-hidden] [ref=e222]: precision_manufacturing
              - generic [ref=e223]:
                - generic [ref=e224]: Kits Producibles
                - generic [ref=e225]: 0 de 0 kits listos para producir
            - generic [ref=e227]:
              - img [aria-hidden] [ref=e228]: inventory_2
              - paragraph [ref=e229]: No hay kits configurados todavía
            - link "Ver módulo de producción →" [ref=e231] [cursor=pointer]:
              - /url: /pronosticos
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
> 14  |     await analista.intenta(
      |     ^ Error: clave pública del navegador
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
  84  |     await administrador.intenta(
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