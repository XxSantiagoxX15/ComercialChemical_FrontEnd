"""
Rutas del backend de pruebas: las mismas del proyecto y una adicional,
/e2e/estado/, que solo existe aquí. Playwright la consulta antes de empezar
para asegurarse de que en el puerto 8000 está el backend de pruebas y no el de
trabajo (así es imposible que las pruebas modifiquen datos reales).
"""
from django.conf import settings
from django.http import JsonResponse
from django.urls import path

from config.urls import urlpatterns as _rutas_del_proyecto


def estado(_request):
    return JsonResponse({
        'e2e': True,
        'base_de_datos': str(settings.DATABASES['default']['NAME']),
        'cifrado': bool(settings.CIFRADO_ACTIVO),
    })


urlpatterns = [path('e2e/estado/', estado), *_rutas_del_proyecto]
