'use client';

import { useState, useEffect } from 'react';

export default function DiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if user already saw or closed the popup in this session
    const dismissed = sessionStorage.getItem('nexa-discount-dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('nexa-discount-dismissed', 'true');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText('NEXA15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCopyCode();
  };

  if (!isOpen) return null;

  return (
    <div className="discount-popup-overlay" onClick={handleClose} id="discount-popup-overlay">
      <div
        className="discount-popup-card"
        onClick={(e) => e.stopPropagation()}
        id="discount-popup-card"
      >
        <button
          className="discount-popup-close"
          onClick={handleClose}
          aria-label="Cerrar aviso"
          id="close-discount-popup"
        >
          ✕
        </button>
        <span className="discount-popup-tag">OFERTA DE BIENVENIDA</span>
        <h2 className="discount-popup-title">15% DE DESCUENTO</h2>
        <p className="discount-popup-text">
          Obtén un 15% de descuento en tu primer pedido de objetos y diseño para el hogar.
        </p>

        <div className="discount-code-box">
          <span className="discount-code-label">Tu código de cupón:</span>
          <div className="discount-code-wrapper">
            <span className="discount-code">NEXA15</span>
            <button className="discount-copy-btn" onClick={handleCopyCode}>
              {copied ? '¡COPIADO!' : 'COPIAR'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="discount-popup-form">
          <input
            type="email"
            className="discount-popup-input"
            placeholder="Tu correo electrónico..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="discount-popup-submit">
            RECLAMAR 15% OFF
          </button>
        </form>

        <button className="discount-popup-skip" onClick={handleClose}>
          No gracias, prefiero pagar precio completo
        </button>
      </div>
    </div>
  );
}
