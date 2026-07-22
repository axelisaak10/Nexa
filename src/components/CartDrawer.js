'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeFromCart, updateQuantity, totalPrice } = useCart();

  return (
    <>
      {isDrawerOpen && (
        <div className="cart-drawer-overlay" onClick={closeDrawer} id="cart-overlay" />
      )}
      <aside className={`cart-drawer ${isDrawerOpen ? 'open' : ''}`} id="cart-drawer" aria-label="Carrito de compras">
        <div className="cart-drawer-header">
          <h2 className="cart-drawer-title">Tu Carrito</h2>
          <button className="cart-drawer-close" onClick={closeDrawer} aria-label="Cerrar carrito" id="cart-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B0A89E" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <p className="cart-empty-text">Tu carrito está vacío</p>
            <button className="cart-empty-btn" onClick={closeDrawer}>
              Explorar Colección
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items-list">
              {items.map((item) => (
                <div className="cart-item" key={item.id_producto} id={`cart-item-${item.id_producto}`}>
                  <div className="cart-item-image">
                    <Image
                      src={item.url_imagen || '/images/products/travertine_tray.png'}
                      alt={item.nombre}
                      width={80}
                      height={80}
                    />
                  </div>
                  <div className="cart-item-details">
                    <h4 className="cart-item-name">{item.nombre}</h4>
                    <span className="cart-item-price">${item.precio}</span>
                    <div className="cart-item-quantity">
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
                  </div>
                  <button
                    className="cart-item-remove"
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
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span className="cart-summary-total">${totalPrice.toFixed(2)}</span>
              </div>
              <p className="cart-summary-note">El envío se calcula al finalizar la compra</p>
              <Link
                href="/checkout"
                className="cart-checkout-btn"
                onClick={closeDrawer}
                id="checkout-from-drawer"
              >
                PROCEDER AL PAGO
              </Link>
              <button className="cart-continue-btn" onClick={closeDrawer}>
                Continuar Comprando
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
