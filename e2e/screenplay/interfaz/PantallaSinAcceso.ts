import { Elemento } from './Elemento';

export const PantallaSinAcceso = {
  ruta: '/sin-acceso',

  titulo: Elemento.llamado('el título de la pantalla sin acceso')
    .ubicadoCon(p => p.locator('.sin-acceso h1')),

  logo: Elemento.llamado('el logo de la empresa')
    .ubicadoCon(p => p.locator('.sin-acceso img.logo')),

  volverAComprobar: Elemento.llamado('el botón «Volver a comprobar»')
    .ubicadoCon(p => p.locator('.sin-acceso').getByRole('button', { name: 'Volver a comprobar' })),

  cerrarSesion: Elemento.llamado('el botón «Cerrar sesión» de la pantalla sin acceso')
    .ubicadoCon(p => p.locator('.sin-acceso').getByRole('button', { name: 'Cerrar sesión' })),

  aviso: Elemento.llamado('el aviso «sigue sin módulos»')
    .ubicadoCon(p => p.locator('.sin-acceso .aviso')),
};
