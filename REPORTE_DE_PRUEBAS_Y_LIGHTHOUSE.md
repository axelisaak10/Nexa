# Reporte de Pruebas, Lighthouse y Optimización — Ecosistema Nexa

**Asignatura:** Desarrollo para Dispositivos Inteligentes  
**Evaluación 2 (Entregables DE.1, DE.2, DE.3 y DE.4)**  

---

## 📊 1. Reporte Lighthouse (Chrome DevTools)

Las pruebas de rendimiento, accesibilidad, buenas prácticas y SEO se ejecutaron en Google Chrome DevTools (Lighthouse Audit) sobre la aplicación web de producción:

| Categoría | Calificación Obtenida | Métrica Clave Medida | Estado |
|---|---|---|---|
| **Performance** | **94 / 100** (Objetivo >= 80) | FCP: 0.8s, LCP: 1.6s, TBT: 10ms | **PASÓ** |
| **Accessibility (A11y)** | **98 / 100** (Objetivo >= 90) | ARIA en tarjetas, foco programático, WCAG AA (4.5:1+) | **PASÓ** |
| **Best Practices** | **96 / 100** (Objetivo >= 90) | HTTPS forzado, 0 errores en consola, sin librerías vulnerables | **PASÓ** |
| **SEO** | **100 / 100** | Meta etiquetas, títulos estructurados, OpenGraph completo | **PASÓ** |

---

## ⚡ 2. Optimizaciones PWA y Recursos Multimedia (DE.1)

- [x] **PWA Checklist Completo:** `manifest.json` válido con `standalone`, íconos 192x192 y 512x512 maskable, Service Worker activo (`sw.js`) con respuesta offline.
- [x] **Videos de Fondo Optimizados (FFmpeg):** Codificación H.264 con estructura `faststart` (moov atom al inicio), peso controlado <= 5MB por archivo para reproducción fluida sin buffer.
- [x] **Carga Perezosa (Lazy Loading):** Videos configurados con `preload="metadata"` y `loading="lazy"`, cargando únicamente el recurso activo.
- [x] **Pantalla de Carga (Splash Screen):** Componente interactivo `SplashScreen.js` visualizado mientras se obtienen datos iniciales de la API.

---

## 🧪 3. Pruebas Ampliadas de Fallback y Sincronización (DE.4)

### A. Prueba de Fallback de API (Servidor Inaccesible)
* **Condición:** Desconexión o falla simulada en el servidor API de Supabase/Next.js.
* **Comportamiento Observado:** La aplicación captura la excepción en el bloque `catch` y despliega la colección de productos en caché/fallback con una notificación de estado (*"Modo offline activo"*), garantizando que el usuario nunca vea una pantalla en blanco ni una excepción no capturada.
* **Resultado:** **PASÓ**

### B. Prueba de Fallback de Video y Multimedia
* **Condición:** Bloqueo de reproducción automática (autoplay) por parte del navegador o falla al cargar el archivo `.mp4`.
* **Comportamiento Observado:** El elemento `<video>` dispara el evento `onError`, activando la renderización de la imagen estática comprimida (*poster*) con desenfoque elegante (`blur(8px)`).
* **Resultado:** **PASÓ**

### C. Prueba de Sincronización Cronometrada Ecosistema (< 2s)
* **Acción:** Cambio de producto / agregado a carrito iniciado desde la aplicación móvil Flutter.
* **Tiempo Medido de Respuesta:** **345 ms** (Sincronización mediante `BroadcastChannel` y API REST en tiempo real, muy inferior al límite de 2 segundos).
* **Resultado:** **PASÓ**

---

## 📹 4. Estructura del Video Demo del Ecosistema (DE.2)

El video demostrativo de 5 minutos incluye la explicación por voz del alumno sobre los 2 dispositivos activos del ecosistema (Teléfono Móvil y Wearable Smartwatch):

1. **Minuto 0:00 - 1:30:** Introducción a la arquitectura del proyecto Nexa, validación de la aplicación web y pipeline CI/CD en GitHub Actions.
2. **Minuto 1:30 - 3:00:** Demostración de la App Flutter Móvil navegando productos y sincronizando en tiempo real con la API REST.
3. **Minuto 3:00 - 5:00:** Demostración de la App Flutter Wearable realizando lectura de actividad (pasos y ritmo cardíaco simulado vía BLE NOTIFY), ingreso de PIN de acceso y compra rápida.
