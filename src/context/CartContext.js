'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/context/ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { showToast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('nexa-cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
    setMounted(true);
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('nexa-cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage:', e);
      }
    }
  }, [items, mounted]);

  const addToCart = useCallback((product, quantity = 1) => {
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
        precio: product.precio,
        url_imagen: product.url_imagen,
        cantidad: quantity
      }];
    });
    showToast(`Added ${product.nombre} to cart`, 'success');
    setIsDrawerOpen(true);
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    const item = items.find(i => i.id_producto === productId);
    setItems(prev => prev.filter(item => item.id_producto !== productId));
    if (item) {
      showToast(`Removed ${item.nombre} from cart`, 'success');
    }
  }, [items, showToast]);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) {
      const item = items.find(i => i.id_producto === productId);
      setItems(prev => prev.filter(item => item.id_producto !== productId));
      if (item) {
        showToast(`Removed ${item.nombre} from cart`, 'success');
      }
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id_producto === productId
          ? { ...item, cantidad: newQuantity }
          : item
      )
    );
  }, [items, showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
    showToast('Cart cleared', 'success');
  }, [showToast]);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen(prev => !prev);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  return (
    <CartContext.Provider value={{
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

