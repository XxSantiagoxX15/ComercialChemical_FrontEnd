import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AlertasComponent } from './alertas.component';

describe('AlertasComponent', () => {
  let component: AlertasComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlertasComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    component = TestBed.createComponent(AlertasComponent).componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getPct / getNivel / getNivelLabel', () => {
    it('critico cuando el stock queda en 25% o menos del mínimo', () => {
      const art = { stock_actual: 2, stock_minimo: 10 };
      expect(component.getPct(art)).toBe(20);
      expect(component.getNivel(art)).toBe('critico');
      expect(component.getNivelLabel(art)).toBe('Crítico');
    });

    it('alto cuando el stock está entre 26% y 50% del mínimo', () => {
      const art = { stock_actual: 4, stock_minimo: 10 };
      expect(component.getNivel(art)).toBe('alto');
    });

    it('medio cuando el stock está entre 51% y 75% del mínimo', () => {
      const art = { stock_actual: 6, stock_minimo: 10 };
      expect(component.getNivel(art)).toBe('medio');
    });

    it('bajo cuando el stock supera el 75% del mínimo', () => {
      const art = { stock_actual: 9, stock_minimo: 10 };
      expect(component.getNivel(art)).toBe('bajo');
    });

    it('sin stock_minimo configurado retorna 0% en vez de dividir por cero', () => {
      expect(component.getPct({ stock_actual: 5, stock_minimo: 0 })).toBe(0);
    });
  });

  // Regresión: DRF serializa DecimalField como string ("2.130"), lo que
  // rompe el orden numérico por defecto de MatSort si no se corrige.
  describe('sortingDataAccessor', () => {
    beforeEach(() => {
      component.ngOnInit();
      httpMock.expectOne(req => req.url.includes('/alertas-stock-critico/')).flush({ alertas: [] });
      httpMock.expectOne(req => req.url.includes('/alertas-vencimiento/')).flush({ alertas: [] });
    });

    it('convierte stock_actual y stock_minimo de string a número', () => {
      const accessor = component.dataSource.sortingDataAccessor;
      expect(accessor({ stock_actual: '2.130' } as any, 'stock_actual')).toBe(2.13);
      expect(accessor({ stock_minimo: '10.000' } as any, 'stock_minimo')).toBe(10);
    });

    it('deja pasar cualquier otra columna sin transformar', () => {
      const accessor = component.dataSource.sortingDataAccessor;
      expect(accessor({ codigo: 'ABC-01' } as any, 'codigo')).toBe('ABC-01');
    });
  });
});