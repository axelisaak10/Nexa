'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nexa-favorites');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexa-favorites', JSON.stringify(favorites));
    } catch {}
  }, [favorites]);

  const toggleFavorite = useCallback((product) => {
    setFavorites(prev => {
      const exists = prev.find(f => f.id_producto === product.id_producto);
      if (exists) return prev.filter(f => f.id_producto !== product.id_producto);
      return [...prev, product];
    });
  }, []);

  const isFavorite = useCallback((id) => {
    return favorites.some(f => f.id_producto === id);
  }, [favorites]);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
