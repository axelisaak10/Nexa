'use client';

export default function SplashScreen({ message = 'Cargando Nexa...' }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#0F0E0D',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
      role="status"
      aria-label="Cargando aplicación Nexa"
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '6px', color: '#C85A2A', marginBottom: '16px' }}>
          NEXA
        </h1>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(200, 90, 42, 0.2)', borderTop: '3px solid #C85A2A', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }}></div>
        <p style={{ fontSize: '1rem', color: '#A0988E', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {message}
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
