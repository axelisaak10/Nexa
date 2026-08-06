# Diagnóstico y Corrección: QR Expirado (Iteración 2)

Se ha implementado un sistema de diagnóstico y sincronización más robusto para resolver el problema de la expiración acelerada del código QR.

## Mejoras Realizadas

### 1. Sincronización Servidor-App
Anteriormente, la app confiaba ciegamente en su propio cronómetro interno. Si el servidor de Vercel decidía que el QR expiraba antes, la app se confundía.
- **Cambio**: Ahora, en cada consulta al servidor (cada 2 segundos), la app lee el tiempo restante que el servidor le indica y actualiza el reloj en pantalla. **Si el servidor acorta el tiempo, la app se ajustará automáticamente.**

### 2. Parseo de Datos Seguro
A veces los servidores envían números como texto (`"60"`) o decimales (`60.0`).
- **Cambio**: Se añadió una lógica de conversión robusta para evitar errores al leer los datos de Vercel.

### 3. Diagnóstico en Tiempo Real
Se han añadido logs internos que puedes ver en la consola de Android Studio (Debug Console).
- **Cómo usarlo**: Al iniciar el QR, busca mensajes que empiecen con `NEXA QR:`. Estos te dirán exactamente cuántos segundos está enviando tu servidor de Vercel.

### 4. Estabilidad de la Interfaz
Se añadieron validaciones para asegurar que los procesos de fondo no intenten actualizar la pantalla si el usuario ya se movió a otra sección, evitando errores de "flicker" o cierres inesperados.

## Cómo verificar si el error persiste
1. Abre la **Debug Console** en Android Studio.
2. Inicia el proceso del QR.
3. Si ves que el tiempo salta de (ejemplo) 600 a 60 de golpe, significa que **tu servidor de Vercel está configurado para expirar en 60 segundos**, y deberás ajustar la configuración de tu API.

> [!TIP]
> Si el contador sigue bajando muy rápido pero el log dice que el servidor manda 600s, por favor avísame para revisar si hay algún factor externo (como la batería del reloj o el ahorro de energía) afectando los timers de Flutter.
