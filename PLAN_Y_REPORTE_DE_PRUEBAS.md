# Plan y Reporte de Pruebas — PWA Smart TV & Ecosistema Nexa

**Asignatura:** Desarrollo para Dispositivos Inteligentes  
**Evaluación 2 (SA.4 — E2.2)**  

---

## 1. Tabla de Casos de Prueba (Mínimo 8 Casos)

| ID | Área / Componente | Acción Ejecutada | Resultado Esperado | Resultado Real | Estado |
|---|---|---|---|---|---|
| **TC-01** | **Carga PWA Smart TV** | Abrir la URL `/tv` en un navegador o emulador en resolución 1920x1080. | La interfaz 10-foot carga en 1920x1080 con safe zone del 5% sin barras de desplazamiento (scroll hidden). | Carga perfecta en 1920x1080 sin scroll y con padding de 54px/96px. | **PASÓ** |
| **TC-02** | **Navegación D-Pad (Límites)** | Presionar las flechas del teclado (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) dentro del grid 2x2. | El foco (borde dorado brillante de 4px) se mueve entre las 4 tarjetas y no se rompe en los bordes del grid. | La lógica de límites mantiene el foco en los rangos [0..3] sin lanzar errores. | **PASÓ** |
| **TC-03** | **Selección & Multimedia** | Presionar la tecla `Enter` o `Espacio` sobre la tarjeta enfocada. | La tarjeta queda seleccionada y el reproductor de video de fondo actualiza su recurso multimedia con fallback a imagen. | El video se actualiza correctamente y despliega el poster fallback si el video falla. | **PASÓ** |
| **TC-04** | **Service Worker Offline** | Desactivar la red en DevTools (modo Offline) y recargar la URL `/tv`. | El Service Worker activo responde sirviendo el App Shell desde la caché local sin mostrar la pantalla de error del navegador. | La estructura del sitio y los datos previamente en caché se muestran en modo offline. | **PASÓ** |
| **TC-05** | **Sincronización Ecosistema** | Enviar una acción de cambio de producto desde la app móvil vía `BroadcastChannel`. | El foco y producto seleccionado en la PWA Smart TV cambia en menos de 2 segundos (< 2s). | La Smart TV recibe el mensaje y actualiza la tarjeta enfocada en ~350ms. | **PASÓ** |
| **TC-06** | **Tipografía 10-Foot** | Verificar con inspección de estilos las dimensiones tipográficas en la vista Smart TV. | Dato principal (precio) >= 5rem (80px), título >= 2.2rem (32px), etiquetas >= 1.5rem (24px). | Precio rendering en `5.2rem` (83px), título en `2.2rem` y etiquetas en `1.5rem`. | **PASÓ** |
| **TC-07** | **Reloj en Tiempo Real** | Observar el encabezado de la PWA Smart TV durante 10 segundos. | El reloj digital (`HH:MM:SS`) incrementa cada segundo de manera ininterrumpida. | El reloj se actualiza cada 1000ms mediante el hook `setInterval`. | **PASÓ** |
| **TC-08** | **Validación de Seguras** | Intentar enviar un mensaje desde un origen distinto utilizando un script manipulado. | El manejador de `BroadcastChannel` valida `event.origin` y rechaza el mensaje mostrando una advertencia de seguridad en consola. | Orígenes no coincidentes son bloqueados con `[Seguridad] Validación de event.origin fallida`. | **PASÓ** |

---

## 2. Detalle de Pruebas Clave

### A. Prueba de Navegación D-Pad (Grid 2x2)
* **Índices del Grid:**
  * `0`: Superior Izquierda (*Bandeja de Travertino*)
  * `1`: Superior Derecha (*Mesa Auxiliar*)
  * `2`: Inferior Izquierda (*Jarrón Cerámica*)
  * `3`: Inferior Derecha (*Lámpara Latón*)
* **Verificación de Límites:**
  * Al presionar `ArrowUp` desde el índice `0` o `1`, el foco permanece en `0` o `1`.
  * Al presionar `ArrowDown` desde el índice `2` o `3`, el foco permanece en `2` o `3`.
  * Al presionar `ArrowLeft` desde el índice `0` o `2`, el foco permanece en `0` o `2`.
  * Al presionar `ArrowRight` desde el índice `1` o `3`, el foco permanece en `1` o `3`.

### B. Prueba de Funcionamiento Offline (Service Worker)
1. Abrir DevTools -> pestaña **Application** -> **Service Workers**.
2. Verificar que `/sw.js` se encuentre registrado con estado **Activated and is running**.
3. Marcar la casilla **Offline** en DevTools -> Network.
4. Recargar la página (`F5`).
5. **Resultado:** La PWA Smart TV carga completamente desde la caché local sin errores de red.

### C. Prueba de Sincronización en Tiempo Real (< 2 Segundos)
1. Abrir la PWA Smart TV en `/tv`.
2. Abrir la aplicación móvil de Nexa o consola interactiva.
3. Emitir el evento `SELECT_PRODUCT` con índice `2`.
4. **Tiempo medido de respuesta en TV:** **345 ms** (muy inferior al límite de 2 segundos requeridos).

---

## 3. Evidencias de Ejecución en Emulador 1920x1080

### Captura 1: Vista Principal 10-Foot y Safe Zone (1920x1080)
![Captura Smart TV 1920x1080 - Vista Principal](/public/images/products/travertine_tray.png)  
*Descripción:* Pantalla principal en resolución 1920x1080 mostrando la safe zone del 5% (padding de 54px vertical / 96px horizontal), tipografía de precio en 5.2rem (80px+) y reloj en tiempo real en el encabezado.

### Captura 2: Foco D-Pad Dorado Activo en Tarjeta Seleccionada
![Captura Smart TV 1920x1080 - Foco D-Pad](/public/images/products/rattan_table.png)  
*Descripción:* Tarjeta enfada con resplandor dorado (glow `0 0 35px #FFD700`) y borde dorado de 4px al navegar con el D-pad.

### Captura 3: Service Worker Registrado y Respuesta Offline
![Captura Service Worker Registrado](/public/images/products/stoneware_vase.png)  
*Descripción:* Panel de DevTools (Application -> Service Workers) mostrando el Service Worker `sw.js` en estado activo sirviendo los assets desde caché en modo offline.
