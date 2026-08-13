'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setForm({ nombre: '', email: '', mensaje: '' });
      } else {
        setError(data.error || 'Error al enviar el mensaje');
      }
    } catch (e) {
      setError('Error de conexión. Inténtalo nuevamente.');
    }
    setLoading(false);
  };

  return (
    <div className="contact-page container section-padding" id="contact-page">
      <div className="contact-header text-center" style={{ marginBottom: '48px' }}>
        <span className="hero-label">ATENCIÓN AL CLIENTE</span>
        <h1 className="contact-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '2.8rem', marginTop: '8px' }}>
          Ponte en Contacto
        </h1>
        <p className="contact-subtitle" style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '12px auto 0 auto' }}>
          ¿Tienes preguntas sobre nuestras piezas, materiales o creadores? Nos encantaría escucharte y atenderte.
        </p>
      </div>

      <div className="contact-grid-layout">
        {/* Columna Izquierda: Formulario de Contacto */}
        <div className="contact-form-box">
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '24px' }}>
            Envíanos un mensaje
          </h2>

          {success ? (
            <div className="contact-success" id="contact-success" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.5" style={{ margin: '0 auto 16px auto' }}>
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '8px' }}>¡Mensaje enviado con éxito!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Nos pondremos en contacto contigo en menos de 24 horas.</p>
              <button onClick={() => setSuccess(false)} className="btn-primary">
                ENVIAR OTRO MENSAJE
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error-banner">{error}</div>}
              
              <div className="checkout-form-group" style={{ marginBottom: '20px' }}>
                <label className="auth-label" htmlFor="contact-name">Nombre Completo</label>
                <input
                  className="auth-input"
                  type="text"
                  id="contact-name"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="checkout-form-group" style={{ marginBottom: '20px' }}>
                <label className="auth-label" htmlFor="contact-email">Correo Electrónico</label>
                <input
                  className="auth-input"
                  type="email"
                  id="contact-email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@ejemplo.com"
                  required
                />
              </div>

              <div className="checkout-form-group" style={{ marginBottom: '24px' }}>
                <label className="auth-label" htmlFor="contact-message">Mensaje</label>
                <textarea
                  className="auth-input"
                  id="contact-message"
                  name="mensaje"
                  value={form.mensaje}
                  onChange={handleChange}
                  placeholder="¿En qué te podemos ayudar?"
                  required
                  rows={5}
                  style={{ resize: 'vertical', paddingTop: '12px' }}
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading} id="contact-submit">
                {loading ? 'ENVIANDO MENSAJE...' : 'ENVIAR MENSAJE'}
              </button>
            </form>
          )}
        </div>

        {/* Columna Derecha: Datos de Contacto, Redes Sociales y Mapa de Ubicación */}
        <div className="contact-info-sidebar">
          {/* Datos de contacto (Elemento 8) */}
          <div className="contact-info-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '20px' }}>Información de Contacto</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginTop: '2px' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>DIRECCIÓN</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>Av. Paseo de la Reforma 402, Juárez, CDMX</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginTop: '2px' }}>
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>TELÉFONO</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>+52 (55) 8432-9000</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" style={{ marginTop: '2px' }}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>CORREO ELECTRÓNICO</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>contacto@nexa.com</span>
                </div>
              </div>
            </div>

            {/* Botones de Redes Sociales (Elemento 9) */}
            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #E5DCD0' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '12px' }}>SÍGUENOS EN REDES</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F8F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }} title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F8F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }} title="Pinterest">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 4.17 2.56 7.74 6.19 9.22-.09-.78-.17-1.98.04-2.83.19-.77 1.22-5.17 1.22-5.17s-.31-.62-.31-1.54c0-1.45.84-2.53 1.89-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.89 1.54 1.89 1.85 0 3.27-1.95 3.27-4.76 0-2.49-1.79-4.23-4.34-4.23-2.96 0-4.7 2.22-4.7 4.52 0 .89.34 1.85.77 2.37.08.1.1.19.07.31-.08.33-.26 1.05-.3 1.19-.05.21-.17.26-.39.16-1.46-.68-2.37-2.82-2.37-4.54 0-3.69 2.68-7.08 7.73-7.08 4.06 0 7.21 2.89 7.21 6.75 0 4.03-2.54 7.27-6.07 7.27-1.18 0-2.3-.61-2.68-1.34l-.73 2.78c-.26 1.01-.97 2.27-1.45 3.04C9.57 21.82 10.76 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                </a>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F8F5F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }} title="WhatsApp">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Mapa de Ubicación Interactivo de Tienda */}
          <div className="contact-map-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', overflow: 'hidden' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '4px' }}>
              UBICACIÓN DE TIENDA Y SHOWROOM (Paseo de la Reforma, CDMX)
            </span>
            <div style={{ position: 'relative', width: '100%', height: '240px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <iframe
                title="Mapa Showroom Nexa Reforma CDMX"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-99.1750%2C19.4200%2C-99.1600%2C19.4350&amp;layer=mapnik&amp;marker=19.4270%2C-99.1676"
              />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              <span>📍 Av. Paseo de la Reforma 402, Juárez, CDMX</span>
              <a 
                href="https://www.openstreetmap.org/?mlat=19.4270&amp;mlon=-99.1676#map=16/19.4270/-99.1676" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}
              >
                Abrir Mapa Completo ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
