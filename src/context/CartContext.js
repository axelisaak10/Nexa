'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();
  const { user, fetchWithAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const fetchCart = async () => {
      try {
        const res = await fetchWithAuth('/api/cart');
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success && Array.isArray(data.items) && isMounted) {
            setItems(data.items);
          }
        }
      } catch (e) {
        console.error('Error fetching cart from DB:', e);
      } finally {
        if (isMounted) setMounted(true);
      }
    };
    fetchCart();
    return () => { isMounted = false; };
  }, [user, fetchWithAuth]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    // Optimistic UI update
    setItems(prev => {
      const existing = prev.find(item => item.id_producto === product.id_producto);
      if (existing) {
        return prev.map(item =>
          item.id_producto === product.id_producto
            ? { ...item, cantidad: item.cantidad + quantity }
            : item
        );
      }
      return [...prev, {
        id_producto: product.id_producto,
        nombre: product.nombre,
        precio: Number(product.precio),
        url_imagen: product.url_imagen,
        cantidad: quantity
      }];
    });

    showToast(`Añadido ${product.nombre} al carrito`, 'success');
    setIsDrawerOpen(true);

    // Sync to DB
    if (user) {
      try {
        await fetchWithAuth('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', product, quantity })
        });
      } catch (e) {
        console.error('Error syncing add to cart DB:', e);
      }
    }
  }, [showToast, user, fetchWithAuth]);

  const removeFromCart = useCallback(async (productId) => {
    const item = items.find(i => i.id_producto === productId);
    setItems(prev => prev.filter(i => i.id_producto !== productId));
    if (item) {
      showToast(`Eliminado ${item.nombre} del carrito`, 'success');
    }

    if (user) {
      try {
        await fetchWithAuth('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'remove', id_producto: productId })
        });
      } catch (e) {
        console.error('Error syncing remove from cart DB:', e);
      }
    }
  }, [items, showToast, user, fetchWithAuth]);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id_producto === productId
          ? { ...item, cantidad: newQuantity }
          : item
      )
    );

    if (user) {
      try {
        await fetchWithAuth('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', id_producto: productId, quantity: newQuantity })
        });
      } catch (e) {
        console.error('Error syncing update cart qty DB:', e);
      }
    }
  }, [user, fetchWithAuth, removeFromCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    if (user) {
      try {
        await fetchWithAuth('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear' })
        });
      } catch (e) {
        console.error('Error syncing clear cart DB:', e);
      }
    }
  }, [user, fetchWithAuth]);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(prev => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = items.reduce((sum, item) => sum + (Number(item.precio) * item.cantidad), 0);

  return (
    <CartContext.Provider value={{
      cart: items,
      items,
      isDrawerOpen,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleDrawer,
      closeDrawer,
      totalItems,
      totalPrice,
      mounted
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
