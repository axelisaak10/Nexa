# Documentación de Seguridad — Ecosistema Nexa (PWA Smart TV, Flutter Mobile & Wearable)

**Asignatura:** Desarrollo para Dispositivos Inteligentes  
**Evaluación 2 (SA.3 — E2.4)**  

---

## 1. OWASP Mobile Top 10 (2024) — Aplicación al Proyecto Nexa

| # | Riesgo OWASP Mobile Top 10 (2024) | Aplicación Específica al Proyecto Nexa |
|---|----------------------------------|----------------------------------------|
| **M1** | **Uso Inadecuado de Credenciales (Improper Credential Usage)** | Se reemplazó el almacenamiento de contraseñas en texto plano por hashing con `bcryptjs` en el backend y se implementaron tokens de sesión JWT firmados con HMAC-SHA256. |
| **M2** | **Cadena de Suministro Insegura (Inadequate Supply Chain Security)** | Todas las dependencias de Node.js (`package.json`) y paquetes de Flutter (`pubspec.yaml`) han sido auditados con `npm audit` eliminando vulnerabilidades de alto riesgo. |
| **M3** | **Autenticación y Autorización Inadecuadas (Insecure Auth/Authz)** | Las rutas administrativas `/api/admin/*`, `/api/metrics` y `/api/analytics` verifican el token JWT del encabezado `Authorization: Bearer` evitando derivación de privilegios. |
| **M4** | **Validación Insuficiente de Entradas/Salidas (Insufficient Input/Output Validation)** | Toda entrada enviada desde el checkout y formulario de contacto se sanitiza en el backend de Next.js y las consultas a base de datos utilizan binding de parámetros PostgREST previendo SQL Injection. |
| **M5** | **Comunicación Insegura (Insecure Communication)** | La PWA y las aplicaciones móviles fuerzan HTTPS/WSS e imponen políticas de seguridad de contenidos (Content Security Policy - CSP) bloqueando scripts externos no autorizados. |
| **M6** | **Controles de Privacidad Inadecuados (Inadequate Privacy Controls)** | Los datos sensibles de usuarios (nombre, correo, dirección) se aíslan a nivel de usuario en `/api/orders` evitando filtración cruzada de registros (protección IDOR). |
| **M7** | **Protección Binaria Insuficiente (Insufficient Binary Protections)** | El código de producción se compila de forma optimizada y ofuscada para Next.js y Flutter binario, excluyendo mapas de fuente sensibles en producción. |
| **M8** | **Configuración Incorrecta de Seguridad (Security Misconfiguration)** | Las cabeceras de respuesta y meta tags especifican políticas CSP estrictas, desactivando depuradores expuestos y ocultando la versión del servidor. |
| **M9** | **Almacenamiento Inseguro de Datos (Insecure Data Storage)** | Los tokens en cliente se almacenan de forma aislada en `localStorage` / almacenamiento seguro de sesión del dispositivo y nunca en cookies accesibles por scripts de terceros. |
| **M10** | **Criptografía Insuficiente (Insufficient Cryptography)** | Se utilizan algoritmos criptográficos estándar de la industria: HMAC-SHA256 para tokens JWT y Bcrypt con factor de costo 10 para contraseñas de usuario. |

---

## 2. Validación de `event.origin` en BroadcastChannel

Para la comunicación en tiempo real entre la aplicación del teléfono y la PWA Smart TV a través del API `BroadcastChannel`, se implementa la validación obligatoria del origen del mensaje para mitigar ataques XSS o inyección de eventos por pestañas no confiables.

### Implementación en Código (`src/app/tv/page.js`):

```javascript
useEffect(() => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
  const channel = new BroadcastChannel('nexa_ecosystem_sync');

  channel.onmessage = (event) => {
    // Validación estricta del origen del evento (Requisito de seguridad SA.3.2)
    if (event.origin && window.location.origin && event.origin !== window.location.origin) {
      console.warn('[Seguridad] Validación de event.origin fallida. Origen no confiable:', event.origin);
      return;
    }

    console.log('[TV PWA] Mensaje recibido del ecosistema:', event.data);
    if (event.data && event.data.type === 'SELECT_PRODUCT') {
      setFocusedIndex(event.data.index);
      setSelectedIndex(event.data.index);
    }
  };

  return () => channel.close();
}, []);
```

---

## 3. LFPDPPP — Datos Personales Manejados y Base Legal

En cumplimiento con la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP - México)**:

| Dato Personal Recabado | Categoría de Dato | Finalidad del Tratamiento | Base Legal de Tratamiento |
|-----------------------|-------------------|--------------------------|---------------------------|
| **Nombre Completo** | Identificación | Identificar al comprador y personalizar el perfil de usuario. | Consentimiento explícito al registrarse (Art. 8 LFPDPPP). |
| **Correo Electrónico** | Contacto / Autenticación | Inicio de sesión seguro, envío de confirmaciones de compra y comunicación. | Ejecución de contrato de compraventa (Art. 10 Fracc. IV LFPDPPP). |
| **Dirección de Envío** | Localización / Logística | Despacho y entrega física de los productos adquiridos. | Cumplimiento de obligaciones contractuales de compra (Art. 10 LFPDPPP). |
| **Historial de Pedidos** | Transaccional | Consulta de compras pasadas y soporte a clientes. | Interés legítimo y soporte posventa. |

---

## 4. Aviso de Privacidad

**Responsable:** Nexa Comercio Electrónico S.A. de C.V.  
**Domicilio:** Av. Paseo de la Reforma 402, Juárez, Ciudad de México.  
**Contacto:** privacidad@nexa.com  

### Finalidad Primaria
Los datos personales recabados serán utilizados para procesar sus compras en la plataforma Nexa (PWA Smart TV, Aplicación Móvil y Wearable), verificar su identidad, entregar los pedidos en su domicilio y brindarle asistencia técnica.

### Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (**Acceso**). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (**Rectificación**); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (**Cancelación**); así como oponerse al uso de sus datos personales para fines específicos (**Oposición**).

Para ejercer cualquiera de los derechos ARCO, puede enviar una solicitud por escrito al correo `privacidad@nexa.com` o desde la sección "Mi Perfil" en la plataforma.

---

## 5. Plan de Retención y Eliminación de Datos

1. **Datos de Cuenta y Perfil:** Se conservan mientras la cuenta del usuario permanezca activa. Si la cuenta es inactiva por más de 24 meses, se notifica por correo antes de la supresión definitiva.
2. **Historial Transaccional (Pedidos):** Se conserva durante 5 años por motivos fiscales y contables requeridos por las autoridades correspondientes.
3. **Eliminación Segura:** La eliminación de datos personales de la base de datos Supabase se realiza mediante sentencias `DELETE` en cascada (`ON DELETE CASCADE`) y purga de logs del servidor.

---

## 6. Checklist de Seguridad PWA

- [x] **Content Security Policy (CSP):** Meta tag configurado en `layout.js` restringiendo `script-src`, `style-src`, `img-src`, `media-src` y `connect-src`.
- [x] **HTTPS:** Forzado en producción mediante cabeceras de transporte seguro (HSTS) y certificado TLS.
- [x] **Subresource Integrity (SRI):** Recursos externos enlazados cuentan con hashes criptográficos de integridad.
- [x] **Validación de Origen (BroadcastChannel):** Eventos entre pestañas y dispositivos verifican la propiedad `event.origin` antes de procesar payloads.
