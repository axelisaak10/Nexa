'use client';
import { useState, useEffect } from 'react';

export default function FlutterEmbed() {
  const [screen, setScreen] = useState('qr'); // 'qr' | 'pin' | 'home'
  const [token, setToken] = useState('NEXA-88A');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate random QR token
  useEffect(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'NX-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setToken(code);
  }, []);

  const handleNumClick = (n) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + n;
      setEnteredPin(next);
      if (next.length === 4) {
        verifyPin(next);
      }
    }
  };

  const handleBackspace = () => {
    setEnteredPin(prev => prev.slice(0, -1));
  };

  const verifyPin = async (pin) => {
    setLoading(true);
    setPinError('');
    setTimeout(() => {
      setLoading(false);
      setScreen('home');
    }, 600);
  };

  return (
    <div className="flutter-embed">
      <div className="flutter-embed-header" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C85A2A" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="3"/>
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <span style={{ color: '#F5F0EB', fontWeight: '600' }}>SIMULADOR INTERACTIVO WEAR OS</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'rgba(245,240,235,0.5)', fontFamily: 'var(--font-mono)' }}>
          Nexa Smartwatch App v2.1
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        {/* Watch Device Chassis */}
        <div style={{
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          border: '12px solid #282420',
          boxShadow: '0 0 0 3px #151311, 0 15px 40px rgba(0,0,0,0.8), inset 0 0 12px rgba(0,0,0,0.8)',
          backgroundColor: '#0F0E0D',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center',
          padding: '24px',
          overflow: 'hidden',
          color: '#F5F0EB',
          userSelect: 'none'
        }}>

          {/* SCREEN 1: QR CODE */}
          {screen === 'qr' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', letterSpacing: '2px', fontWeight: '900', color: '#F5F0EB' }}>N E X A</span>
              <span style={{ fontSize: '0.5rem', letterSpacing: '1px', color: '#B8860B', marginBottom: '8px' }}>ESCANEAR QR / CÓDIGO</span>

              {/* QR Box Visual */}
              <div 
                onClick={() => setScreen('pin')}
                title="Haz clic para simular que escaneaste desde la web"
                style={{
                  width: '90px',
                  height: '90px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(200,90,42,0.3)',
                  transition: 'transform 0.2s'
                }}
              >
                {/* SVG QR Code Simulation */}
                <svg width="78" height="78" viewBox="0 0 24 24" fill="#000">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm9-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm11-2h2v2h-2v-2zm4 0h2v4h-4v-2h2v-2zm-6 4h4v2h-4v-2zm4 2h4v2h-4v-2zm-4 2h2v2h-2v-2z"/>
                </svg>
              </div>

              <div style={{ marginTop: '8px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: '700', color: '#C85A2A' }}>
                {token}
              </div>
              <span style={{ fontSize: '0.55rem', color: 'rgba(245,240,235,0.6)', marginTop: '2px' }}>
                Toca el QR al simular confirmación ➔
              </span>
            </div>
          )}

          {/* SCREEN 2: PIN VERIFY */}
          {screen === 'pin' && (
            <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '0.55rem', letterSpacing: '1.5px', color: '#B8860B', fontWeight: '700' }}>INGRESA TU PIN</span>
              <span style={{ fontSize: '0.5rem', color: 'rgba(245,240,235,0.6)', marginBottom: '6px' }}>PIN de tu registro web</span>

              {/* Dots */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '8px' }}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: enteredPin.length > i ? '#C85A2A' : '#3A342E',
                    border: '1px solid #C85A2A'
                  }} />
                ))}
              </div>

              {loading ? (
                <span style={{ fontSize: '0.6rem', color: '#B8860B' }}>Verificando...</span>
              ) : (
                /* Keypad 3x3 */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 36px)', gap: '4px', justifyContent: 'center' }}>
                  {['1','2','3','4','5','6','7','8','9','C','0','←'].map((k, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (k === 'C') setEnteredPin('');
                        else if (k === '←') handleBackspace();
                        else handleNumClick(k);
                      }}
                      style={{
                        width: '36px',
                        height: '24px',
                        borderRadius: '4px',
                        border: '0.5px solid #3E332A',
                        backgroundColor: '#26201B',
                        color: k === '←' ? '#C85A2A' : '#FFF',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SCREEN 3: HOME WATCH */}
          {screen === 'home' && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(46,125,50,0.2)', color: '#81C784', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '6px' }}>
                ✓
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#F5F0EB' }}>¡Conectado a Nexa!</span>
              <span style={{ fontSize: '0.55rem', color: 'rgba(245,240,235,0.7)', marginTop: '4px', maxWidth: '160px' }}>
                Reloj sincronizado con el carrito de tu cuenta
              </span>
              <button
                onClick={() => setScreen('qr')}
                style={{
                  marginTop: '12px',
                  backgroundColor: '#C85A2A',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#FFF',
                  fontSize: '0.6rem',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                REINICIAR SESIÓN
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
