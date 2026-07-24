'use client';

import { useEffect, useRef } from 'react';
import { useCart } from '@/context/CartContext';

/**
 * Invisible component that polls /api/watch/cart every 3 seconds.
 * When items are found, it adds them to the web cart.
 * Reads the watch session token from localStorage ('nexa-watch-token').
 */
export default function WatchCartSync() {
  const { addToCart } = useCart();
  const lastSyncRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    const poll = async () => {
      const token = localStorage.getItem('nexa-watch-token');
      if (!token) return;

      try {
        const res = await fetch(`/api/watch/cart?token=${token}&since=${lastSyncRef.current}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          data.items.forEach(item => addToCart(item, item.cantidad || 1));
          lastSyncRef.current = data.lastUpdated;
        }
      } catch {}
    };

    intervalRef.current = setInterval(poll, 3000);
    return () => clearInterval(intervalRef.current);
  }, [addToCart]);

  return null;
}
