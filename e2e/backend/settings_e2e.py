"""
Configuración del backend SOLO para las pruebas de punta a punta (Playwright).

No se copia al backend: vive en el frontend (e2e/backend) y se carga con
DJANGO_SETTINGS_MODULE=settings_e2e. Parte de la configuración real del
proyecto y cambia únicamente lo necesario para que las pruebas:

  * NO toquen la base de datos de trabajo  → SQLite propia en e2e/.tmp
  * NO envíen correos de verdad            → se guardan como archivos
  * no choquen con el límite de peticiones → límites muy altos

El cifrado de la API se deja ENCENDIDO: las pruebas usan la aplicación igual
que una persona, con el canal cifrado funcionando.
"""
import os
from pathlib import Path

from config.settings import *   # noqa: F401,F403
from config.settings import REST_FRAMEWORK as _REST_BASE

CARPETA_TEMPORAL = Path(os.environ['E2E_TMP'])

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': str(CARPETA_TEMPORAL / 'e2e.sqlite3'),
    }
}

# Cada correo queda en un archivo dentro de esta carpeta (ver buzon_e2e.py).
# De ahí leen las pruebas el código de recuperación y el correo de bienvenida.
EMAIL_BACKEND = 'buzon_e2e.BuzonEnArchivos'
EMAIL_FILE_PATH = str(CARPETA_TEMPORAL / 'correos')
FRONTEND_URL = os.environ.get('E2E_FRONTEND_URL', 'http://localhost:4200')

REST_FRAMEWORK = {
    **_REST_BASE,
    'DEFAULT_THROTTLE_RATES': {
        **_REST_BASE.get('DEFAULT_THROTTLE_RATES', {}),
        'anon': '100000/min',
        'user': '100000/min',
    },
}

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '[::1]']
CIFRADO_ACTIVO = True
BCRYPT_ROUNDS = 10          # el mínimo que acepta el proyecto: logins más rápidos

# El servidor de desarrollo escribe una línea por petición: se silencian para
# que la salida de Playwright muestre solo las pruebas (los errores sí salen).
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'loggers': {
        'django.server': {'level': 'ERROR'},
        'django.request': {'level': 'ERROR'},
    },
}

# Rutas del proyecto + una más (/e2e/estado/) que identifica a este servidor.
ROOT_URLCONF = 'urls_e2e'
