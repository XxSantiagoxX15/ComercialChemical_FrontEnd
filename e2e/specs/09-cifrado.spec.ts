import { ARTICULOS } from '../datos/informes';
import { expect, test, USUARIOS } from '../reparto';
import {
  ElResultadoDeLaImportacion, ElUsuarioEnSesion, INFORME, ImportarElInforme, ImportarLosInformesDePrueba,
  IniciarSesion, IrA, LoQueViajoPorLaRed, LosArticulos, TenerUnaCuenta, VerLaPestana, Verificar, cumple,
} from '../screenplay';
import { esUnSobreCifrado, RUTAS_PUBLICAS } from '../soporte/cifrado';

test.describe('Cifrado de punta a punta: en la pantalla se lee, en la red no', () => {

  test('el correo y la contraseña del login no se ven en la red, ni tampoco la respuesta', async ({ analista }) => {
    const cuenta = analista.habilidadDe(TenerUnaCuenta);

    await analista.intenta(
      IniciarSesion.conSusCredenciales(),
      // En la pantalla, la información se lee con normalidad…
      Verificar.que(ElUsuarioEnSesion.segunElEncabezado(),
        cumple('muestra su nombre', usuario => expect(usuario.nombre).toBe(cuenta.nombre))),
      // …pero lo que viajó por la red es ilegible.
      Verificar.que(LoQueViajoPorLaRed.hacia('/api/auth/login/'), cumple('va cifrado en los dos sentidos', vistos => {
        expect(vistos).toHaveLength(1);
        const [login] = vistos;
        expect(login.estado).toBe(200);
        expect(login.encabezados['x-canal'], 'clave pública del navegador').toBeTruthy();

        expect(esUnSobreCifrado(login.enviado), 'petición cifrada').toBe(true);
        expect(login.enviado).not.toContain(cuenta.correo);
        expect(login.enviado).not.toContain(cuenta.clave);

        expect(esUnSobreCifrado(login.recibido), 'respuesta cifrada').toBe(true);
        expect(login.recibido).not.toContain('access_token');
        expect(login.recibido).not.toContain(cuenta.nombre);
      })),
    );
  });

  test('al recorrer la aplicación, ninguna petición deja datos legibles en la red', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarLosInformesDePrueba.deSaldosYKardex(),
      IrA.elModulo('Dashboard'),
      IrA.elModulo('Artículos'),
      Verificar.que(LosArticulos.listados(),
        cumple('muestra los artículos importados', filas => expect(filas.length).toBe(ARTICULOS.length))),
      IrA.elModulo('Alertas'),
      IrA.elModulo('Movimientos'),
      IrA.elModulo('Compras'),
      IrA.elModulo('Pronósticos'),
      VerLaPestana.de('Más Vendidos'),
      VerLaPestana.de('Recomendaciones'),
      IrA.elModulo('Auditoría'),
      IrA.elModulo('Usuarios'),
    );

    const legibles = [
      ...ARTICULOS.map(articulo => articulo.nombre),
      ...Object.values(USUARIOS).flatMap(usuario => [usuario.correo, usuario.nombre]),
    ];

    await administrador.intenta(
      Verificar.que(LoQueViajoPorLaRed.haciaLaApi(), cumple('todo va cifrado y nada falló', todos => {
        const privados = todos.filter(i => !RUTAS_PUBLICAS.includes(i.ruta));
        expect(privados.length).toBeGreaterThan(20);

        for (const visto of privados) {
          const cual = `${visto.metodo} ${visto.ruta}`;
          expect(visto.estado, `${cual}: respondió bien`).toBeLessThan(400);
          expect(visto.consulta, `${cual}: sin parámetros legibles en la dirección`).toBe('');
          if (visto.enviado) expect(esUnSobreCifrado(visto.enviado), `${cual}: petición cifrada`).toBe(true);
          if (visto.recibido) expect(esUnSobreCifrado(visto.recibido), `${cual}: respuesta cifrada`).toBe(true);
          for (const texto of legibles) {
            expect(visto.recibido.includes(texto), `${cual}: no deja ver «${texto}»`).toBe(false);
          }
        }

        // Las pantallas con filtros mandan sus parámetros cifrados en un encabezado.
        const conParametros = privados.filter(i => i.encabezados['x-canal-consulta']);
        expect(conParametros.length, 'peticiones con parámetros cifrados').toBeGreaterThan(0);
      })),
    );
  });

  test('el archivo que se importa también viaja cifrado', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarElInforme.de('saldos', INFORME.saldos.archivo),
      Verificar.que(ElResultadoDeLaImportacion.mostrado(),
        cumple('se importó', resultado => expect(resultado.titulo).toBe('Importación exitosa'))),
      Verificar.que(LoQueViajoPorLaRed.hacia('/api/importacion/upload/'), cumple('no deja ver el archivo', vistos => {
        expect(vistos).toHaveLength(1);
        const [subida] = vistos;
        expect(esUnSobreCifrado(subida.enviado), 'petición cifrada').toBe(true);
        expect(subida.enviado).not.toContain(INFORME.saldos.nombre);
        expect(subida.enviado).not.toContain('tipo_informe');
        expect(subida.enviado).not.toContain('Informe_Saldos_Existencias_Minimas');
        // Un .xlsx sin cifrar se reconoce por estos textos internos.
        expect(subida.enviado).not.toContain('xl/worksheets');
        expect(esUnSobreCifrado(subida.recibido), 'respuesta cifrada').toBe(true);
      })),
    );
  });
});
