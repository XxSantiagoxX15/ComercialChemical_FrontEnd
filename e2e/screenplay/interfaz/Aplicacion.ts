import { Elemento } from './Elemento';

/** Lo que rodea a todas las pantallas: menú lateral, encabezado y avisos. */
export const Aplicacion = {
  opcionesDelMenu: Elemento.llamado('las opciones del menú lateral')
    .ubicadoCon(p => p.locator('aside.sidebar nav.nav-section a.nav-item .nav-text')),

  seccionesDelMenu: Elemento.llamado('los títulos de sección del menú lateral')
    .ubicadoCon(p => p.locator('aside.sidebar nav.nav-section .nav-label')),

  opcionDelMenu: (nombre: string) =>
    Elemento.llamado(`la opción «${nombre}» del menú`)
      .ubicadoCon(p => p.locator('aside.sidebar nav.nav-section a.nav-item')
        .filter({ has: p.getByText(nombre, { exact: true }) })),

  cerrarSesion: Elemento.llamado('la opción «Cerrar sesión» del menú')
    .ubicadoCon(p => p.locator('aside.sidebar a.logout-item')),

  nombreDelUsuario: Elemento.llamado('el nombre del usuario en el encabezado')
    .ubicadoCon(p => p.locator('header.header .user-name')),

  rolDelUsuario: Elemento.llamado('el rol del usuario en el encabezado')
    .ubicadoCon(p => p.locator('header.header .user-role')),

  tituloDeLaPantalla: Elemento.llamado('el título de la pantalla')
    .ubicadoCon(p => p.locator('main.content h1').first()),

  aviso: Elemento.llamado('el aviso emergente')
    .ubicadoCon(p => p.locator('mat-snack-bar-container')),
};
