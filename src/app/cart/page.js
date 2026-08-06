'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container section-padding text-center">
        <div className="cart-empty-page">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#B0A89E" strokeWidth="1">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <h1 className="cart-empty-title">Tu carrito está vacío</h1>
          <p className="cart-empty-subtitle">Descubre nuestra colección curada de objetos y piezas exclusivas.</p>
          <Link href="/shop" className="btn-primary">
            VER COLECCIÓN COMPLETA
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      <h1 className="page-title text-center">Carrito de Compras</h1>
      <div className="cart-page" id="cart-page">
        <div className="cart-page-items">
          <div className="cart-page-header-row">
            <span>Producto</span>
            <span>Precio</span>
            <span>Cantidad</span>
            <span>Total</span>
            <span></span>
          </div>
          {items.map((item) => (
            <div className="cart-page-item" key={item.id_producto} id={`cart-page-item-${item.id_producto}`}>
              <div className="cart-page-item-product">
                <Image
                  src={item.url_imagen || '/images/products/travertine_tray.png'}
                  alt={item.nombre}
                  width={80}
                  height={80}
                  className="cart-page-item-image"
                />
                <span className="cart-page-item-name">{item.nombre}</span>
              </div>
              <span className="cart-page-item-price">${Number(item.precio).toFixed(2)}</span>
              <div className="cart-page-item-quantity">
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id_producto, item.cantidad - 1)}
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className="qty-value">{item.cantidad}</span>
                <button
                  className="qty-btn"
                  onClick={() => updateQuantity(item.id_producto, item.cantidad + 1)}
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
              <span className="cart-page-item-total">${(item.precio * item.cantidad).toFixed(2)}</span>
              <button
                className="cart-page-item-remove"
                onClick={() => removeFromCart(item.id_producto)}
                aria-label={`Eliminar ${item.nombre}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="cart-page-summary" id="cart-summary">
          <h3 className="cart-summary-title">Resumen del Pedido</h3>
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Envío</span>
            <span>{totalPrice >= 100 ? 'Gratis' : '$12.00'}</span>
          </div>
          <div className="cart-summary-row cart-summary-total-row">
            <span>Total</span>
            <span>${(totalPrice + (totalPrice >= 100 ? 0 : 12)).toFixed(2)}</span>
          </div>
          <Link href="/checkout" className="cart-checkout-btn" id="proceed-checkout">
            PROCEDER AL PAGO
          </Link>
          <button className="cart-clear-btn" onClick={clearCart}>
            Vaciar Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
