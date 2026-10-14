import { ESPERADO } from '../datos/informes';
import { enEscena, test } from '../reparto';
import {
  ElAviso, ImportarLosInformesDePrueba, IniciarSesion, LasAlertasDeStock, MarcarLaAlerta,
  ReactivarLaAlerta, VerLasAlertas, Verificar, contiene, esIgualA,
} from '../screenplay';

const enAlerta = [...ESPERADO.enAlerta].sort();

test.describe('Alertas de stock', () => {

  test.beforeAll(async ({ browser }) => {
    await enEscena(browser, 'administrador', ada => ada.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarLosInformesDePrueba.deSaldosYKardex(),
    ));
  });

  test('aparecen solo los artículos con el stock en su mínimo o por debajo', async ({ analista }) => {
    await analista.intenta(
      IniciarSesion.conSusCredenciales(),
      VerLasAlertas.deStock(),
      Verificar.que(LasAlertasDeStock.vigentes(), esIgualA(enAlerta)),
    );
  });

  // Carla (Compras) no tiene el módulo de Artículos, solo el de Alertas: aun
  // así debe poder marcar «No me interesa», y solo eso.
  test('«No me interesa» oculta la alerta y «Reactivar» la devuelve', async ({ compras }) => {
    const ignorada = enAlerta[0];
    const lasDemas = enAlerta.filter(codigo => codigo !== ignorada);

    await compras.intenta(
      IniciarSesion.conSusCredenciales(),
      VerLasAlertas.deStock(),
      MarcarLaAlerta.comoNoMeInteresa(ignorada),
      Verificar.que(ElAviso.emergente(), contiene(`Alerta de "${ignorada}" ignorada`)),
      Verificar.que(LasAlertasDeStock.vigentes(), esIgualA(lasDemas)),
    );

    // Sigue ignorada al volver a entrar: quedó guardada, no era solo de la pantalla.
    await compras.intenta(
      VerLasAlertas.deStock(),
      Verificar.que(LasAlertasDeStock.vigentes(), esIgualA(lasDemas)),
      VerLasAlertas.ignoradas(),
      Verificar.que(LasAlertasDeStock.ignoradas(), esIgualA([ignorada])),
    );

    await compras.intenta(
      ReactivarLaAlerta.de(ignorada),
      Verificar.que(LasAlertasDeStock.vigentes(), esIgualA(enAlerta)),
      Verificar.que(LasAlertasDeStock.ignoradas(), esIgualA([])),
    );
  });
});
