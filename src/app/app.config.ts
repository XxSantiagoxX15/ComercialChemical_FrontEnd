import { ApplicationConfig } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { SelectivePreloadingStrategy } from './core/strategies/selective-preloading.strategy';
import { cifradoInterceptor } from './core/interceptors/cifrado.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withPreloading(SelectivePreloadingStrategy)),
    provideHttpClient(withInterceptors([authInterceptor, cifradoInterceptor])),
    provideAnimations(),
  ]
};
