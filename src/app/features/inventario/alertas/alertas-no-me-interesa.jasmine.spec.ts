import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';

import { AlertasComponent } from './alertas.component';
import { InventarioService } from '../../../core/services/inventario.service';

/** «No me interesa» oculta una alerta de stock; el aviso ofrece «Deshacer»; «Reactivar» la devuelve. */
describe('Alertas: «No me interesa» y «Reactivar» (Jasmine)', () => {
  let fixture: ComponentFixture<AlertasComponent>;
  let componente: AlertasComponent;
  let inventario: jasmine.SpyObj<InventarioService>;
  let avisos: jasmine.Spy;
  let deshacer: Subject<void>;

  const bicarbonato = { articulo_id: 12, codigo: '9102', descripcion: 'BICARBONATO', stock_actual: 20, stock_minimo: 80 };
  const glicerina = { articulo_id: 13, codigo: '9103', descripcion: 'GLICERINA', stock_actual: 5, stock_minimo: 30 };

  beforeEach(() => {
    inventario = jasmine.createSpyObj<InventarioService>('InventarioService',
      ['ignorarAlerta', 'reactivarAlerta', 'getAlertasStockCritico']);
    inventario.ignorarAlerta.and.returnValue(of({}));
    inventario.reactivarAlerta.and.returnValue(of({}));
    inventario.getAlertasStockCritico.and.returnValue(of({ alertas: [bicarbonato, glicerina] }));

    TestBed.configureTestingModule({
      imports: [AlertasComponent],
      providers: [
        provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
        { provide: InventarioService, useValue: inventario },
      ],
    });
    fixture = TestBed.createComponent(AlertasComponent);
    componente = fixture.componentInstance;

    deshacer = new Subject<void>();
    avisos = spyOn((componente as any).snackBar, 'open')
      .and.returnValue({ onAction: () => deshacer.asObservable() } as any);

    componente.alertas = [bicarbonato, glicerina];
    componente.dataSource.data = componente.alertas;
  });

  it('usa el PUT del artículo para marcar solo ese artículo', () => {
    componente.ignorarAlerta(bicarbonato);
    expect(inventario.ignorarAlerta).toHaveBeenCalledOnceWith(12);
  });

  it('quita la alerta de la tabla y avisa con la opción «Deshacer»', () => {
    componente.ignorarAlerta(bicarbonato);

    expect(componente.alertas.map(a => a.codigo)).toEqual(['9103']);
    expect(componente.dataSource.data.map((a: any) => a.codigo)).toEqual(['9103']);
    expect(avisos).toHaveBeenCalledWith('Alerta de "9102" ignorada', 'Deshacer', jasmine.objectContaining({ duration: 5000 }));
  });

  it('«Deshacer» reactiva la alerta y vuelve a cargar la lista', () => {
    componente.ignorarAlerta(bicarbonato);
    expect(inventario.reactivarAlerta).not.toHaveBeenCalled();

    deshacer.next();

    expect(inventario.reactivarAlerta).toHaveBeenCalledOnceWith(12);
    expect(inventario.getAlertasStockCritico).toHaveBeenCalled();
    expect(avisos).toHaveBeenCalledWith('Alerta de "9102" reactivada', 'Cerrar', jasmine.any(Object));
  });

  it('si el backend no deja ignorarla, la alerta sigue en la tabla y se avisa del error', () => {
    inventario.ignorarAlerta.and.returnValue(throwError(() => ({ status: 403 })));

    componente.ignorarAlerta(bicarbonato);

    expect(componente.alertas.map(a => a.codigo)).toEqual(['9102', '9103']);
    expect(avisos).toHaveBeenCalledWith('No se pudo ignorar la alerta.', 'Cerrar', jasmine.objectContaining({ panelClass: 'snack-error' }));
  });

  it('con la lista de ignoradas abierta, la actualiza al ignorar otra', () => {
    componente.mostrarIgnoradas = true;
    inventario.getAlertasStockCritico.and.returnValue(of({ alertas: [{ ...bicarbonato, alerta_ignorada: true }, glicerina] }));

    componente.ignorarAlerta(bicarbonato);

    expect(inventario.getAlertasStockCritico).toHaveBeenCalledWith(true);
    expect(componente.ignoradas.map(a => a.codigo)).toEqual(['9102']);
  });

  it('«Reactivar» la saca de las ignoradas', () => {
    componente.ignoradas = [{ ...bicarbonato, alerta_ignorada: true }];

    componente.reactivarAlerta(bicarbonato);

    expect(inventario.reactivarAlerta).toHaveBeenCalledOnceWith(12);
    expect(componente.ignoradas).toEqual([]);
  });

  it('si no puede reactivarla, la deja en ignoradas y avisa', () => {
    inventario.reactivarAlerta.and.returnValue(throwError(() => ({ status: 500 })));
    componente.ignoradas = [{ ...bicarbonato, alerta_ignorada: true }];

    componente.reactivarAlerta(bicarbonato);

    expect(componente.ignoradas.length).toBe(1);
    expect(avisos).toHaveBeenCalledWith('No se pudo reactivar la alerta.', 'Cerrar', jasmine.any(Object));
  });
});