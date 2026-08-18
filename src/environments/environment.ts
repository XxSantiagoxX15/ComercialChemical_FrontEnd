export const environment = {
  production: false,
  // Usa el mismo host desde el que se cargó la página (localhost, 127.0.0.1
  // o la IP de la red local) en vez de un valor fijo, así funciona igual
  // accediendo desde este equipo o desde un celular/tablet en la misma red.
  apiUrl: `http://${window.location.hostname}:8000`,
};
