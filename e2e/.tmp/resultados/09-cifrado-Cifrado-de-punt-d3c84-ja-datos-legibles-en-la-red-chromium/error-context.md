# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 09-cifrado.spec.ts >> Cifrado de punta a punta: en la pantalla se lee, en la red no >> al recorrer la aplicación, ninguna petición deja datos legibles en la red
- Location: e2e\specs\09-cifrado.spec.ts:37:7

# Error details

```
Error: POST /api/auth/login/: petición cifrada

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 10000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f2e4]:
  - complementary [ref=f2e5]:
    - generic [ref=f2e6]:
      - img "Comercial Chemical" [ref=f2e8]
      - generic [ref=f2e9]:
        - heading "CHEM-MODINV" [level=2] [ref=f2e10]
        - text: Comercial Chemical S.A.S.
    - navigation [ref=f2e11]:
      - generic [ref=f2e12]: Principal
      - link "dashboard Dashboard" [ref=f2e13] [cursor=pointer]:
        - /url: /dashboard
        - generic [ref=f2e14]: dashboard
        - generic [ref=f2e15]: Dashboard
      - generic [ref=f2e16]: Inventario
      - link "inventory_2 Artículos" [ref=f2e17] [cursor=pointer]:
        - /url: /inventario/articulos
        - generic [ref=f2e18]: inventory_2
        - generic [ref=f2e19]: Artículos
      - link "calculate Calculadora de precios" [ref=f2e20] [cursor=pointer]:
        - /url: /inventario/calculadora
        - generic [ref=f2e21]: calculate
        - generic [ref=f2e22]: Calculadora de precios
      - link "swap_horiz Movimientos" [ref=f2e23] [cursor=pointer]:
        - /url: /inventario/movimientos
        - generic [ref=f2e24]: swap_horiz
        - generic [ref=f2e25]: Movimientos
      - link "notifications_active Alertas" [ref=f2e26] [cursor=pointer]:
        - /url: /inventario/alertas
        - generic [ref=f2e27]: notifications_active
        - generic [ref=f2e28]: Alertas
      - generic [ref=f2e29]: Operaciones
      - link "shopping_cart Compras" [ref=f2e30] [cursor=pointer]:
        - /url: /compras/ordenes
        - generic [ref=f2e31]: shopping_cart
        - generic [ref=f2e32]: Compras
      - link "trending_up Pronósticos" [ref=f2e33] [cursor=pointer]:
        - /url: /pronosticos
        - generic [ref=f2e34]: trending_up
        - generic [ref=f2e35]: Pronósticos
      - link "upload_file Importación" [ref=f2e36] [cursor=pointer]:
        - /url: /importacion
        - generic [ref=f2e37]: upload_file
        - generic [ref=f2e38]: Importación
      - generic [ref=f2e39]: Administración
      - link "manage_search Auditoría" [ref=f2e40] [cursor=pointer]:
        - /url: /auditoria
        - generic [ref=f2e41]: manage_search
        - generic [ref=f2e42]: Auditoría
      - link "group Usuarios" [active] [ref=f2e43] [cursor=pointer]:
        - /url: /usuarios
        - generic [ref=f2e44]: group
        - generic [ref=f2e45]: Usuarios
    - generic [ref=f2e47] [cursor=pointer]:
      - generic [ref=f2e48]: logout
      - generic [ref=f2e49]: Cerrar sesión
  - generic [ref=f2e50]:
    - banner [ref=f2e51]:
      - button "Toggle sidebar" [ref=f2e52] [cursor=pointer]:
        - generic [ref=f2e53]: menu
      - generic [ref=f2e54]:
        - text: CHEM-MODINV
        - generic [ref=f2e55]: v1.0
      - generic [ref=f2e57] [cursor=pointer]:
        - generic [ref=f2e58]: A
        - generic [ref=f2e59]:
          - generic [ref=f2e60]: Ada Administradora
          - generic [ref=f2e61]: Administrador
        - generic [ref=f2e62]: expand_more
    - main [ref=f2e63]:
      - generic [ref=f2e65]:
        - generic [ref=f2e66]:
          - heading "👥 Gestión de Usuarios" [level=1] [ref=f2e67]
          - generic [ref=f2e68]:
            - button "Permisos por Rol" [ref=f2e69]:
              - img [aria-hidden] [ref=f2e70]: security
            - button "Nuevo Usuario" [ref=f2e74]:
              - img [aria-hidden] [ref=f2e75]: person_add
        - generic [ref=f2e80]:
          - generic [ref=f2e81]:
            - generic [ref=f2e84]:
              - generic: Buscar usuario
              - textbox "Buscar usuario" [ref=f2e87]:
                - /placeholder: Nombre, correo...
              - img [aria-hidden] [ref=f2e89]: search
            - button "Actualizar" [ref=f2e91]:
              - img [aria-hidden] [ref=f2e92]: refresh
          - table [ref=f2e97]:
            - rowgroup [ref=f2e98]:
              - row [ref=f2e99]:
                - columnheader [ref=f2e100] [cursor=pointer]:
                  - button "Nombre" [ref=f2e101]
                - columnheader [ref=f2e106] [cursor=pointer]:
                  - button "Correo" [ref=f2e107]
                - columnheader "Rol" [ref=f2e112]
                - columnheader "Estado" [ref=f2e113]
                - columnheader [ref=f2e114] [cursor=pointer]:
                  - button "Creado" [ref=f2e115]
                - columnheader "Acciones" [ref=f2e120]
            - rowgroup [ref=f2e121]:
              - row [ref=f2e122]:
                - cell "A Ada Administradora" [ref=f2e123]:
                  - generic [ref=f2e124]:
                    - generic [ref=f2e125]: A
                    - generic [ref=f2e126]: Ada Administradora
                - cell "admin.e2e@chem.test" [ref=f2e127]
                - cell "Administrador" [ref=f2e128]
                - cell "Activo" [ref=f2e130]
                - cell "13/10/2026" [ref=f2e132]
                - cell [ref=f2e133]:
                  - button [ref=f2e134] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e135]: edit
                  - button [ref=f2e138] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e139]: person_off
                  - button [ref=f2e142] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e143]: lock_reset
              - row [ref=f2e146]:
                - cell "A Andrés Analista" [ref=f2e147]:
                  - generic [ref=f2e148]:
                    - generic [ref=f2e149]: A
                    - generic [ref=f2e150]: Andrés Analista
                - cell "analista.e2e@chem.test" [ref=f2e151]
                - cell "Analista_Inventarios" [ref=f2e152]
                - cell "Activo" [ref=f2e154]
                - cell "13/10/2026" [ref=f2e156]
                - cell [ref=f2e157]:
                  - button [ref=f2e158] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e159]: edit
                  - button [ref=f2e162] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e163]: person_off
                  - button [ref=f2e166] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e167]: lock_reset
              - row [ref=f2e170]:
                - cell "C Carla Compras" [ref=f2e171]:
                  - generic [ref=f2e172]:
                    - generic [ref=f2e173]: C
                    - generic [ref=f2e174]: Carla Compras
                - cell "compras.e2e@chem.test" [ref=f2e175]
                - cell "Responsable_Compras" [ref=f2e176]
                - cell "Activo" [ref=f2e178]
                - cell "13/10/2026" [ref=f2e180]
                - cell [ref=f2e181]:
                  - button [ref=f2e182] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e183]: edit
                  - button [ref=f2e186] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e187]: person_off
                  - button [ref=f2e190] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e191]: lock_reset
              - row [ref=f2e194]:
                - cell "O Olga Olvidadiza" [ref=f2e195]:
                  - generic [ref=f2e196]:
                    - generic [ref=f2e197]: O
                    - generic [ref=f2e198]: Olga Olvidadiza
                - cell "olvido.e2e@chem.test" [ref=f2e199]
                - cell "Analista_Inventarios" [ref=f2e200]
                - cell "Activo" [ref=f2e202]
                - cell "13/10/2026" [ref=f2e204]
                - cell [ref=f2e205]:
                  - button [ref=f2e206] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e207]: edit
                  - button [ref=f2e210] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e211]: person_off
                  - button [ref=f2e214] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e215]: lock_reset
              - row [ref=f2e218]:
                - cell "D Dario Descuidado" [ref=f2e219]:
                  - generic [ref=f2e220]:
                    - generic [ref=f2e221]: D
                    - generic [ref=f2e222]: Dario Descuidado
                - cell "bloqueo.e2e@chem.test" [ref=f2e223]
                - cell "Responsable_Compras" [ref=f2e224]
                - cell "Activo" [ref=f2e226]
                - cell "13/10/2026" [ref=f2e228]
                - cell [ref=f2e229]:
                  - button [ref=f2e230] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e231]: edit
                  - button [ref=f2e234] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e235]: person_off
                  - button [ref=f2e238] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e239]: lock_reset
              - row [ref=f2e242]:
                - cell "N Nora Nueva" [ref=f2e243]:
                  - generic [ref=f2e244]:
                    - generic [ref=f2e245]: "N"
                    - generic [ref=f2e246]: Nora Nueva
                - cell "nora.nueva.1791950796089@chem.test" [ref=f2e247]
                - cell "Analista_Inventarios" [ref=f2e248]
                - cell "Activo" [ref=f2e250]
                - cell "13/10/2026" [ref=f2e252]
                - cell [ref=f2e253]:
                  - button [ref=f2e254] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e255]: edit
                  - button [ref=f2e258] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e259]: person_off
                  - button [ref=f2e262] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e263]: lock_reset
              - row [ref=f2e266]:
                - cell "I Ines Inactiva" [ref=f2e267]:
                  - generic [ref=f2e268]:
                    - generic [ref=f2e269]: I
                    - generic [ref=f2e270]: Ines Inactiva
                - cell "ines.inactiva.1791950812329@chem.test" [ref=f2e271]
                - cell "Analista_Inventarios" [ref=f2e272]
                - cell "Activo" [ref=f2e274]
                - cell "13/10/2026" [ref=f2e276]
                - cell [ref=f2e277]:
                  - button [ref=f2e278] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e279]: edit
                  - button [ref=f2e282] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e283]: person_off
                  - button [ref=f2e286] [cursor=pointer]:
                    - img [aria-hidden] [ref=f2e287]: lock_reset
          - group [ref=f2e290]:
            - generic [ref=f2e292]:
              - generic [ref=f2e293]:
                - generic [aria-hidden] [ref=f2e294]: "Items per page:"
                - combobox "Items per page:" [ref=f2e299] [cursor=pointer]:
                  - generic [ref=f2e300]: "10"
              - generic [ref=f2e308]:
                - status [ref=f2e309]: 1 – 7 of 7
                - button "First page" [disabled] [ref=f2e310]
                - button "Previous page" [disabled] [ref=f2e315]
                - button "Next page" [disabled] [ref=f2e320]
                - button "Last page" [disabled] [ref=f2e325]
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
> 60  |     await administrador.intenta(
      |     ^ Error: POST /api/auth/login/: petición cifrada
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