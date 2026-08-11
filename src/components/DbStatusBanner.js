'use client';
import { useState, useEffect } from 'react';

export default function DbStatusBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Ping a simple public endpoint to check if Supabase is reachable
    const checkDb = async () => {
      try {
        const res = await fetch('/api/categories', { cache: 'no-store' });
        const data = await res.json();
        // If we got mock data (check typical mock response) vs real, show banner
        // We show banner if fetch fails entirely
        setShow(false);
      } catch {
        setShow(true);
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!show) return null;

  return (
    <div className="db-status-banner" role="alert" aria-live="polite">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <span>Modo offline — usando datos locales. Verifica tu conexión.</span>
      <button className="db-status-close" onClick={() => setShow(false)} aria-label="Cerrar">×</button>
    </div>
  );
}
