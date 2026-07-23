'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

function SearchBarContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  const [query, setQuery] = useState(currentSearch);

  useEffect(() => {
    Promise.resolve().then(() => {
      setQuery(currentSearch);
    });
  }, [currentSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === currentSearch.trim() && pathname === '/shop') return;

    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }

    const newQueryString = params.toString();
    const newUrl = `/shop${newQueryString ? `?${newQueryString}` : ''}`;
    router.push(newUrl);
  };

  return (
    <div className="search-bar-wrapper">
      <form className="search-bar" onSubmit={handleSubmit} id="search-form" role="search">
        <svg className="search-bar-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-bar-input"
          placeholder="Buscar objetos, materiales, piezas..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar productos"
          id="search-input"
        />
        {query && (
          <button
            type="button"
            className="search-bar-clear"
            onClick={() => {
              setQuery('');
              router.push('/shop');
            }}
            aria-label="Borrar búsqueda"
          >
            ✕
          </button>
        )}
      </form>
    </div>
  );
}

export default function SearchBar() {
  return (
    <Suspense fallback={
      <div className="search-bar-wrapper">
        <div className="search-bar" style={{ opacity: 0.6 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#8B8178' }}>Cargando búsqueda...</span>
        </div>
      </div>
    }>
      <SearchBarContent />
    </Suspense>
  );
}
