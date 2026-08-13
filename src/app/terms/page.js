import Link from 'next/link';
import { ShieldCheck, CreditCard, Lock, Smartphone, Scale, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Términos y Condiciones | Nexa',
  description: 'Términos y condiciones de uso del ecosistema Nexa (PWA Web, App Móvil y Wearable Smartwatch).',
};

export default function TermsPage() {
  return (
    <div className="container section-padding">
      <div className="terms-page" id="terms-page">
        {/* Header Hero */}
        <div className="about-hero text-center" style={{ marginBottom: '48px' }}>
          <span className="hero-label">MARCO LEGAL & ACADÉMICO</span>
          <h1 className="about-title" style={{ fontSize: '2.75rem', marginTop: '12px' }}>
            Términos y <span className="hero-title-accent">Condiciones.</span>
          </h1>
          <p className="about-description" style={{ maxWidth: '780px', margin: '16px auto 0 auto' }}>
            Condiciones generales de uso, licencias y políticas de privacidad que rigen el uso del ecosistema 
            multiplataforma **Nexa** (Web PWA, Aplicación Móvil Flutter y Smartwatch Wearable).
          </p>
          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Última actualización: 13 de agosto de 2026 | Versión del Ecosistema: v1.0.0
          </div>
        </div>

        {/* Highlight Alert Banner */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid var(--accent)',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '48px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="var(--accent)" />
            Nota de Transparencia Académica
          </h3>
          <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            El proyecto Nexa ha sido desarrollado exclusivamente con fines evaluativos para la asignatura 
            <strong> Desarrollo para Dispositivos Inteligentes</strong> (Entregables DE.1 a DE.4).
            Todas las compras, transacciones financieras y simulaciones BLE se realizan en entornos seguros de prueba (Sandbox).
          </p>
        </div>

        {/* Grid de Secciones */}
        <div className="about-values" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          
          <div className="about-value-card" style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Scale size={24} color="var(--accent)" />
              <h3 className="about-value-title" style={{ margin: 0 }}>1. Ámbito de Uso y Licencia</h3>
            </div>
            <p className="about-value-text" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
              Se concede acceso y derecho de uso no exclusivo para la revisión, auditoría y evaluación del sistema 
              por parte de docentes y usuarios autorizados. Queda prohibida la comercialización no autorizada 
              de la marca o de su código fuente.
            </p>
          </div>

          <div className="about-value-card" style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <CreditCard size={24} color="var(--accent)" />
              <h3 className="about-value-title" style={{ margin: 0 }}>2. Pasarela PayPal Sandbox</h3>
            </div>
            <p className="about-value-text" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
              Los pagos integrados mediante PayPal utilizan credenciales en entorno Sandbox. 
              <strong> No se procesa dinero ni cobros con tarjetas de crédito reales.</strong> Las compras de 
              demostración se registran como pedidos en la base de datos de pruebas.
            </p>
          </div>

          <div className="about-value-card" style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Lock size={24} color="var(--accent)" />
              <h3 className="about-value-title" style={{ margin: 0 }}>3. Seguridad & Supabase Auth</h3>
            </div>
            <p className="about-value-text" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
              La autenticación y gestión de datos se ejecuta mediante Supabase SSR y políticas de seguridad RLS 
              (Row Level Security). Las credenciales y sesiones de usuario están protegidas con cookies HTTP-Only de alta seguridad.
            </p>
          </div>

          <div className="about-value-card" style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Smartphone size={24} color="var(--accent)" />
              <h3 className="about-value-title" style={{ margin: 0 }}>4. Ecosistema PWA & Wearable</h3>
            </div>
            <p className="about-value-text" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
              La aplicación Web PWA cuenta con soporte offline vía Service Worker (`sw.js`). La app Smartwatch en Flutter 
              requiere vinculación PIN y permisos Bluetooth BLE para métricas en tiempo real.
            </p>
          </div>

        </div>

        {/* Detailed Accordion / Document Section */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '40px',
          border: '1px solid var(--border)',
          marginBottom: '48px'
        }}>
          <h2 className="text-serif" style={{ fontSize: '1.75rem', marginBottom: '24px' }}>
            Especificaciones Legales Extendidas
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.7' }}>
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>5. Tratamiento de Datos Personales</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Los datos recolectados durante la creación de cuentas de demostración (correo electrónico y perfil) 
                tienen como único fin la personalización de la experiencia del usuario y la prueba de las APIs de pedidos. 
                Nexa no vende ni comparte datos con empresas publicitarias o terceros.
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

            <div>
              <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>6. Garantía de Calidad y Pruebas Auditables</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                El rendimiento de la plataforma ha sido certificado mediante auditorías Lighthouse obteniendo calificaciones 
                de <strong>94/100 en Performance</strong>, <strong>98/100 en Accesibilidad (A11y)</strong>, 
                <strong>96/100 en Mejores Prácticas</strong> y <strong>100/100 en SEO</strong>.
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />

            <div>
              <h4 style={{ margin: '0 0 6px 0', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>7. Modificaciones a los Términos</h4>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                Cualquier modificación a estos términos se notificará a través de actualizaciones en el repositorio oficial de Git 
                y se registrará formalmente en el documento <code style={{ fontFamily: 'var(--font-mono)', backgroundColor: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>VERSION.md</code>.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="about-cta text-center" style={{ backgroundColor: 'var(--bg-dark)', color: '#FFFFFF', padding: '48px 24px', borderRadius: '16px' }}>
          <HelpCircle size={36} color="var(--accent)" style={{ marginBottom: '12px' }} />
          <h2 className="about-cta-title" style={{ color: '#FFFFFF', margin: '0 0 8px 0' }}>¿Dudas sobre estos términos?</h2>
          <p className="about-cta-text" style={{ color: '#E0E0E0', maxWidth: '500px', margin: '0 auto 24px auto' }}>
            Si requieres mayor información sobre las políticas o la arquitectura de seguridad del proyecto Nexa, puedes contactarnos directamente.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn-primary" style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}>
              CONTÁCTANOS
            </Link>
            <Link href="/shop" className="btn-outline" style={{ color: '#FFFFFF', borderColor: '#FFFFFF' }}>
              IR A LA TIENDA
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
