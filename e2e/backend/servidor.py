"""
Prepara y arranca el backend de pruebas. Lo lanza Playwright (webServer en
playwright.config.ts); también se puede ejecutar a mano:

    python e2e/backend/servidor.py            (desde la carpeta del frontend)

En cada arranque:
  1. borra la base SQLite y los correos de la ejecución anterior,
  2. aplica las migraciones del proyecto sobre la base nueva,
  3. crea los usuarios de prueba (uno o más por rol),
  4. levanta el servidor en 127.0.0.1:8000.

Variables de entorno:
  BACKEND_DIR   carpeta del backend (por defecto la busca junto al frontend
                o un nivel más arriba)
  E2E_TMP       carpeta temporal    (por defecto e2e/.tmp)
  E2E_PUERTO    puerto del backend  (por defecto 8000: es el que usa el frontend)
"""
import json
import os
import shutil
import socket
import sys
import warnings
from pathlib import Path

# Avisos de las librerías que no tienen que ver con las pruebas.
warnings.filterwarnings('ignore', category=UserWarning)
# Sin archivos .pyc: no deja carpetas __pycache__ dentro del frontend.
sys.dont_write_bytecode = True

AQUI = Path(__file__).resolve().parent
FRONTEND = AQUI.parent.parent


def buscar_backend() -> Path:
    """BACKEND_DIR o la primera carpeta conocida que tenga manage.py."""
    if os.environ.get('BACKEND_DIR'):
        return Path(os.environ['BACKEND_DIR']).resolve()
    candidatos = [
        FRONTEND.parent / 'Comercia_Chemical_Backend',
        FRONTEND.parent.parent / 'Comercia_Chemical_Backend',
        FRONTEND.parent / 'Comercial_Chemical_Backend',
        FRONTEND.parent.parent / 'Comercial_Chemical_Backend',
    ]
    return next((c.resolve() for c in candidatos if (c / 'manage.py').is_file()), candidatos[0].resolve())


BACKEND = buscar_backend()
TEMPORAL = Path(os.environ.get('E2E_TMP') or AQUI.parent / '.tmp').resolve()
PUERTO = os.environ.get('E2E_PUERTO', '8000')

if not (BACKEND / 'manage.py').is_file():
    sys.exit(
        f'No se encontró el backend en "{BACKEND}".\n'
        'Indica su carpeta con la variable de entorno BACKEND_DIR.'
    )


def puerto_ocupado() -> bool:
    for direccion in ('127.0.0.1', '::1'):
        familia = socket.AF_INET6 if ':' in direccion else socket.AF_INET
        try:
            with socket.socket(familia, socket.SOCK_STREAM) as conexion:
                conexion.settimeout(1)
                if conexion.connect_ex((direccion, int(PUERTO))) == 0:
                    return True
        except OSError:
            continue
    return False


# Si ya hay un servidor en el puerto (lo normal: el runserver de trabajo), no
# se arranca otro encima: las pruebas acabarían hablando con el equivocado.
if __name__ == '__main__' and puerto_ocupado():
    sys.exit(
        f'El puerto {PUERTO} ya está en uso. Detén el backend que tengas abierto '
        '("python manage.py runserver") y vuelve a ejecutar las pruebas: '
        'Playwright levanta su propio backend, con una base de datos aparte.'
    )

os.environ['E2E_TMP'] = str(TEMPORAL)
os.environ['DJANGO_SETTINGS_MODULE'] = 'settings_e2e'
sys.path[:0] = [str(AQUI), str(BACKEND)]
os.chdir(BACKEND)


def preparar_base():
    """Base de datos nueva, con roles, permisos por defecto y usuarios de prueba."""
    TEMPORAL.mkdir(parents=True, exist_ok=True)
    for sobrante in TEMPORAL.glob('e2e.sqlite3*'):
        sobrante.unlink()
    shutil.rmtree(TEMPORAL / 'correos', ignore_errors=True)
    (TEMPORAL / 'correos').mkdir()

    import django
    django.setup()

    import bcrypt
    from django.core.management import call_command

    from apps.auth.models import Rol, Usuario
    from apps.auth.modulos import inicializar_permisos

    call_command('migrate', interactive=False, verbosity=0)
    inicializar_permisos()

    # Los usuarios se definen una sola vez, en e2e/datos/usuarios.json, y de
    # ahí los leen tanto este script como las pruebas.
    usuarios = json.loads((AQUI.parent / 'datos' / 'usuarios.json').read_text(encoding='utf-8'))
    roles = {rol.nombre: rol for rol in Rol.objects.all()}
    for usuario in usuarios.values():
        clave = bcrypt.hashpw(usuario['clave'].encode(), bcrypt.gensalt(rounds=10)).decode()
        Usuario.objects.create(
            nombre_completo=usuario['nombre'],
            email=usuario['correo'],
            password_hash=clave,
            rol=roles[usuario['rol']],
            activo=True,
        )
    print(f'[e2e] Base de pruebas lista en {TEMPORAL / "e2e.sqlite3"} '
          f'({len(usuarios)} usuarios).', flush=True)


if __name__ == '__main__':
    preparar_base()
    from django.core.management import execute_from_command_line
    execute_from_command_line(['manage.py', 'runserver', f'127.0.0.1:{PUERTO}', '--noreload'])
