# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 07-recuperar-contrasena.spec.ts >> Recuperar la contraseña con un código enviado al correo >> Olga recibe el código por correo, cambia su contraseña y entra con la nueva
- Location: e2e\specs\07-recuperar-contrasena.spec.ts:12:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "cid:logo"
Received string:    "<!DOCTYPE html>
<html lang=\"es\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>380770 es tu código para restablecer la contraseña</title>
</head>
<body style=\"margin:0; padding:0; background-color:#f0f2f8;\">
  <!-- Texto que algunos clientes muestran junto al asunto -->
  <div style=\"display:none; max-height:0; overflow:hidden; opacity:0; color:#f0f2f8;\">Tu código es 380770. Vence en 15 minutos.</div>·
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
  <h1 style=\"margin:0 0 14px; font-size:22px; line-height:1.3; color:#1a237e;\">Restablece tu contraseña</h1>·
  <p style=\"margin:0 0 6px;\">Hola, Olga Olvidadiza:</p>
  <p style=\"margin:0 0 22px;\">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Escribe este código en la pantalla de recuperación:</p>·
  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">
    <tr>
      <td align=\"center\" style=\"padding:20px 12px; background-color:#eef0fb; border:1px solid #c5cae9; border-radius:12px;\">
        <div style=\"font-family:'Courier New',Courier,monospace; font-size:36px; font-weight:bold; letter-spacing:10px; color:#1a237e; padding-left:10px;\">380770</div>
        <div style=\"font-size:13px; color:#5c6bc0; padding-top:8px;\">Vence en 15 minutos y solo se puede usar una vez</div>
      </td>
    </tr>
  </table>·
  <table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\" align=\"center\" style=\"margin:26px auto 0;\">
    <tr>
      <td align=\"center\" bgcolor=\"#1a237e\" style=\"border-radius:9px;\">
        <a href=\"http://localhost:4200/recuperar?correo=olvido.e2e%40chem.test\" style=\"display:inline-block; padding:13px 28px; font-family:Arial,Helvetica,sans-serif; font-size:15px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:9px;\">Escribir el código</a>
      </td>
    </tr>
  </table>·
  <p style=\"margin:26px 0 0; font-size:13px; color:#78909c;\">
    Si no esperabas este correo, ignóralo: tu contraseña sigue siendo la misma.
    Nadie de Comercial Chemical S.A.S. te pedirá este código.
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
- main [ref=e4]:
  - generic [ref=e5]:
    - img "Comercial Chemical" [ref=e6]
    - heading "Escribe el código" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - text: Si
      - strong [ref=e9]: olvido.e2e@chem.test
      - text: está registrado, le llegó un código de 6 dígitos. Vence en 15 minutos.
    - generic [ref=e10]:
      - generic [ref=e11]: Código
      - textbox "Código" [ref=e12]:
        - /placeholder: "000000"
      - generic [ref=e13]: Contraseña nueva
      - generic [ref=e14]:
        - textbox "Contraseña nueva" [ref=e15]:
          - /placeholder: Mínimo 6 caracteres
        - button "Mostrar contraseña" [ref=e16] [cursor=pointer]:
          - img [aria-hidden] [ref=e17]: visibility
      - generic [ref=e18]: Repite la contraseña
      - textbox "Repite la contraseña" [ref=e19]
      - button "Cambiar contraseña" [disabled] [ref=e20]
    - generic [ref=e21]:
      - button "Enviar otro código" [ref=e22] [cursor=pointer]
      - button "Usar otro correo" [ref=e23] [cursor=pointer]
    - link "Volver a iniciar sesión" [ref=e24] [cursor=pointer]:
      - /url: /login
```

# Test source

```ts
  1   | import { expect, test, USUARIOS } from '../reparto';
  2   | import {
  3   |   Abrir, CambiarSuClave, Clic, ElEnlaceDelCorreo, ElErrorDeInicioDeSesion, ElTexto, ElUltimoCorreo,
  4   |   ElUsuarioEnSesion, Escribir, Esperar, IniciarSesion, LaRutaActual, LeerElCodigo, LosCorreos,
  5   |   PantallaDeLogin, PantallaDeRecuperacion, PedirUnCodigo, RevisarSuCorreo, SiEstaHabilitado,
  6   |   TenerUnaCuenta, Verificar, contiene, cumple, esFalso, esIgualA, tieneTamano,
  7   | } from '../screenplay';
  8   | import { ENTORNO } from '../soporte/entorno';
  9   | 
  10  | test.describe('Recuperar la contraseña con un código enviado al correo', () => {
  11  | 
  12  |   test('Olga recibe el código por correo, cambia su contraseña y entra con la nueva', async ({ olvidadizo: olga }) => {
  13  |     const cuenta = olga.habilidadDe(TenerUnaCuenta);
  14  |     const claveAnterior = cuenta.clave;
  15  |     const claveNueva = `Nueva#${Date.now()}`;
  16  | 
  17  |     await olga.intenta(
  18  |       PedirUnCodigo.paraSuCuenta(),
  19  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Escribe el código')),
  20  |       LeerElCodigo.queLeLlegoPorCorreo(),
  21  |     );
  22  | 
  23  |     // El correo es el esperado: asunto con el código, logo incrustado y enlace a la pantalla.
  24  |     const codigo = olga.recordado<string>('codigo');
> 25  |     await olga.intenta(
      |     ^ Error: expect(received).toContain(expected) // indexOf
  26  |       Verificar.que(ElUltimoCorreo.recibido(), cumple('es el correo del código', correo => {
  27  |         expect(correo.asunto).toBe(`${codigo} es tu código para restablecer la contraseña`);
  28  |         expect(correo.texto).toContain(`Hola, ${cuenta.nombre}`);
  29  |         expect(correo.html).toContain(codigo);
  30  |         expect(correo.html).toContain('cid:logo');
  31  |         expect(correo.conLogo).toBe(true);
  32  |       })),
  33  |       Verificar.que(ElEnlaceDelCorreo.recibido(),
  34  |         contiene(`/recuperar?correo=${encodeURIComponent(cuenta.correo)}`)),
  35  |     );
  36  | 
  37  |     // Un código equivocado no sirve…
  38  |     const codigoEquivocado = codigo === '000000' ? '111111' : '000000';
  39  |     await olga.intenta(
  40  |       CambiarSuClave.conElCodigo(codigoEquivocado, claveNueva),
  41  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.error), contiene('El código no es válido o ya venció')),
  42  |     );
  43  | 
  44  |     // …y con el correcto la contraseña cambia.
  45  |     await olga.intenta(
  46  |       CambiarSuClave.conElCodigoQueRecibio(claveNueva),
  47  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Contraseña actualizada')),
  48  |       Clic.en(PantallaDeRecuperacion.irAlLogin),
  49  |       Esperar.aLaRuta(PantallaDeLogin.ruta),
  50  |     );
  51  | 
  52  |     // La anterior ya no entra; la nueva sí.
  53  |     await olga.intenta(
  54  |       IniciarSesion.con(cuenta.correo, claveAnterior),
  55  |       Verificar.que(ElErrorDeInicioDeSesion.mostrado(), contiene('Credenciales inválidas')),
  56  |       IniciarSesion.conSusCredenciales(),
  57  |       Verificar.que(ElUsuarioEnSesion.segunElEncabezado(),
  58  |         cumple('es Olga', usuario => expect(usuario.nombre).toBe(cuenta.nombre))),
  59  |     );
  60  | 
  61  |     // Y el código, ya usado, no sirve por segunda vez.
  62  |     await olga.intenta(
  63  |       Abrir.laRuta(`/recuperar?correo=${encodeURIComponent(cuenta.correo)}`),
  64  |       CambiarSuClave.conElCodigo(codigo, 'Otra#Clave2026'),
  65  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.error), contiene('El código no es válido o ya venció')),
  66  |     );
  67  |   });
  68  | 
  69  |   test('pedir otro código enseguida no envía un segundo correo', async ({ analista }) => {
  70  |     await analista.intenta(
  71  |       PedirUnCodigo.paraSuCuenta(),
  72  |       Verificar.que(LosCorreos.recibidos(), tieneTamano(1)),
  73  |       Clic.en(PantallaDeRecuperacion.enviarOtroCodigo),
  74  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.aviso), contiene('Si pasó más de un minuto')),
  75  |       Verificar.que(LosCorreos.recibidos(), tieneTamano(1)),
  76  |     );
  77  |   });
  78  | 
  79  |   test('con un correo que no existe la pantalla responde igual y no se envía nada', async ({ visitante }) => {
  80  |     const inexistente = `nadie.${Date.now()}@chem.test`;
  81  | 
  82  |     // El visitante puede mirar el buzón de esa dirección para comprobar que sigue vacío.
  83  |     visitante.quienPuede(RevisarSuCorreo.en(ENTORNO.correos, inexistente));
  84  | 
  85  |     await visitante.intenta(
  86  |       PedirUnCodigo.paraElCorreo(inexistente),
  87  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Escribe el código')),
  88  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.guia), contiene(inexistente)),
  89  |       Verificar.que(LosCorreos.recibidos(), tieneTamano(0)),
  90  |     );
  91  |   });
  92  | 
  93  |   test('el enlace del correo lleva directo al paso del código y exige repetir bien la contraseña', async ({ visitante }) => {
  94  |     const correo = USUARIOS.analista.correo;
  95  | 
  96  |     await visitante.intenta(
  97  |       Abrir.laRuta(`/recuperar?correo=${encodeURIComponent(correo)}`),
  98  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.titulo), esIgualA('Escribe el código')),
  99  |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.guia), contiene(correo)),
  100 |       Escribir.elTexto('123456').en(PantallaDeRecuperacion.codigo),
  101 |       Escribir.laClave('Clave#Uno2026').en(PantallaDeRecuperacion.claveNueva),
  102 |       Escribir.laClave('Clave#Dos2026').en(PantallaDeRecuperacion.repetirClave),
  103 |       Verificar.que(ElTexto.de(PantallaDeRecuperacion.clavesDistintas), contiene('no son iguales')),
  104 |       Verificar.que(SiEstaHabilitado.a(PantallaDeRecuperacion.cambiarClave), esFalso()),
  105 |       Verificar.que(LaRutaActual.delNavegador(), esIgualA(PantallaDeRecuperacion.ruta)),
  106 |     );
  107 |   });
  108 | });
  109 | 
```