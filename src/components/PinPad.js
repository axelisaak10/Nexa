'use client';
import { useState, useEffect } from 'react';

export default function PinPad({ onComplete, title, subtitle, error, loading, mode = 'verify' }) {
  const [digits, setDigits] = useState([]);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (error) {
      const t1 = setTimeout(() => setShake(true), 0);
      const t2 = setTimeout(() => { setShake(false); setDigits([]); }, 600);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [error]);

  const handleDigit = (d) => {
    if (loading || digits.length >= 4) return;
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 4) {
      setTimeout(() => onComplete(next.join('')), 80);
    }
  };

  const handleBackspace = () => {
    if (loading) return;
    setDigits(prev => prev.slice(0, -1));
  };

  const keys = ['1','2','3','4','5','6','7','8','9','','0','del'];

  return (
    <div className="pin-pad">
      <div className="pin-pad-header">
        {title && <h2 className="pin-pad-title">{title}</h2>}
        {subtitle && <p className="pin-pad-subtitle">{subtitle}</p>}
      </div>
      <div className={`pin-pad-dots ${shake ? 'pin-pad-shake' : ''}`}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`pin-pad-dot ${digits.length > i ? 'filled' : ''}`} />
        ))}
      </div>
      {error && <p className="pin-pad-error">{error}</p>}
      {loading && <p className="pin-pad-loading">Verificando...</p>}
      <div className="pin-pad-grid">
        {keys.map((k, i) => {
          if (k === '') return <div key={i} />;
          if (k === 'del') return (
            <button key={i} className="pin-pad-key pin-pad-del" onClick={handleBackspace} type="button" aria-label="Borrar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                <line x1="18" y1="9" x2="12" y2="15"/>
                <line x1="12" y1="9" x2="18" y2="15"/>
              </svg>
            </button>
          );
          return (
            <button key={i} className="pin-pad-key" onClick={() => handleDigit(k)} type="button">{k}</button>
          );
        })}
      </div>
    </div>
  );
}
