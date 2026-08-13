# ⚖️ Términos y Condiciones de Uso — Ecosistema Nexa

**Última actualización:** 13 de Agosto de 2026  
**Versión del Documento:** 1.0.0  
**Proyecto:** Nexa (Web PWA, Mobile & Wearable Ecosystem)  
**Asignatura:** Desarrollo para Dispositivos Inteligentes  

---

## 1. Aceptación de los Términos

Al acceder, navegar, compilar o utilizar cualquier componente del ecosistema **Nexa** (incluyendo la Aplicación Web Progresiva PWA, la Aplicación Móvil Flutter y la Aplicación Wearable para Smartwatch), el usuario y evaluador aceptan de manera implícita los presentes Términos y Condiciones.

---

## 2. Naturaleza y Propósito del Software

- **Entorno Académico:** Nexa es una plataforma desarrollada con fines estrictamente académicos, de demostración técnica y evaluación universitaria.
- **Entregables:** El sistema cumple con las especificaciones técnicas de los entregables **DE.1, DE.2, DE.3 y DE.4**.
- **Prohibición de Uso Comercial no Autorizado:** Este repositorio y su contenido no están destinados a la explotación comercial directa sin previa autorización del autor.

---

## 3. Uso Aceptable y Permisos de Auditoría

1. **Revisión de Código:** Se concede acceso de lectura, clonación y ejecución en entorno local para fines de revisión de código, pruebas de rendimiento (Lighthouse) y auditoría de seguridad.
2. **Restricciones:**
   - No se permite el uso de la infraestructura de Supabase configurada en este proyecto para actividades no relacionadas con la evaluación.
   - Queda prohibido intentar vulnerar los endpoints de la API o alterar los registros auditables.

---

## 4. Pasarela de Pagos y Transacciones Financieras

- **Modo Sandbox:** Todas las transacciones simuladas dentro del módulo de checkout utilizan la API de PayPal en entorno **Sandbox (Pruebas)**.
- **Sin Cargos Reales:** **No se realizan cobros en dinero real**, ni se capturan datos bancarios sensibles ni tarjetas de crédito reales.

---

## 5. Privacidad, Autenticación y Tratamiento de Datos

- **Seguridad en Sesiones:** La autenticación se maneja a través de tokens seguros y cookies HTTP-Only de Supabase Auth, protegiendo las credenciales contra ataques XSS y CSRF.
- **Row Level Security (RLS):** Las tablas en la base de datos están protegidas por políticas RLS, asegurando que cada usuario únicamente pueda consultar y modificar su propio carrito, favoritos y perfil.
- **Almacenamiento Local (Wearable & PWA):** El almacenamiento en el dispositivo (Cache Storage, Service Workers, SharedPreferences) se utiliza únicamente para el funcionamiento offline y sincronización BLE.

---

## 6. Propiedad Intelectual

Todo el código fuente, diseño de interfaz (UI/UX), arquitectura de software, documentación y esquemas de base de datos (`supabase_schema.sql`) son propiedad intelectual del autor del proyecto **Nexa**, salvo por las librerías y frameworks de código abierto utilizados (`Next.js`, `React`, `Flutter`, `@supabase/supabase-js`, `@paypal/react-paypal-js`, `lucide-react`).

---

## 7. Limitación de Responsabilidad y Garantía

El software se entrega **"TAL CUAL" (AS IS)** y **"SEGÚN DISPONIBILIDAD"**:
- No se asume responsabilidad por interrupciones en los servicios de terceros (ej. Supabase Cloud, GitHub Actions, PayPal Sandbox).
- Las métricas de rendimiento (Lighthouse 94+ en Performance, 98+ A11y, 100 SEO) corresponden a las pruebas documentadas en [`REPORTE_DE_PRUEBAS_Y_LIGHTHOUSE.md`](file:///c:/Users/axeli/OneDrive/Documentos/React/nexa/REPORTE_DE_PRUEBAS_Y_LIGHTHOUSE.md).

---

## 8. Modificaciones a los Términos

Cualquier actualización a estos términos se reflejará en este archivo y se mantendrá sincronizada con la versión vigente establecida en [`VERSION.md`](file:///c:/Users/axeli/OneDrive/Documentos/React/nexa/VERSION.md).
