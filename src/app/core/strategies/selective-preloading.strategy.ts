import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

/**
 * Precarga todas las rutas lazy excepto las marcadas con data: { preload: false },
 * usado en rutas admin-only para no descargar ese código a usuarios sin ese rol.
 */
@Injectable({ providedIn: 'root' })
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    return route.data?.['preload'] === false ? of(null) : load();
  }
}
