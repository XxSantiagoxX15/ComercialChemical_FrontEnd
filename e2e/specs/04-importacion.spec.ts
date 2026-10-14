import { ARTICULOS, ESPERADO, minimoDe, stockDe, totalVendidoDe } from '../datos/informes';
import { expect, test } from '../reparto';
import { aNumero } from '../soporte/numeros';
import {
  Clic, ElHistorialDeImportaciones, ElIndicadorDelDashboard, ElResultadoDeLaImportacion, ElTexto,
  ElegirUnArchivo, INFORME, ImportarElInforme, IniciarSesion, IrA, LosArticulos,
  PantallaDeImportacion, SiSeVe, Verificar,
  cumple, esFalso, esIgualA, esVerdadero,
} from '../screenplay';

// Estas pruebas dependen unas de otras: van en orden (Saldos → Kardex → repetir).
test.describe.configure({ mode: 'serial' });

test.describe('Importación de informes', () => {

  test('«Seleccionar archivo» abre el explorador y muestra el archivo elegido', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      IrA.elModulo('Importación'),
      ElegirUnArchivo.paraElInformeDe('saldos', INFORME.saldos.archivo),
      Verificar.que(ElTexto.de(PantallaDeImportacion.archivoElegido), esIgualA(INFORME.saldos.nombre)),
      Verificar.que(SiSeVe.a(PantallaDeImportacion.subir), esVerdadero()),
    );

    // «Cancelar» descarta el archivo y vuelve a ofrecer el botón.
    await administrador.intenta(
      Clic.en(PantallaDeImportacion.cancelar),
      Verificar.que(SiSeVe.a(PantallaDeImportacion.seleccionarArchivo), esVerdadero()),
      Verificar.que(SiSeVe.a(PantallaDeImportacion.archivoElegido), esFalso()),
    );
  });

  test('un archivo que no es un informe se rechaza con un mensaje de error', async ({ administrador }) => {
    const noEsUnExcel = {
      name: 'no-es-un-informe.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: Buffer.from('esto es un texto, no un libro de Excel'),
    };

    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarElInforme.de('saldos', noEsUnExcel),
      Verificar.que(ElResultadoDeLaImportacion.mostrado(), cumple('es un error de lectura', resultado => {
        expect(resultado.titulo).toBe('Error en la importación');
        expect(resultado.mensaje).toContain('No se pudo leer el archivo');
      })),
      Verificar.que(ElHistorialDeImportaciones.completo(), esIgualA([])),
    );
  });

  test('el informe de Saldos crea los artículos con su stock y su mínimo', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarElInforme.de('saldos', INFORME.saldos.archivo),
      Verificar.que(ElResultadoDeLaImportacion.mostrado(), esIgualA({
        titulo: 'Importación exitosa',
        mensaje: `${ESPERADO.articulos} registros importados correctamente.`,
      })),
      Verificar.que(ElHistorialDeImportaciones.completo(), esIgualA([{
        tipo: 'Saldos vs Existencias Mínimas',
        archivo: INFORME.saldos.nombre,
        estado: 'Exitoso',
        registros: String(ESPERADO.articulos),
      }])),
    );

    // En Artículos está cada uno con el stock sumado de sus bodegas y el mínimo mayor.
    await administrador.intenta(
      IrA.elModulo('Artículos'),
      Verificar.que(LosArticulos.listados(), cumple('coincide con el informe de Saldos', filas => {
        expect(filas.map(f => f.codigo).sort()).toEqual([...ESPERADO.codigos].sort());
        for (const articulo of ARTICULOS) {
          const fila = filas.find(f => f.codigo === articulo.codigo)!;
          expect(fila.descripcion, articulo.codigo).toBe(articulo.nombre);
          expect(aNumero(fila.stock_actual), `stock de ${articulo.codigo}`).toBe(stockDe(articulo));
          expect(aNumero(fila.stock_minimo), `mínimo de ${articulo.codigo}`).toBe(minimoDe(articulo));
        }
      })),
    );
  });

  test('el informe de Kardex carga las ventas de cada artículo', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarElInforme.de('kardex', INFORME.kardex.archivo),
      Verificar.que(ElResultadoDeLaImportacion.mostrado(), esIgualA({
        titulo: 'Importación exitosa',
        mensaje: `${ESPERADO.ventasImportadas} registros importados correctamente.`,
      })),
      Verificar.que(ElHistorialDeImportaciones.completo(), cumple('tiene el Kardex arriba y Saldos debajo', filas => {
        expect(filas).toHaveLength(2);
        expect(filas[0]).toEqual({
          tipo: 'Kardex',
          archivo: INFORME.kardex.nombre,
          estado: 'Exitoso',
          registros: String(ESPERADO.ventasImportadas),
        });
      })),
    );

    // Lo vendido por artículo es la suma de sus ventas (las compras no cuentan,
    // y las dos facturas iguales del mismo día cuentan las dos); el stock no cambia.
    await administrador.intenta(
      IrA.elModulo('Artículos'),
      Verificar.que(LosArticulos.listados(), cumple('coincide con el Kardex', filas => {
        expect(filas).toHaveLength(ESPERADO.articulos);
        for (const articulo of ARTICULOS) {
          const fila = filas.find(f => f.codigo === articulo.codigo)!;
          const vendido = totalVendidoDe(articulo);
          if (vendido > 0) expect(aNumero(fila.total_vendido), `vendido de ${articulo.codigo}`).toBe(vendido);
          else expect(fila.total_vendido, `vendido de ${articulo.codigo}`).toBe('—');
          expect(aNumero(fila.stock_actual), `stock de ${articulo.codigo}`).toBe(stockDe(articulo));
        }
      })),
    );
  });

  test('volver a subir el mismo Kardex no duplica ninguna venta', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      ImportarElInforme.de('kardex', INFORME.kardex.archivo),
      Verificar.que(ElResultadoDeLaImportacion.mostrado(), cumple('no importa nada nuevo', resultado => {
        expect(resultado.titulo).toBe('Importación exitosa');
        expect(resultado.mensaje).toMatch(/^0 registros importados correctamente\. \d+ filas ya existían/);
      })),
      IrA.elModulo('Artículos'),
      Verificar.que(LosArticulos.listados(), cumple('conserva lo vendido', filas => {
        for (const articulo of ARTICULOS.filter(a => totalVendidoDe(a) > 0)) {
          const fila = filas.find(f => f.codigo === articulo.codigo)!;
          expect(aNumero(fila.total_vendido), `vendido de ${articulo.codigo}`).toBe(totalVendidoDe(articulo));
        }
      })),
    );
  });

  test('el Dashboard refleja lo importado', async ({ administrador }) => {
    await administrador.intenta(
      IniciarSesion.conSusCredenciales(),
      Verificar.que(ElIndicadorDelDashboard.llamado('Total Artículos'), esIgualA(String(ESPERADO.articulos))),
      Verificar.que(ElIndicadorDelDashboard.llamado('Stock Crítico'), esIgualA(String(ESPERADO.enAlerta.length))),
    );
  });
});
