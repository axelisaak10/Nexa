# Plan de Corrección Integral: QR Expirado (Servidor + BD)

Los logs confirman que el servidor de Vercel está respondiendo con `status: 'expired'` apenas 2 segundos después de crear la sesión. Esto se debe a que la tabla `qr_sessions` no existe en la base de datos Supabase, y el "fallback" de memoria no funciona en entornos serverless como Vercel.

## Análisis de Errores Detectados

1.  **Base de Datos (Supabase)**: El archivo `supabase_schema.sql` no define la tabla `qr_sessions`.
2.  **Backend (Next.js)**: La ruta `api/watch/qr-session` usa un `Map` en memoria que se pierde entre peticiones HTTP en Vercel.
3.  **App (Flutter)**: La aplicación confía ciegamente en el estado `expired` del servidor sin validar si es un error de comunicación o una expiración real por tiempo.

## Cambios Propuestos

### [Componente: Base de Datos]
#### [MODIFY] [supabase_schema.sql](file:///C:/Users/axeli/OneDrive/Documentos/React/nexa/supabase_schema.sql)
*   Añadir la creación de la tabla `qr_sessions`.
*   Configurar políticas de seguridad (RLS) para permitir el acceso desde el reloj y la web.

### [Componente: Backend (Next.js)]
#### [MODIFY] [route.js](file:///C:/Users/axeli/OneDrive/Documentos/React/nexa/src/app/api/watch/qr-session/route.js)
*   Eliminar el uso de `localSessions` (no funciona en Vercel).
*   Mejorar el manejo de errores: si Supabase no está configurado o falla, devolver un error 500 claro en lugar de `expired`.
*   Corregir el cálculo de `ageMs` eliminando `Math.abs` para evitar expiraciones falsas por desincronización de relojes.

### [Componente: App (Flutter)]
#### [MODIFY] [main.dart](file:///C:/Users/axeli/OneDrive/Documentos/React/nexa/flutter_wearable/lib/main.dart)
*   Añadir una pequeña "tolerancia": si el servidor dice `expired` pero el contador local tiene más del 95% del tiempo restante, reintentar la petición antes de mostrar el error.

## Plan de Verificación

1.  **SQL**: Ejecutar el script en la consola de Supabase y verificar que la tabla aparezca.
2.  **API**: Probar el endpoint `POST` y luego `GET` usando una herramienta como Postman o el navegador.
3.  **App**: Reiniciar la app y observar si el estado `pending` se mantiene estable.

> [!CAUTION]
> Es OBLIGATORIO ejecutar el nuevo código SQL en el panel de Supabase después de los cambios, de lo contrario el error persistirá.
