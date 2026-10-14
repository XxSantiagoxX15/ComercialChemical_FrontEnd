# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 08-usuarios.spec.ts >> Gestión de usuarios >> al crear un usuario le llega el correo de bienvenida y ya puede entrar
- Location: e2e\specs\08-usuarios.spec.ts:21:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "cid:logo"
Received string:    "<!DOCTYPE html>
<html lang=\"es\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>Bienvenido a CHEM-MODINV</title>
</head>
<body style=\"margin:0; padding:0; background-color:#f0f2f8;\">
  <!-- Texto que algunos clientes muestran junto al asunto -->
  <div style=\"display:none; max-height:0; overflow:hidden; opacity:0; color:#f0f2f8;\">Tu cuenta en CHEM-MODINV ya está lista.</div>·
  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#f0f2f8;\">
    <tr>
      <td align=\"center\" style=\"padding:32px 12px;\">·
        <table role=\"presentation\" width=\"560\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"width:560px; max-width:100%; background-color:#ffffff; border-radius:14px; overflow:hidden; border:1px solid #e3e6f0;\">
          <tr>
            <td style=\"height:5px; line-height:5px; font-size:0; background-color:#1a237e;\">&nbsp;</td>
          </tr>·
          <!-- Encabezado: logo de la empresa -->
          <tr>
            <td align=\"center\" style=\"padding:28px 40px 8px;\">···············
                <div style=\"font-family:Georgia,'Times New Roman',serif; font-size:20px; letter-spacing:3px; color:#111827;\">COMERCIAL CHEMICAL</div>···············
              <div style=\"font-family:Arial,Helvetica,sans-serif; font-size:11px; font-weight:bold; letter-spacing:2.5px; color:#3949ab; padding-top:10px;\">CHEM-MODINV</div>
            </td>
          </tr>·
          <!-- Contenido -->
          <tr>
            <td style=\"padding:16px 40px 34px; font-family:Arial,Helvetica,sans-serif; font-size:15px; line-height:1.6; color:#37474f;\">···············
  <h1 style=\"margin:0 0 14px; font-size:22px; line-height:1.3; color:#1a237e;\">Bienvenido a CHEM-MODINV</h1>·
  <p style=\"margin:0 0 6px;\">Hola, Nora Nueva:</p>
  <p style=\"margin:0 0 22px;\">Se creó tu cuenta en el sistema de inventarios de Comercial Chemical S.A.S. Estos son tus datos de acceso:</p>·
  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" style=\"background-color:#f7f8fc; border:1px solid #e3e6f0; border-radius:12px;\">
    <tr>
      <td style=\"padding:14px 20px 4px; font-size:12px; font-weight:bold; letter-spacing:1px; color:#8a94a6;\">USUARIO</td>
    </tr>
    <tr>
      <td style=\"padding:0 20px 12px; font-size:16px; font-weight:bold; color:#111827;\">nora.nueva.1791950796089@chem.test</td>
    </tr>
    <tr>
      <td style=\"padding:10px 20px 4px; border-top:1px solid #e3e6f0; font-size:12px; font-weight:bold; letter-spacing:1px; color:#8a94a6;\">ROL</td>
    </tr>
    <tr>
      <td style=\"padding:0 20px 14px; font-size:16px; font-weight:bold; color:#111827;\">Analista de Inventarios</td>
    </tr>
  </table>·
  <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\" style=\"margin:26px auto 0;\">
    <tr>
      <td align=\"center\" bgcolor=\"#1a237e\" style=\"border-radius:9px;\">
        <a href=\"http://localhost:4200/login\" style=\"display:inline-block; padding:13px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:9px;\">Ingresar al sistema</a>
      </td>
    </tr>
  </table>·
  <p style=\"margin:26px 0 0; font-size:13px; color:#78909c;\">
    El administrador te entregará tu contraseña inicial. Si prefieres crear la
    tuya, usa «¿Olvidaste tu contraseña?» en la pantalla de ingreso y te
    llegará un código a este correo.
  </p>·
            </td>
          </tr>·
          <!-- Pie -->
          <tr>
            <td style=\"padding:18px 40px 22px; background-color:#f7f8fc; border-top:1px solid #e3e6f0; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.5; color:#8a94a6;\" align=\"center\">
              Mensaje automático de CHEM-MODINV, el sistema de inventarios de Comercial Chemical S.A.S.<br>
              No respondas a este correo.
            </td>
          </tr>
        </table>·
      </td>
    </tr>
  </table>
</body>
</html>"

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
        - generic [ref=f1e66]:
          - heading "👥 Gestión de Usuarios" [level=1] [ref=f1e67]
          - generic [ref=f1e68]:
            - button "Permisos por Rol" [ref=f1e69]:
              - img [aria-hidden] [ref=f1e70]: security
            - button "Nuevo Usuario" [active] [ref=f1e74]:
              - img [aria-hidden] [ref=f1e75]: person_add
        - generic [ref=f1e80]:
          - generic [ref=f1e81]:
            - generic [ref=f1e84]:
              - generic: Buscar usuario
              - textbox "Buscar usuario" [ref=f1e87]:
                - /placeholder: Nombre, correo...
              - img [aria-hidden] [ref=f1e89]: search
            - button "Actualizar" [ref=f1e91]:
              - img [aria-hidden] [ref=f1e92]: refresh
          - table [ref=f1e97]:
            - rowgroup [ref=f1e98]:
              - row [ref=f1e99]:
                - columnheader [ref=f1e100] [cursor=pointer]:
                  - button "Nombre" [ref=f1e101]
                - columnheader [ref=f1e106] [cursor=pointer]:
                  - button "Correo" [ref=f1e107]
                - columnheader "Rol" [ref=f1e112]
                - columnheader "Estado" [ref=f1e113]
                - columnheader [ref=f1e114] [cursor=pointer]:
                  - button "Creado" [ref=f1e115]
                - columnheader "Acciones" [ref=f1e120]
            - rowgroup [ref=f1e121]:
              - row [ref=f1e122]:
                - cell "A Ada Administradora" [ref=f1e123]:
                  - generic [ref=f1e124]:
                    - generic [ref=f1e125]: A
                    - generic [ref=f1e126]: Ada Administradora
                - cell "admin.e2e@chem.test" [ref=f1e127]
                - cell "Administrador" [ref=f1e128]
                - cell "Activo" [ref=f1e130]
                - cell "13/10/2026" [ref=f1e132]
                - cell [ref=f1e133]:
                  - button [ref=f1e134] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e135]: edit
                  - button [ref=f1e138] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e139]: person_off
                  - button [ref=f1e142] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e143]: lock_reset
              - row [ref=f1e146]:
                - cell "A Andrés Analista" [ref=f1e147]:
                  - generic [ref=f1e148]:
                    - generic [ref=f1e149]: A
                    - generic [ref=f1e150]: Andrés Analista
                - cell "analista.e2e@chem.test" [ref=f1e151]
                - cell "Analista_Inventarios" [ref=f1e152]
                - cell "Activo" [ref=f1e154]
                - cell "13/10/2026" [ref=f1e156]
                - cell [ref=f1e157]:
                  - button [ref=f1e158] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e159]: edit
                  - button [ref=f1e162] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e163]: person_off
                  - button [ref=f1e166] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e167]: lock_reset
              - row [ref=f1e170]:
                - cell "C Carla Compras" [ref=f1e171]:
                  - generic [ref=f1e172]:
                    - generic [ref=f1e173]: C
                    - generic [ref=f1e174]: Carla Compras
                - cell "compras.e2e@chem.test" [ref=f1e175]
                - cell "Responsable_Compras" [ref=f1e176]
                - cell "Activo" [ref=f1e178]
                - cell "13/10/2026" [ref=f1e180]
                - cell [ref=f1e181]:
                  - button [ref=f1e182] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e183]: edit
                  - button [ref=f1e186] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e187]: person_off
                  - button [ref=f1e190] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e191]: lock_reset
              - row [ref=f1e194]:
                - cell "O Olga Olvidadiza" [ref=f1e195]:
                  - generic [ref=f1e196]:
                    - generic [ref=f1e197]: O
                    - generic [ref=f1e198]: Olga Olvidadiza
                - cell "olvido.e2e@chem.test" [ref=f1e199]
                - cell "Analista_Inventarios" [ref=f1e200]
                - cell "Activo" [ref=f1e202]
                - cell "13/10/2026" [ref=f1e204]
                - cell [ref=f1e205]:
                  - button [ref=f1e206] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e207]: edit
                  - button [ref=f1e210] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e211]: person_off
                  - button [ref=f1e214] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e215]: lock_reset
              - row [ref=f1e218]:
                - cell "D Dario Descuidado" [ref=f1e219]:
                  - generic [ref=f1e220]:
                    - generic [ref=f1e221]: D
                    - generic [ref=f1e222]: Dario Descuidado
                - cell "bloqueo.e2e@chem.test" [ref=f1e223]
                - cell "Responsable_Compras" [ref=f1e224]
                - cell "Activo" [ref=f1e226]
                - cell "13/10/2026" [ref=f1e228]
                - cell [ref=f1e229]:
                  - button [ref=f1e230] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e231]: edit
                  - button [ref=f1e234] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e235]: person_off
                  - button [ref=f1e238] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e239]: lock_reset
              - row [ref=f1e242]:
                - cell "N Nora Nueva" [ref=f1e243]:
                  - generic [ref=f1e244]:
                    - generic [ref=f1e245]: "N"
                    - generic [ref=f1e246]: Nora Nueva
                - cell "nora.nueva.1791950796089@chem.test" [ref=f1e247]
                - cell "Analista_Inventarios" [ref=f1e248]
                - cell "Activo" [ref=f1e250]
                - cell "13/10/2026" [ref=f1e252]
                - cell [ref=f1e253]:
                  - button [ref=f1e254] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e255]: edit
                  - button [ref=f1e258] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e259]: person_off
                  - button [ref=f1e262] [cursor=pointer]:
                    - img [aria-hidden] [ref=f1e263]: lock_reset
          - group [ref=f1e266]:
            - generic [ref=f1e268]:
              - generic [ref=f1e269]:
                - generic [aria-hidden] [ref=f1e270]: "Items per page:"
                - combobox "Items per page:" [ref=f1e275] [cursor=pointer]:
                  - generic [ref=f1e276]: "10"
              - generic [ref=f1e284]:
                - status [ref=f1e285]: 1 – 6 of 6
                - button "First page" [disabled] [ref=f1e286]
                - button "Previous page" [disabled] [ref=f1e291]
                - button "Next page" [disabled] [ref=f1e296]
                - button "Last page" [disabled] [ref=f1e301]
```

# Test source

```ts
  1   | import { menuDe, MODULOS_POR_DEFECTO } from '../datos/modulos';
  2   | import { expect, test, USUARIOS } from '../reparto';
  3   | import {
  4   |   CambiarElEstado, CrearElUsuario, ElAviso, ElCodigoDeRecuperacion, ElEnlaceDelCorreo,
  5   |   ElErrorDeInicioDeSesion, ElTexto, ElUltimoCorreo, EnviarUnCodigo, FormularioDeUsuario,
  6   |   IniciarSesion, LasOpcionesDelMenu, LosCorreos, PantallaDeUsuarios, SiSeVe, Verificar,
  7   |   coincideCon, contiene, cumple, esIgualA, esVerdadero, tieneTamano,
  8   | } from '../screenplay';
  9   | import type { Cuenta } from '../screenplay';
  10  | 
  11  | /** Una persona nueva en cada ejecución, para poder repetir la prueba sin chocar con la anterior. */
  12  | const personaNueva = (nombre: string): Cuenta => ({
  13  |   nombre,
  14  |   correo: `${nombre.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@chem.test`,
  15  |   clave: 'Inicial#2026',
  16  |   rol: 'Analista_Inventarios',
  17  | });
  18  | 
  19  | test.describe('Gestión de usuarios', () => {
  20  | 
  21  |   test('al crear un usuario le llega el correo de bienvenida y ya puede entrar', async ({ administrador, nuevoActor }) => {
  22  |     const cuenta = personaNueva('Nora Nueva');
  23  |     const nora = await nuevoActor(cuenta);
  24  | 
  25  |     await administrador.intenta(
  26  |       IniciarSesion.conSusCredenciales(),
  27  |       CrearElUsuario.conLosDatos(cuenta),
  28  |       Verificar.que(ElAviso.emergente(), contiene(`Se envió un correo de bienvenida a ${cuenta.correo}`)),
  29  |       Verificar.que(ElTexto.de(PantallaDeUsuarios.estadoDe(cuenta.correo)), esIgualA('Activo')),
  30  |     );
  31  | 
> 32  |     await nora.intenta(
      |     ^ Error: expect(received).toContain(expected) // indexOf
  33  |       Verificar.que(LosCorreos.recibidos(), tieneTamano(1)),
  34  |       Verificar.que(ElUltimoCorreo.recibido(), cumple('es el correo de bienvenida', correo => {
  35  |         expect(correo.asunto).toBe('Bienvenido a CHEM-MODINV');
  36  |         expect(correo.texto).toContain(`Hola, ${cuenta.nombre}`);
  37  |         expect(correo.texto).toContain(`Usuario: ${cuenta.correo}`);
  38  |         expect(correo.texto).toContain('Rol: Analista de Inventarios');
  39  |         expect(correo.html).toContain('cid:logo');
  40  |         expect(correo.conLogo).toBe(true);
  41  |         // La contraseña nunca viaja por correo.
  42  |         expect(correo.texto + correo.html).not.toContain(cuenta.clave);
  43  |       })),
  44  |       Verificar.que(ElEnlaceDelCorreo.recibido(), coincideCon(/\/login$/)),
  45  |     );
  46  | 
  47  |     // Entra con la contraseña que le dio el Administrador y ve el menú de su rol.
  48  |     await nora.intenta(
  49  |       IniciarSesion.conSusCredenciales(),
  50  |       Verificar.que(LasOpcionesDelMenu.visibles(), esIgualA(menuDe(MODULOS_POR_DEFECTO['Analista_Inventarios']))),
  51  |     );
  52  |   });
  53  | 
  54  |   test('no se puede crear un usuario con un correo que ya existe', async ({ administrador }) => {
  55  |     const repetido: Cuenta = { ...personaNueva('Rita Repetida'), correo: USUARIOS.analista.correo };
  56  | 
  57  |     await administrador.intenta(
  58  |       IniciarSesion.conSusCredenciales(),
  59  |       CrearElUsuario.intentandoCon(repetido),
  60  |       Verificar.que(SiSeVe.a(FormularioDeUsuario.error), esVerdadero()),
  61  |       // La ventana sigue abierta: no se creó nada.
  62  |       Verificar.que(SiSeVe.a(FormularioDeUsuario.ventana), esVerdadero()),
  63  |     );
  64  |   });
  65  | 
  66  |   test('un usuario desactivado no puede entrar hasta que lo reactivan', async ({ administrador, nuevoActor }) => {
  67  |     const cuenta = personaNueva('Ines Inactiva');
  68  |     const ines = await nuevoActor(cuenta);
  69  | 
  70  |     await administrador.intenta(
  71  |       IniciarSesion.conSusCredenciales(),
  72  |       CrearElUsuario.conLosDatos(cuenta),
  73  |       CambiarElEstado.delUsuario(cuenta.correo),
  74  |       Verificar.que(ElTexto.de(PantallaDeUsuarios.estadoDe(cuenta.correo)), esIgualA('Inactivo')),
  75  |     );
  76  |     await ines.intenta(
  77  |       IniciarSesion.sinEsperarElResultado(),
  78  |       Verificar.que(ElErrorDeInicioDeSesion.mostrado(), contiene('Credenciales inválidas')),
  79  |     );
  80  | 
  81  |     await administrador.intenta(
  82  |       CambiarElEstado.delUsuario(cuenta.correo),
  83  |       Verificar.que(ElTexto.de(PantallaDeUsuarios.estadoDe(cuenta.correo)), esIgualA('Activo')),
  84  |     );
  85  |     await ines.intenta(IniciarSesion.conSusCredenciales());
  86  |   });
  87  | 
  88  |   test('el Administrador envía un código para que otro usuario restablezca su contraseña', async ({ administrador, compras }) => {
  89  |     const correoDeCarla = USUARIOS.compras.correo;
  90  | 
  91  |     await administrador.intenta(
  92  |       IniciarSesion.conSusCredenciales(),
  93  |       EnviarUnCodigo.alUsuario(correoDeCarla),
  94  |       Verificar.que(ElAviso.emergente(), contiene(`Se envió un código a ${correoDeCarla}`)),
  95  |     );
  96  | 
  97  |     // A Carla le llega el código, con la explicación de que lo pidió un administrador.
  98  |     await compras.intenta(
  99  |       Verificar.que(ElCodigoDeRecuperacion.recibidoPorCorreo(), coincideCon(/^\d{6}$/)),
  100 |       Verificar.que(ElUltimoCorreo.recibido(),
  101 |         cumple('explica quién lo pidió', correo =>
  102 |           expect(correo.texto).toContain('Un administrador solicitó restablecer la contraseña'))),
  103 |     );
  104 |   });
  105 | });
  106 | 
```