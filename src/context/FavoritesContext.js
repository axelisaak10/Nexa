'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [mounted, setMounted] = useState(false);
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const fetchFavs = async () => {
      try {
        const res = await fetchWithAuth('/api/favorites');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success && Array.isArray(data.favorites) && isMounted) {
            setFavorites(data.favorites);
          }
        }
      } catch (e) {
        console.error('Error fetching favorites from DB:', e);
      } finally {
        if (isMounted) setMounted(true);
      }
    };
    fetchFavs();
    return () => { isMounted = false; };
  }, [user, fetchWithAuth]);

  const toggleFavorite = useCallback(async (product) => {
    if (!user) {
      showToast('Inicia sesión para guardar favoritos en tu cuenta', 'error');
      return;
    }

    const exists = favorites.some(f => f.id_producto === product.id_producto);

    // Optimistic UI update
    setFavorites(prev => {
      if (exists) return prev.filter(f => f.id_producto !== product.id_producto);
      return [...prev, product];
    });

    if (exists) {
      showToast(`Quitado ${product.nombre} de favoritos`, 'info');
    } else {
      showToast(`¡Añadido ${product.nombre} a favoritos! ❤️`, 'success');
    }

    try {
      const res = await fetchWithAuth('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
        }
      }
    } catch (e) {
      console.error('Error syncing favorite to DB:', e);
    }
  }, [user, favorites, showToast, fetchWithAuth]);

  const isFavorite = useCallback((id) => {
    return favorites.some(f => f.id_producto === id);
  }, [favorites]);

  const clearFavorites = useCallback(() => setFavorites([]), []);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites, mounted }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
