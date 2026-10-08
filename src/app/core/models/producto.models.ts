// src/app/core/models/producto.models.ts
export interface Producto {
  id: number;
  codigo?: string;
  descripcion?: string;
  costo_unitario?: number;          // costo base por unidad desde inventario/articulo
  cantidad_existencia?: number;     // stock disponible
  // otros campos de tu esquema si existen
}

export interface PrecioResultado {
  articulo_id?: number;
  config?: string | null;
  base_unit_cost?: string;
  quantity?: number;
  calculated_total?: string;
  final_unit_price?: string;
  final_total_value?: string;
  breakdown?: Record<string, string | number>;
}