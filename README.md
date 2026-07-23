# Nexa — Ecosistema Web, Mobile & Wearable

[![CI/CD Quality & Build Pipeline](https://github.com/axelisaak10/Nexa/actions/workflows/ci.yml/badge.svg)](https://github.com/axelisaak10/Nexa/actions/workflows/ci.yml)

**Asignatura:** Desarrollo para Dispositivos Inteligentes  
**Evaluación 2 (Entregables DE.1, DE.2, DE.3, DE.4)**  

---

## ⚡ Calificaciones Lighthouse & Optimización PWA

| Métrica | Puntaje | Detalles de Optimización |
|---|---|---|
| **Performance** | **94 / 100** | FCP 0.8s, LCP 1.6s, TBT 10ms, videos optimizados con H.264 faststart <= 5MB. |
| **Accessibility (A11y)** | **98 / 100** | Etiquetas ARIA completas, foco programático y contraste verificado WCAG AA. |
| **Best Practices** | **96 / 100** | HTTPS, 0 errores en consola, dependencias seguras sin vulnerabilidades. |
| **SEO** | **100 / 100** | Meta tags descriptivos, OpenGraph y jerarquía semántica estructurada. |

---

## 🚀 Arquitectura del Ecosistema (Móvil & Wearable)

El proyecto Nexa integra un ecosistema multiplataforma compuesto por:

1. **Aplicación Web Progresiva (PWA):** Interfaz web completa con Service Worker (`sw.js`), manifiesto PWA (`manifest.json`), pantalla de carga interactiva (`SplashScreen.js`) y soporte offline.
2. **Aplicación Móvil Flutter:** Interfaz para teléfono que consulta el catálogo y pedidos desde la API REST en tiempo real.
3. **Aplicación Flutter Wearable:** Interfaz circular para smartwatch con autenticación por PIN, compra rápida y datos de actividad vía BLE NOTIFY.

---

## 🔄 Pipeline CI/CD en GitHub Actions

El archivo `.github/workflows/ci.yml` automatiza la integración continua en cada `push` o `pull_request` a la rama `main`:

* **Jobs Ejecutados:**
  1. `actions/checkout@v4` y `actions/setup-node@v4` (Node 20).
  2. `npm ci` (Instalación limpia de dependencias).
  3. `npm run lint` (Verificación estricta de sintaxis con ESLint).
  4. `npm run build` (Compilación de producción Next.js).
* **Secretos de GitHub (Secrets):** `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` configurados de forma segura en **Settings -> Secrets and variables -> Actions**.

---

## 🛠️ Instrucciones de Ejecución de los Proyectos

### 1. Aplicación Web PWA (Next.js)

```bash
# Instalación de dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Abrir en el navegador: http://localhost:3000
```

### 2. Aplicación Móvil & Wearable (Flutter)

```bash
cd flutter_wearable
flutter pub get
flutter run -d chrome # Móvil o emulador
```

---

## 📄 Documentación Adicional

* 📊 [Reporte de Pruebas y Lighthouse](file:///c:/Users/USER/Documents/WEB/Nexa/REPORTE_DE_PRUEBAS_Y_LIGHTHOUSE.md)
* 🛡️ [Documentación de Seguridad](file:///c:/Users/USER/Documents/WEB/Nexa/DOCUMENTACION_SEGURIDAD.md)
