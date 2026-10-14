import { Elemento } from './Elemento';

export const PantallaDeRecuperacion = {
  ruta: '/recuperar',

  titulo: Elemento.llamado('el título de la pantalla de recuperación')
    .ubicadoCon(p => p.locator('main.pagina h1')),

  correo: Elemento.llamado('el campo Correo electrónico')
    .ubicadoCon(p => p.locator('main.pagina input#correo')),

  enviarCodigo: Elemento.llamado('el botón «Enviar código»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Enviar código' })),

  guia: Elemento.llamado('la explicación del paso')
    .ubicadoCon(p => p.locator('main.pagina p.guia')),

  codigo: Elemento.llamado('el campo Código')
    .ubicadoCon(p => p.locator('main.pagina input#codigo')),

  claveNueva: Elemento.llamado('el campo Contraseña nueva')
    .ubicadoCon(p => p.locator('main.pagina input#nueva')),

  repetirClave: Elemento.llamado('el campo Repite la contraseña')
    .ubicadoCon(p => p.locator('main.pagina input#confirmar')),

  cambiarClave: Elemento.llamado('el botón «Cambiar contraseña»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Cambiar contraseña' })),

  enviarOtroCodigo: Elemento.llamado('el botón «Enviar otro código»')
    .ubicadoCon(p => p.getByRole('button', { name: 'Enviar otro código' })),

  error: Elemento.llamado('el mensaje de error de la recuperación')
    .ubicadoCon(p => p.locator('main.pagina .mensaje.error')),

  aviso: Elemento.llamado('el aviso de la recuperación')
    .ubicadoCon(p => p.locator('main.pagina .mensaje.aviso')),

  clavesDistintas: Elemento.llamado('el aviso «las contraseñas no son iguales»')
    .ubicadoCon(p => p.locator('main.pagina .campo-error')),

  irAlLogin: Elemento.llamado('el enlace «Ir a iniciar sesión»')
    .ubicadoCon(p => p.getByRole('link', { name: 'Ir a iniciar sesión' })),
};
