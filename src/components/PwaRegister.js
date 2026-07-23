'use client';

import { useEffect } from 'react';

export default function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('[SW] Service Worker registrado:', reg.scope))
          .catch((err) => console.error('[SW] Error al registrar Service Worker:', err));
      });
    }
  }, []);

  return null;
}
