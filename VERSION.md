# 📌 Nexa — Documento de Versionamiento y Control de Releases (`VERSION.md`)

Este documento establece la estrategia formal de versionamiento, las convenciones de etiquetas de Git (**Git Tags**), el flujo de trabajo en ramas y el historial de cambios (**Changelog**) para el ecosistema **Nexa** (Web PWA, Mobile & Wearable).

---

## 🏷️ Versión Actual del Ecosistema

| Componente | Versión Actual | Estado |
|---|---|---|
| **Ecosistema Global Nexa** | `v1.0.0` | **Production Ready / Entregable DE.1 - DE.4** |
| **Web PWA (Next.js)** | `1.0.0` | Estable (`package.json`) |
| **Mobile App (Flutter)** | `1.0.0+1` | Estable (`flutter_wearable/pubspec.yaml`) |
| **Wearable App (Smartwatch)** | `1.0.0+1` | Estable (`flutter_wearable/pubspec.yaml`) |

---

## 📐 Esquema de Versionamiento: Semantic Versioning (SemVer 2.0.0)

Nexa sigue la especificación de **Versionado Semántico (SemVer)** con la estructura `MAJOR.MINOR.PATCH`:

$$\text{Versión} = \text{MAJOR} . \text{MINOR} . \text{PATCH}$$

- **MAJOR (X.0.0):** Cambios incompatibles en la API REST, refactorizaciones estructurales de la base de datos Supabase o cambios que rompen retrocompatibilidad con las apps móviles/wearables.
- **MINOR (0.X.0):** Incorporación de nuevas funcionalidades que mantienen compatibilidad hacia atrás (ej. nuevos módulos de estadísticas, integración PayPal, soporte BLE).
- **PATCH (0.0.X):** Corrección de errores (bugfixes), optimizaciones de rendimiento Lighthouse, parches de seguridad o ajustes de linter/CI.

---

## 🌿 Estrategia de Ramas en Git (Git Flow simplificado)

- **`main`**: Contiene exclusivamente código listo para producción. Toda subida a `main` requiere pasar los cheques del pipeline de **GitHub Actions** (`ci.yml`).
- **`feature/<nombre>`**: Ramas temporales para desarrollo de nuevas características (ej. `feature/estadisticas-interactive`).
- **`fix/<nombre>`** o **`hotfix/<nombre>`**: Ramas para resolución de errores urgentes o fallos detectados en auditorías.
- **`release/vX.Y.Z`**: Rama previa al despliegue oficial para congelamiento de código y pruebas de QA/Lighthouse.

---

## 📝 Convención de Commits (Conventional Commits)

Los mensajes de confirmación en Git deben seguir el formato:

```text
<tipo>(<alcance opcional>): <descripción corta en imperativo>
```

### Tipos Permitidos:
- `feat`: Nueva característica (ej. `feat: agregar estadísticas interactivas de ventas`).
- `fix`: Corrección de un error (ej. `fix: corregir advertencia de ESLint set-state-in-effect`).
- `docs`: Cambios en documentación (ej. `docs: añadir documento VERSION.md para Git`).
- `style`: Formateo de código sin cambio en lógica (CSS, indentación).
- `refactor`: Refactorización de código existente sin añadir funciones ni reparar bugs.
- `test`: Adición o modificación de pruebas (ej. `test: agregar suite de pruebas auditables`).
- `chore`: Tareas de mantenimiento, actualización de paquetes o configuración del pipeline CI/CD.

---

## 🏷️ Guía para Crear Etiquetas de Versión (Git Tags)

Cada release oficial en el repositorio debe ir acompañado de una etiqueta firmada o anotada en Git:

```bash
# 1. Asegurarse de estar en la rama main actualizada
git checkout main
git pull origin main

# 2. Crear etiqueta anotada de la versión
git tag -a v1.0.0 -m "Release Oficial Nexa v1.0.0 - Entregable Ecosistema Completo PWA & Wearable"

# 3. Enviar la etiqueta a GitHub
git push origin v1.0.0

# 4. (Opcional) Listar todas las etiquetas existentes
git tag -l -n
```

---

## 📜 Historial de Cambios (Changelog)

### 🚀 `[v1.0.0]` — 2026-08-13 (Release Estable DE.1 - DE.4)
- **Feat (Web PWA):** Módulo de Estadísticas Interactivas con gráficos interactivos y mapa geográfico de envíos.
- **Feat (Seguridad & Auth):** Migración completa de autenticación a HTTP Cookies y Supabase SSR.
- **Test:** Incorporación de suite de pruebas auditables ante fallos (`scripts/audit_failure_tests.js`).
- **CI/CD:** Automatización de verificación y compilación de Next.js mediante GitHub Actions (`.github/workflows/ci.yml`).
- **Mobile & Wearable:** Interfaz circular para Smartwatch con lectura BLE NOTIFY y sincronización REST.
- **Lighthouse:** Calificaciones verificadas (Performance: 94, A11y: 98, Best Practices: 96, SEO: 100).

### 🔷 `[v0.2.0]` — 2026-08-10
- **Feat:** Integración de pasarela de pago PayPal (`@paypal/react-paypal-js`).
- **Feat:** Implementación de carrito de compras y gestión de favoritos conectada a Supabase.
- **Fix:** Eliminación de errores de hidratación y correcciones en las políticas de seguridad RLS en base de datos.

### 🔷 `[v0.1.0]` — 2026-08-01
- **Feat:** Estructura base del proyecto Next.js 16 + React 19.
- **Feat:** Proyecto Flutter inicial para wearables en `flutter_wearable`.
- **Docs:** Documentación inicial README, arquitectura y esquemas SQL.

---

## 🔄 Proceso de Incremento de Versión (Bump Workflow)

Al preparar un nuevo release:
1. Actualizar la versión en `package.json`: `"version": "X.Y.Z"`.
2. Actualizar `pubspec.yaml` en `flutter_wearable`: `version: X.Y.Z+build`.
3. Documentar los cambios principales en la sección **Historial de Cambios** de este archivo [`VERSION.md`](file:///c:/Users/axeli/OneDrive/Documentos/React/nexa/VERSION.md).
4. Hacer commit de actualización: `git commit -m "chore(release): bump version to vX.Y.Z"`.
5. Generar el Git Tag `git tag -a vX.Y.Z -m "Release vX.Y.Z"` y realizar `git push origin main --tags`.

---

## ⚖️ Términos y Condiciones de Uso del Software

El uso y distribución de cualquier versión del ecosistema **Nexa** (incluyendo Web PWA, aplicación Flutter Móvil y aplicación Flutter Wearable) está sujeto a las siguientes condiciones:

### 1. Licencia y Ámbito de Uso
- **Propósito Académico y de Evaluación:** El software Nexa ha sido desarrollado como entregable evaluativo para la asignatura *Desarrollo para Dispositivos Inteligentes* (Entregables DE.1 a DE.4).
- **Licencia de Código:** Queda autorizada la revisión, ejecución y auditoría del código fuente por parte del personal docente, evaluadores y desarrolladores autorizados.

### 2. Transacciones y Pasarela de Pago
- **Entorno de Pruebas (Sandbox):** La integración con PayPal (`@paypal/react-paypal-js`) funciona exclusivamente en modo Sandbox / Pruebas. **No se procesan pagos reales ni cobros con dinero genuino.**

### 3. Privacidad y Protección de Datos
- **Almacenamiento de Datos:** La información de usuarios, carrito de compras y favoritos se gestiona de manera cifrada a través de Supabase mediante políticas RLS (Row Level Security) y Cookies de sesión HTTP Only.
- **Tratamiento:** No se comparten ni comercializan datos personales con terceros.

### 4. Limitación de Responsabilidad
- El software se entrega **"TAL CUAL" (AS IS)**, sin garantías implícitas o explícitas más allá de las métricas verificadas en los reportes auditables (`REPORTE_DE_PRUEBAS_Y_LIGHTHOUSE.md`).

---

> 📄 **Documentación Completa:** Para consultar la versión extendida de los Términos y Condiciones de la plataforma, refiérase al documento [`TERMINOS_Y_CONDICIONES.md`](file:///c:/Users/axeli/OneDrive/Documentos/React/nexa/TERMINOS_Y_CONDICIONES.md).

