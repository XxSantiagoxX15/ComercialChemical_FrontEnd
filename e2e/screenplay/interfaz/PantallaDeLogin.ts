import { Elemento } from './Elemento';

export const PantallaDeLogin = {
  ruta: '/login',

  titulo: Elemento.llamado('el título «Iniciar sesión»')
    .ubicadoCon(p => p.getByRole('heading', { name: 'Iniciar sesión' })),

  correo: Elemento.llamado('el campo Correo electrónico')
    .ubicadoCon(p => p.locator('input#correo')),

  clave: Elemento.llamado('el campo Contraseña')
    .ubicadoCon(p => p.locator('input#contrasena')),

  ingresar: Elemento.llamado('el botón Ingresar')
    .ubicadoCon(p => p.locator('button.submit-btn')),

  error: Elemento.llamado('el mensaje de error del inicio de sesión')
    .ubicadoCon(p => p.locator('.error-box')),

  erroresDeCampo: Elemento.llamado('los avisos de validación de los campos')
    .ubicadoCon(p => p.locator('.field-error')),

  olvideMiClave: Elemento.llamado('el enlace «¿Olvidaste tu contraseña?»')
    .ubicadoCon(p => p.getByRole('link', { name: '¿Olvidaste tu contraseña?' })),
};
