import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { InventarioService } from './inventario.service';
import { environment } from '../../../environments/environment';

describe('InventarioService', () => {
  let service: InventarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InventarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAlertasStockCritico() sin argumentos no manda incluir_ignoradas', () => {
    service.getAlertasStockCritico().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/inventario/alertas-stock-critico/`);
    expect(req.request.params.has('incluir_ignoradas')).toBe(false);
    req.flush({ alertas: [] });
  });

  it('getAlertasStockCritico(true) manda incluir_ignoradas=true', () => {
    service.getAlertasStockCritico(true).subscribe();
    const req = httpMock.expectOne(
      `${environment.apiUrl}/api/inventario/alertas-stock-critico/?incluir_ignoradas=true`,
    );
    expect(req.request.params.get('incluir_ignoradas')).toBe('true');
    req.flush({ alertas: [] });
  });

  // Regresión: ignorarAlerta() pasa por actualizarArticulo(), que serializa
  // el body como FormData (para soportar la ficha de seguridad en PDF). Un
  // booleano en FormData se convierte a los strings 'true'/'false', que es
  // justo lo que el backend espera parsear.
  it('ignorarAlerta() envía alerta_ignorada="true" como FormData por PUT', () => {
    service.ignorarAlerta(42).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/inventario/articulos/42/`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('alerta_ignorada')).toBe('true');
    req.flush({});
  });

  it('reactivarAlerta() envía alerta_ignorada="false"', () => {
    service.reactivarAlerta(42).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/inventario/articulos/42/`);
    expect((req.request.body as FormData).get('alerta_ignorada')).toBe('false');
    req.flush({});
  });

  it('getKitsProducibles() llama al endpoint correcto', () => {
    service.getKitsProducibles().subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/inventario/kits/producibles/`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getResumenStockMensual() manda el parámetro meses', () => {
    service.getResumenStockMensual(6).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/inventario/resumen-stock-mensual/?meses=6`);
    req.flush({ stock_mensual: [] });
  });
});