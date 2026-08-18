import { Injectable, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { InventarioService } from './inventario.service';
import { ComprasService } from './compras.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private inventarioSvc = inject(InventarioService);
  private comprasSvc = inject(ComprasService);

  // Cache básico para no recargar en cada navegación
  private _cache: any = null;

  loadData() {
    if (this._cache) {
      return of(this._cache);
    }
    return forkJoin({
      articulos: this.inventarioSvc.getArticulos({ limit: 1 }).pipe(catchError(() => of(null))),
      alertas: this.inventarioSvc.getAlertasStockCritico().pipe(catchError(() => of(null))),
      ordenes: this.comprasSvc.getOrdenes({ estado: 'pendiente' }).pipe(catchError(() => of(null))),
    }).pipe(
      tap(data => { this._cache = data; })
    );
  }

  clearCache() {
    this._cache = null;
  }
}
