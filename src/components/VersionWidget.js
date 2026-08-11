'use client';
import { useState, useEffect } from 'react';

export default function VersionWidget() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersion = async () => {
      setLoading(true);
      try {
        // Try Vercel environment variables first (exposed at build time)
        const sha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
        const ref = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
        const msg = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE;
        if (sha) {
          setInfo({ sha: sha.slice(0, 7), branch: ref || 'main', message: msg || 'Deploy', source: 'vercel', date: new Date().toLocaleDateString('es-MX') });
          setLoading(false);
          return;
        }
        // Fallback: GitHub public API
        const res = await fetch('https://api.github.com/repos/axelisaak10/Nexa/commits/main', {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        if (res.ok) {
          const data = await res.json();
          setInfo({
            sha: data.sha?.slice(0, 7),
            branch: 'main',
            message: data.commit?.message?.split('\n')[0],
            date: new Date(data.commit?.author?.date).toLocaleDateString('es-MX'),
            source: 'github'
          });
        } else {
          setInfo({ sha: 'local', branch: 'dev', message: 'Entorno local', date: new Date().toLocaleDateString('es-MX'), source: 'local' });
        }
      } catch {
        setInfo({ sha: 'local', branch: 'dev', message: 'Entorno local', date: new Date().toLocaleDateString('es-MX'), source: 'local' });
      }
      setLoading(false);
    };
    fetchVersion();
  }, []);

  if (loading) return <div className="version-widget version-widget-loading"><div className="spinner-sm" />Cargando versión...</div>;

  return (
    <div className="version-widget">
      <div className="version-widget-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span>Versión Desplegada</span>
        <span className={`version-source-badge ${info?.source}`}>{info?.source?.toUpperCase()}</span>
      </div>
      <div className="version-widget-body">
        <div className="version-row">
          <span className="version-label">Commit</span>
          <code className="version-sha">{info?.sha || 'N/A'}</code>
        </div>
        <div className="version-row">
          <span className="version-label">Rama</span>
          <span className="version-value">{info?.branch}</span>
        </div>
        <div className="version-row">
          <span className="version-label">Mensaje</span>
          <span className="version-value version-message">{info?.message}</span>
        </div>
        <div className="version-row">
          <span className="version-label">Fecha</span>
          <span className="version-value">{info?.date}</span>
        </div>
      </div>
    </div>
  );
}
