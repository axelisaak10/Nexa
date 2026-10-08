# Fases 2 y 3 de Nexa

## Funciones implementadas

- Perfil y checkout: botón **Usar mi ubicación**, sugerencia revisable antes de rellenar la dirección y edición manual disponible.
- Perfil: enlaces de seguimiento por pedido, preferencias separadas para alertas de pedidos y promociones, controles de vibración, movimiento y vinculación NFC o código manual.
- `/tracking/<id>`: consulta autenticada cada 10 segundos, recuperación al volver la conexión, hora de la última posición y aviso si supera dos minutos. No inventa posiciones ni datos de reparto.
- Administración: enlace **Seguimiento y ubicación** en cada pedido. Para un pedido **Enviado**, un administrador puede compartir el GPS del teléfono que acompaña la entrega y detenerlo. El navegador debe permanecer abierto. No se ha creado un rol independiente para repartidores.
- Cambios de estado: envío Web Push después de guardar el cambio; guardar otra vez el mismo estado no genera otra alerta. El aviso abre el pedido correspondiente. Los endpoints de suscripción vencidos se eliminan. El historial y el seguimiento funcionan aunque no llegue una alerta.
- NFC: lee registros NDEF con un código temporal de Nexa o una URL del mismo origen `/auth/watch?token=...`. Requiere confirmación y una sesión pendiente de menos de diez minutos. No acepta una identidad de usuario del navegador para asignar el dispositivo.
- Vibración opcional al añadir o quitar productos. El movimiento abre la promoción existente tras varias sacudidas, con un intervalo mínimo de diez segundos. Solo escucha mientras la pantalla de configuración está abierta y la opción está activa. También hay un botón **Ver promociones**. No modifica el carrito ni procesa compras.
- El service worker ya no guarda respuestas privadas ni API en caché.

## Activación del servidor

1. Ejecutar `scripts/mobile_features.sql` en Supabase. Es una migración aditiva; no ejecutar el script original que borra tablas. Las tablas nuevas tienen RLS y acceso reservado al servidor.
2. Configurar en el entorno del servidor:

```dotenv
SUPABASE_SERVICE_ROLE_KEY=<clave privada del proyecto Supabase existente>
GEOCODER_URL=https://<proveedor-compatible-con-Nominatim>/reverse
GEOCODER_API_KEY=<opcional si el proveedor acepta Authorization Bearer>
VAPID_PUBLIC_KEY=<clave pública>
VAPID_PRIVATE_KEY=<clave privada>
VAPID_SUBJECT=mailto:<correo de contacto real>
```

Se conserva `NEXT_PUBLIC_SUPABASE_URL`. No publicar la clave de servicio ni la clave privada VAPID. Generar un par VAPID propio con `npx web-push generate-vapid-keys`, guardarlo en el servidor y reiniciar. El frontend obtiene la clave pública desde una ruta autenticada.

El geocodificador debe aceptar `lat`, `lon`, `format=jsonv2` y `addressdetails=1`, y devolver un objeto `address`. Seleccionar un proveedor cuya capacidad, condiciones y atribución permitan el uso previsto. No hay proveedor público predeterminado ni envío de coordenadas si falta configuración.

Las nuevas rutas responden con error explícito cuando falta configuración o tablas. No sustituyen pedidos reales por datos de ejemplo. Las notificaciones se envían al cambiar el estado desde la API administrativa de Nexa; cambios directos en Supabase o sistemas externos requieren conectar su evento a este flujo. No hay campañas promocionales ni reintentos durables de notificaciones en esta entrega; solo se guardan esas preferencias. Para una operación de mayor volumen, añadir una cola persistente y un trabajador de reintentos.

## Compatibilidad y alcance

Esta implementación corresponde a la PWA Next.js existente. Requiere HTTPS o localhost para las funciones del dispositivo. En iOS, las notificaciones web requieren una instalación compatible en la pantalla de inicio. NFC depende del soporte de Web NFC del navegador y se limita a etiquetas NDEF; no implementa pagos con tarjetas ni wallets. Los pagos NFC quedan pendientes de un proveedor e integración compatibles. Se mantienen los métodos de pago existentes.

La posición compartida es la del administrador que inicia voluntariamente el reparto, no la del comprador. No se comparte en segundo plano con la pantalla cerrada. El mapa usa OpenStreetMap. Al cerrar sesión, se intenta cancelar la suscripción del navegador para evitar avisos de una cuenta anterior.

## Verificación en teléfonos

1. Ubicación: probar permiso denegado, timeout, proveedor ausente, dirección parcial y confirmación de una sugerencia sin perder nombre ni teléfono.
2. Seguimiento: propietario frente a otro usuario; pedido sin ubicación; datos antiguos; pérdida de red y recuperación; cierre de entrega y parada del GPS.
3. Push: activar, guardar preferencias, desactivar y cerrar sesión. Cambiar una vez el estado y comprobar el pedido abierto al tocar la alerta. Repetir el mismo estado y verificar que no se duplica.
4. NFC: etiqueta válida, origen ajeno, código vencido, permiso denegado, cancelación y código manual. Una lectura nunca vincula por sí sola.
5. Movimiento y vibración: alternar controles, caminar sin activaciones, agitar varias veces, botón alternativo y dispositivo sin soporte.

Las pruebas automáticas usan datos aislados; no envían notificaciones ni modifican la base de producción.

### Comprobaciones realizadas

- `npm run build`: compilación de producción correcta.
- `npm run test:mobile`: nueve pruebas correctas sobre validación, acceso a seguimiento, publicación de coordenadas, vencimiento y uso único de códigos, deduplicación de avisos y caché privada.
- ESLint sobre los archivos modificados y nuevos: sin errores.
- `scripts/mobile_browser_check.cjs`: comprobación de navegador a 390 píxeles con datos simulados, permisos denegados, dirección confirmada, NFC simulado y alternativa manual, notificaciones denegadas, promociones, posición antigua, reconexión y cierre de sesión. Usa Playwright disponible en el entorno y una instancia local en el puerto 3100; permite seleccionar un navegador instalado con `PLAYWRIGHT_CHANNEL`.
- Pendiente: credenciales del servidor, ejecución de la migración, envío push real y comprobación en hardware físico. Las pruebas de navegador no acreditan funcionamiento de sensores físicos.

## Referencias de implementación

- Next.js: guías locales de Route Handlers y Progressive Web Apps de la versión instalada.
- [Web NFC NDEFReader](https://developer.mozilla.org/en-US/docs/Web/API/NDEFReader).
- [Geocodificación inversa de Nominatim](https://nominatim.org/release-docs/develop/api/Reverse/).
- [Eventos de movimiento y permisos](https://www.w3.org/TR/orientation-event/).
