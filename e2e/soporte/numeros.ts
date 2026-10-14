/**
 * Convierte en número lo que muestra una celda: «1,250 UNI» → 1250, «53.12» → 53.12.
 * La aplicación usa el formato numérico por defecto de Angular (coma para
 * los miles, punto para los decimales).
 */
export const aNumero = (texto: string): number => Number(texto.replace(/[^\d.-]/g, ''));
