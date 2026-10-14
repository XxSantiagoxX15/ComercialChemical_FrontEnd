import { Elemento, FILA_CON_DATOS } from './Elemento';

const VENTANA = 'mat-dialog-container';

export const PantallaDeUsuarios = {
  ruta: '/usuarios',

  permisosPorRol: Elemento.llamado('el botón «Permisos por Rol»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Permisos por Rol' })),

  nuevoUsuario: Elemento.llamado('el botón «Nuevo Usuario»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Nuevo Usuario' })),

  filas: Elemento.llamado('las filas de la tabla de usuarios')
    .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`)),

  filaDe: (correo: string) =>
    Elemento.llamado(`la fila del usuario ${correo}`)
      .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`).filter({ hasText: correo })),

  estadoDe: (correo: string) =>
    Elemento.llamado(`el estado del usuario ${correo}`)
      .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`).filter({ hasText: correo }).locator('.estado-badge')),

  /** El botón de la fila que desactiva al usuario (o lo activa, si está inactivo). */
  activarODesactivarA: (correo: string) =>
    Elemento.llamado(`el botón de activar/desactivar de ${correo}`)
      .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`).filter({ hasText: correo })
        .locator('button').filter({ has: p.locator('mat-icon', { hasText: /^person(_off)?$/ }) })),

  enviarCodigoA: (correo: string) =>
    Elemento.llamado(`el botón «enviar código de restablecimiento» de ${correo}`)
      .ubicadoCon(p => p.locator(`main.content ${FILA_CON_DATOS}`).filter({ hasText: correo })
        .locator('button').filter({ has: p.locator('mat-icon', { hasText: 'lock_reset' }) })),
};

/** Ventana «Nuevo Usuario». */
export const FormularioDeUsuario = {
  ventana: Elemento.llamado('la ventana «Nuevo Usuario»')
    .ubicadoCon(p => p.locator(VENTANA).filter({ hasText: 'Nuevo Usuario' })),

  nombre: Elemento.llamado('el campo Nombre completo')
    .ubicadoCon(p => p.locator(VENTANA).getByLabel('Nombre completo')),

  correo: Elemento.llamado('el campo Correo electrónico')
    .ubicadoCon(p => p.locator(VENTANA).getByLabel('Correo electrónico')),

  rol: Elemento.llamado('la lista de roles')
    .ubicadoCon(p => p.locator(VENTANA).locator('mat-select[formcontrolname="rol_id"]')),

  opcionDeRol: (rol: string) =>
    Elemento.llamado(`el rol «${rol}» de la lista`)
      .ubicadoCon(p => p.getByRole('option', { name: rol, exact: true })),

  clave: Elemento.llamado('el campo Contraseña')
    .ubicadoCon(p => p.locator(VENTANA).getByLabel('Contraseña')),

  crear: Elemento.llamado('el botón «Crear»')
    .ubicadoCon(p => p.locator(VENTANA).getByRole('button', { name: 'Crear' })),

  cancelar: Elemento.llamado('el botón «Cancelar»')
    .ubicadoCon(p => p.locator(VENTANA).getByRole('button', { name: 'Cancelar' })),

  error: Elemento.llamado('el error del formulario de usuario')
    .ubicadoCon(p => p.locator(VENTANA).locator('.error-msg')),
};

/** Ventana «Gestión de Permisos por Rol». */
export const VentanaDePermisos = {
  ventana: Elemento.llamado('la ventana de permisos por rol')
    .ubicadoCon(p => p.locator(VENTANA).filter({ hasText: 'Gestión de Permisos por Rol' })),

  pestanaDelRol: (nombre: string) =>
    Elemento.llamado(`la pestaña del rol «${nombre}»`)
      .ubicadoCon(p => p.locator(VENTANA).getByRole('tab', { name: nombre })),

  /** El interruptor de un módulo en la pestaña que está abierta. */
  interruptorDe: (modulo: string) =>
    Elemento.llamado(`el interruptor del módulo «${modulo}»`)
      .ubicadoCon(p => p.locator(VENTANA).locator('mat-tab-body.mat-mdc-tab-body-active .modulo-row')
        .filter({ has: p.getByText(modulo, { exact: true }) })
        .getByRole('switch')),

  avisoDelAdministrador: Elemento.llamado('el aviso de que el Administrador no se puede modificar')
    .ubicadoCon(p => p.locator(VENTANA).locator('mat-tab-body.mat-mdc-tab-body-active .admin-notice')),

  guardar: Elemento.llamado('el botón «Guardar Cambios»')
    .ubicadoCon(p => p.locator(VENTANA).getByRole('button', { name: 'Guardar Cambios' })),

  cerrar: Elemento.llamado('el botón «Cerrar» de la ventana de permisos')
    .ubicadoCon(p => p.locator(VENTANA).locator('mat-dialog-actions').getByRole('button', { name: 'Cerrar' })),

  error: Elemento.llamado('el error de la ventana de permisos')
    .ubicadoCon(p => p.locator(VENTANA).locator('.error-banner')),
};
