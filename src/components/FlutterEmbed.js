'use client';
import { useState } from 'react';

export default function FlutterEmbed() {
  const [iframeError, setIframeError] = useState(false);
  const wearableUrl = 'https://nexa-nine-navy.vercel.app/flutter_wearable/web/index.html';

  return (
    <div className="flutter-embed">
      <div className="flutter-embed-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="3"/>
          <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <span>Simulador Wearable</span>
        <a href={wearableUrl} target="_blank" rel="noreferrer" className="flutter-embed-open-btn">
          Abrir en nueva pestaña ↗
        </a>
      </div>
      {iframeError ? (
        <div className="flutter-embed-fallback">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="5" y="2" width="14" height="20" rx="3"/>
            <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <p>El simulador wearable no está disponible en este entorno.</p>
          <p className="flutter-embed-fallback-sub">Ejecuta la app Flutter localmente:</p>
          <code className="flutter-embed-code">cd flutter_wearable && flutter run -d chrome</code>
          <a href={wearableUrl} target="_blank" rel="noreferrer" className="btn-primary flutter-embed-link-btn">
            INTENTAR ABRIR WEARABLE APP ↗
          </a>
        </div>
      ) : (
        <div className="flutter-embed-wrapper">
          <div className="flutter-embed-device-frame">
            <iframe
              src={wearableUrl}
              title="Nexa Wearable App"
              className="flutter-embed-iframe"
              onError={() => setIframeError(true)}
              allow="bluetooth; camera"
            />
          </div>
        </div>
      )}
    </div>
  );
}
