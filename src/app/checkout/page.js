'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    calle_numero: '',
    colonia: '',
    ciudad: '',
    codigo_postal: '',
    telefono_contacto: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user?.id_usuario || null,
          total: totalPrice + (totalPrice >= 100 ? 0 : 12),
          items: items.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad,
            precio: item.precio
          })),
          direccion: form
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setOrderId(data.id_pedido);
        showToast('Order placed successfully!', 'success');
        clearCart();
      } else {
        showToast(data.error || 'Failed to place order. Try again.', 'error');
      }
    } catch (e) {
      console.error('Checkout failed:', e);
      showToast('Network error during checkout.', 'error');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="container section-padding text-center">
        <div className="checkout-success" id="checkout-success">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h1 className="checkout-success-title">Order Confirmed!</h1>
          <p className="checkout-success-text">Thank you for your order. Your order ID is:</p>
          <p className="checkout-success-id">{orderId}</p>
          <button onClick={() => router.push('/shop')} className="btn-primary">
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section-padding text-center">
        <h1>Your cart is empty</h1>
        <button onClick={() => router.push('/shop')} className="btn-primary" style={{ marginTop: '24px' }}>
          BROWSE COLLECTION
        </button>
      </div>
    );
  }

  return (
    <div className="container section-padding">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-page" id="checkout-page">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2 className="checkout-section-title">Contact Information</h2>
          <div className="checkout-form-row">
            <div className="checkout-form-group">
              <label className="checkout-label" htmlFor="nombre">Full Name</label>
              <input
                className="checkout-input"
                type="text"
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div className="checkout-form-group">
              <label className="checkout-label" htmlFor="email">Email</label>
              <input
                className="checkout-input"
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h2 className="checkout-section-title">Shipping Address</h2>
          <div className="checkout-form-group">
            <label className="checkout-label" htmlFor="calle_numero">Street & Number</label>
            <input
              className="checkout-input"
              type="text"
              id="calle_numero"
              name="calle_numero"
              value={form.calle_numero}
              onChange={handleChange}
              required
            />
          </div>
          <div className="checkout-form-row">
            <div className="checkout-form-group">
              <label className="checkout-label" htmlFor="colonia">Neighborhood</label>
              <input
                className="checkout-input"
                type="text"
                id="colonia"
                name="colonia"
                value={form.colonia}
                onChange={handleChange}
                required
              />
            </div>
            <div className="checkout-form-group">
              <label className="checkout-label" htmlFor="ciudad">City</label>
              <input
                className="checkout-input"
                type="text"
                id="ciudad"
                name="ciudad"
                value={form.ciudad}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="checkout-form-row">
            <div className="checkout-form-group">
              <label className="checkout-label" htmlFor="codigo_postal">Postal Code</label>
              <input
                className="checkout-input"
                type="text"
                id="codigo_postal"
                name="codigo_postal"
                value={form.codigo_postal}
                onChange={handleChange}
                required
              />
            </div>
            <div className="checkout-form-group">
              <label className="checkout-label" htmlFor="telefono_contacto">Phone</label>
              <input
                className="checkout-input"
                type="tel"
                id="telefono_contacto"
                name="telefono_contacto"
                value={form.telefono_contacto}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={loading}
            id="place-order-btn"
          >
            {loading ? 'PROCESSING...' : 'PLACE ORDER'}
          </button>
        </form>

        <div className="checkout-summary" id="checkout-summary">
          <h3 className="checkout-summary-title">Order Summary</h3>
          <div className="checkout-summary-items">
            {items.map((item) => (
              <div className="checkout-summary-item" key={item.id_producto}>
                <Image
                  src={item.url_imagen || '/images/products/travertine_tray.png'}
                  alt={item.nombre}
                  width={60}
                  height={60}
                  className="checkout-summary-item-image"
                />
                <div className="checkout-summary-item-info">
                  <span className="checkout-summary-item-name">{item.nombre}</span>
                  <span className="checkout-summary-item-qty">Qty: {item.cantidad}</span>
                </div>
                <span className="checkout-summary-item-price">${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-totals">
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Shipping</span>
              <span>{totalPrice >= 100 ? 'Free' : '$12.00'}</span>
            </div>
            <div className="checkout-summary-row checkout-summary-total">
              <span>Total</span>
              <span>${(totalPrice + (totalPrice >= 100 ? 0 : 12)).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
