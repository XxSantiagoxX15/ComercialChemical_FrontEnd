import { Habilidad } from '../nucleo';

export interface Cuenta {
  nombre: string;
  correo: string;
  clave: string;
  rol: string;
}

/**
 * Habilidad de identificarse: el actor conoce su correo y su contraseña.
 * Si la cambia durante la prueba (recuperación de contraseña), la recuerda.
 */
export class TenerUnaCuenta extends Habilidad {
  private constructor(private readonly cuenta: Cuenta) {
    super();
  }

  static con(cuenta: Cuenta): TenerUnaCuenta {
    return new TenerUnaCuenta({ ...cuenta });
  }

  get nombre(): string { return this.cuenta.nombre; }
  get correo(): string { return this.cuenta.correo; }
  get clave(): string { return this.cuenta.clave; }
  get rol(): string { return this.cuenta.rol; }

  cambiaSuClavePor(nueva: string): void {
    this.cuenta.clave = nueva;
  }
}
