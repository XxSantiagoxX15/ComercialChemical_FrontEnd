export const environment = {
  production: true,
  // Vacío = rutas relativas al mismo origen (asume que un reverse proxy
  // enruta /api/... al backend Django). Ajustar si el backend vive en otro host.
  apiUrl: '',
};
