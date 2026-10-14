"""
Buzón de pruebas: en vez de enviar los correos, guarda cada uno en un archivo
JSON dentro de EMAIL_FILE_PATH. Las pruebas leen de ahí el código de
recuperación y el correo de bienvenida.

Antes de guardarlo se construye el mensaje real (message()), igual que haría
el envío por SMTP: si armar el correo fallara —por ejemplo, al incrustar el
logo—, la prueba también falla.
"""
import json
import time
from pathlib import Path

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend


class BuzonEnArchivos(BaseEmailBackend):

    def send_messages(self, mensajes):
        carpeta = Path(settings.EMAIL_FILE_PATH)
        carpeta.mkdir(parents=True, exist_ok=True)
        enviados = 0
        for mensaje in mensajes:
            crudo = mensaje.message().as_bytes()
            html = ''
            for alternativa in getattr(mensaje, 'alternatives', None) or []:
                contenido, tipo = alternativa[0], alternativa[1]
                if tipo == 'text/html':
                    html = contenido
            dato = {
                'para': list(mensaje.to),
                'asunto': str(mensaje.subject),
                'texto': str(mensaje.body),
                'html': str(html),
                'con_logo': b'<logo>' in crudo and b'image/png' in crudo,
            }
            nombre = f'{time.time_ns()}-{enviados}.json'
            (carpeta / nombre).write_text(json.dumps(dato, ensure_ascii=False), encoding='utf-8')
            enviados += 1
        return enviados
