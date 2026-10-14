import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';

import { PermisosRolComponent } from './permisos-rol.component';
import { UsuariosService } from '../../core/services/usuarios.service';

/** Ventana «Permisos por Rol»: el Administrador activa o apaga módulos y guarda. */
describe('PermisosRolComponent (Jasmine)', () => {
  let fixture: ComponentFixture<PermisosRolComponent>;
  let componente: PermisosRolComponent;
  let servicio: jasmine.SpyObj<UsuariosService>;
  let avisos: jasmine.Spy;

  const permisosDelBackend = () => [
    { rol_id: 1, rol_nombre: 'Administrador', permisos: { dashboard: true, usuarios: true } },
    { rol_id: 2, rol_nombre: 'Analista_Inventarios', permisos: { dashboard: true, pronosticos: true, calculadora_precios: false } },
    { rol_id: 3, rol_nombre: 'Responsable_Compras', permisos: { dashboard: true, compras: true } },
  ];

  beforeEach(() => {
    servicio = jasmine.createSpyObj<UsuariosService>('UsuariosService', ['getPermisos', 'actualizarPermisos']);
    // Cada consulta devuelve datos nuevos, como haría el backend.
    servicio.getPermisos.and.callFake(() => of(permisosDelBackend()));
    servicio.actualizarPermisos.and.returnValue(of({ ok: true }));

    TestBed.configureTestingModule({
      imports: [PermisosRolComponent],
      providers: [
        { provide: UsuariosService, useValue: servicio },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) },
      ],
    });
    fixture = TestBed.createComponent(PermisosRolComponent);
    componente = fixture.componentInstance;
    avisos = spyOn((componente as any).snackBar, 'open');
    componente.cargarPermisos();
  });

  const rol = (id: number) => componente.rolesPermisos.find(r => r.rol_id === id);

  it('carga los permisos de los tres roles y empieza sin cambios', () => {
    expect(componente.rolesPermisos.length).toBe(3);
    expect(componente.hasCambios).toBeFalse();
    expect(componente.loading).toBeFalse();
  });

  it('ofrece la calculadora de precios entre los módulos configurables', () => {
    expect(componente.MODULOS.map(m => m.key)).toContain('calculadora_precios');
  });

  it('al mover un interruptor queda un cambio pendiente solo para ese rol', () => {
    componente.onToggle(rol(2), 'calculadora_precios', true);

    expect(componente.hasCambios).toBeTrue();
    expect(componente.pendingChanges.size).toBe(1);
    expect(componente.pendingChanges.get(2)).toEqual(
      { dashboard: true, pronosticos: true, calculadora_precios: true });
    expect(servicio.actualizarPermisos).not.toHaveBeenCalled();   // nada se guarda hasta pulsar Guardar
  });

  it('«Guardar» envía todos los módulos de cada rol modificado, uno por rol', () => {
    componente.onToggle(rol(2), 'pronosticos', false);
    componente.onToggle(rol(3), 'calculadora_precios', true);

    componente.guardarTodo();

    expect(servicio.actualizarPermisos).toHaveBeenCalledTimes(2);
    expect(servicio.actualizarPermisos).toHaveBeenCalledWith(2,
      { dashboard: true, pronosticos: false, calculadora_precios: false });
    expect(servicio.actualizarPermisos).toHaveBeenCalledWith(3,
      { dashboard: true, compras: true, calculadora_precios: true });
    expect(componente.hasCambios).toBeFalse();
    expect(componente.saving).toBeFalse();
    expect(avisos).toHaveBeenCalledWith('Permisos actualizados correctamente', 'Cerrar', jasmine.any(Object));
  });

  it('cambiar dos veces el mismo rol envía una sola petición con el estado final', () => {
    componente.onToggle(rol(2), 'pronosticos', false);
    componente.onToggle(rol(2), 'pronosticos', true);
    componente.guardarTodo();

    expect(servicio.actualizarPermisos).toHaveBeenCalledOnceWith(2,
      { dashboard: true, pronosticos: true, calculadora_precios: false });
  });

  it('sin cambios, «Guardar» no envía nada', () => {
    componente.guardarTodo();
    expect(servicio.actualizarPermisos).not.toHaveBeenCalled();
  });

  it('si el backend rechaza el cambio, muestra su mensaje y conserva lo pendiente para reintentar', () => {
    servicio.actualizarPermisos.and.returnValue(
      throwError(() => ({ status: 400, error: { error: 'Módulos desconocidos: calculadora' } })));
    componente.onToggle(rol(2), 'calculadora_precios', true);

    componente.guardarTodo();

    expect(componente.error).toBe('Módulos desconocidos: calculadora');
    expect(componente.hasCambios).toBeTrue();
    expect(componente.saving).toBeFalse();
    expect(avisos).not.toHaveBeenCalled();
  });

  it('si no puede cargar los permisos, lo dice', () => {
    servicio.getPermisos.and.returnValue(throwError(() => ({ status: 0 })));
    componente.cargarPermisos();
    expect(componente.error).toContain('Error al cargar los permisos');
    expect(componente.loading).toBeFalse();
  });

  it('recargar descarta los cambios sin guardar', () => {
    componente.onToggle(rol(3), 'compras', false);
    componente.cargarPermisos();
    expect(componente.hasCambios).toBeFalse();
    expect(rol(3).permisos.compras).toBeTrue();
  });
});