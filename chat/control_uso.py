"""Controles preventivos para AIRI local. No habilitan publicación por internet.

Contadores en memoria: se reinician al reiniciar el proceso; NO son aptos para
varias instancias ni garantizan una cuota compartida en producción.
"""
from collections import deque
from datetime import datetime, timezone
import threading
import time


class ControlUso:
    def __init__(self, por_minuto=5, por_dia=30, global_diario=100, apagado=False,
                 reloj=None, fecha=None):
        if min(por_minuto, por_dia, global_diario) < 1:
            raise ValueError("Los límites deben ser positivos")
        self.por_minuto = por_minuto
        self.por_dia = por_dia
        self.global_diario = global_diario
        self.apagado = apagado
        self._reloj = reloj or time.monotonic
        self._fecha = fecha or (lambda: datetime.now(timezone.utc).date().isoformat())
        self._lock = threading.Lock()
        self._dia = None
        self._global = 0
        self._diarios = {}
        self._minutos = {}

    def admitir(self, cliente):
        """Reserva una consulta de forma atómica; devuelve (permitido, mensaje).

        Se contabilizan intentos admitidos, incluso si Gemini luego falla:
        evita bucles de reintentos. 'cliente' es la IP de conexión real,
        nunca X-Forwarded-For. Uso local exclusivamente.
        """
        with self._lock:
            if self.apagado:
                return False, "El chat está temporalmente desactivado."
            hoy = self._fecha()
            if hoy != self._dia:
                self._dia = hoy
                self._global = 0
                self._diarios.clear()
                self._minutos.clear()
            ahora = self._reloj()
            marcas = self._minutos.setdefault(cliente, deque())
            while marcas and ahora - marcas[0] >= 60:
                marcas.popleft()
            if len(marcas) >= self.por_minuto:
                return False, "Has alcanzado el límite de preguntas por minuto."
            if self._diarios.get(cliente, 0) >= self.por_dia:
                return False, "Has alcanzado el límite diario de preguntas."
            if self._global >= self.global_diario:
                return False, "AIRI alcanzó su límite diario de consultas."
            marcas.append(ahora)
            self._diarios[cliente] = self._diarios.get(cliente, 0) + 1
            self._global += 1
            return True, ""
