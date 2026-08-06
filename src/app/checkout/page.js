'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [metodoPago, setMetodoPago] = useState('paypal'); // 'card' | 'paypal'

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    calle_numero: '',
    colonia: '',
    ciudad: '',
    codigo_postal: '',
    telefono_contacto: ''
  });

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'BAAZuDEi8xdRFWFcOJSOwDxJtNePzpPUNVRNdwtiqiBtImgSc8vkTu4FPCxVvpUSxqJpTP_pmX2CC_iLfk';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.calle_numero.trim() ||
        !form.colonia.trim() || !form.ciudad.trim() || !form.codigo_postal.trim() ||
        !form.telefono_contacto.trim()) {
      showToast('Por favor completa todos los campos de contacto y envío.', 'error');
      return false;
    }
    return true;
  };

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const finalTotal = totalPrice + (totalPrice >= 100 ? 0 : 12);
      const res = await fetchWithAuth('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user?.id_usuario || null,
          total: finalTotal,
          metodo_pago: 'Tarjeta de crédito (Simulado)',
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
        showToast('¡Pedido realizado con éxito!', 'success');
        clearCart();
      } else {
        showToast(data.error || 'No se pudo procesar el pedido.', 'error');
      }
    } catch (e) {
      console.error('Checkout error:', e);
      showToast('Error de red al procesar el pago.', 'error');
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
          <h1 className="checkout-success-title">¡Orden Confirmada!</h1>
          <p className="checkout-success-text">Gracias por tu compra. Tu número de pedido es:</p>
          <p className="checkout-success-id">{orderId}</p>
          <button onClick={() => router.push('/shop')} className="btn-primary">
            CONTINUAR COMPRANDO
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section-padding text-center">
        <h1>Tu carrito está vacío</h1>
        <button onClick={() => router.push('/shop')} className="btn-primary" style={{ marginTop: '24px' }}>
          VER COLECCIÓN
        </button>
      </div>
    );
  }

  const finalTotal = totalPrice + (totalPrice >= 100 ? 0 : 12);

  return (
    <PayPalScriptProvider options={{ "clientId": paypalClientId, currency: "USD", intent: "capture" }}>
      <div className="container section-padding">
        <h1 className="page-title">Finalizar Compra</h1>
        <div className="checkout-page" id="checkout-page">
          <div className="checkout-form">
            <h2 className="checkout-section-title">Información de Contacto</h2>
            <div className="checkout-form-row">
              <div className="checkout-form-group">
                <label className="checkout-label" htmlFor="nombre">Nombre Completo</label>
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
                <label className="checkout-label" htmlFor="email">Correo Electrónico</label>
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

            <h2 className="checkout-section-title">Dirección de Envío</h2>
            <div className="checkout-form-group">
              <label className="checkout-label" htmlFor="calle_numero">Calle y Número</label>
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
                <label className="checkout-label" htmlFor="colonia">Colonia / Zona</label>
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
                <label className="checkout-label" htmlFor="ciudad">Ciudad</label>
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
                <label className="checkout-label" htmlFor="codigo_postal">Código Postal</label>
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
                <label className="checkout-label" htmlFor="telefono_contacto">Teléfono</label>
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

            <h2 className="checkout-section-title" style={{ marginTop: '28px' }}>Método de Pago</h2>
            <div className="payment-methods-grid">
              <label
                className={`payment-method-card ${metodoPago === 'paypal' ? 'active' : ''}`}
                onClick={() => setMetodoPago('paypal')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paypal"
                  checked={metodoPago === 'paypal'}
                  onChange={() => setMetodoPago('paypal')}
                  className="payment-method-radio"
                />
                <div className="payment-method-info">
                  <span className="payment-method-title">PayPal / Sandbox</span>
                  <span className="payment-method-desc">Paga de forma segura con tu cuenta de PayPal</span>
                </div>
              </label>

              <label
                className={`payment-method-card ${metodoPago === 'card' ? 'active' : ''}`}
                onClick={() => setMetodoPago('card')}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={metodoPago === 'card'}
                  onChange={() => setMetodoPago('card')}
                  className="payment-method-radio"
                />
                <div className="payment-method-info">
                  <span className="payment-method-title">Tarjeta / Simulación Directa</span>
                  <span className="payment-method-desc">Pago express simulado</span>
                </div>
              </label>
            </div>

            {metodoPago === 'paypal' ? (
              <div className="paypal-checkout-container">
                <div className="paypal-sandbox-info">
                  <div className="paypal-sandbox-info-title">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    Modo Sandbox PayPal Activo
                  </div>
                  <span>Credenciales de prueba para simular el pago:</span>
                  <div className="paypal-credentials-row">
                    <span><strong>Email:</strong> sb-eep1652409955@business.example.com</span>
                    <span><strong>Password:</strong> $v/G-3$N</span>
                  </div>
                </div>

                <div className="paypal-button-wrapper">
                  <PayPalButtons
                    style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                    createOrder={async (data, actions) => {
                      if (!validateForm()) {
                        throw new Error('Información de envío incompleta.');
                      }

                      const res = await fetch('/api/paypal/create-order', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: finalTotal })
                      });
                      const orderData = await res.json();

                      if (!res.ok || !orderData.id) {
                        showToast(orderData.error || 'Error al conectar con PayPal Sandbox.', 'error');
                        throw new Error(orderData.error || 'PayPal order creation failed.');
                      }

                      return orderData.id;
                    }}
                    onApprove={async (data) => {
                      setLoading(true);
                      try {
                        const res = await fetchWithAuth('/api/paypal/capture-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            orderID: data.orderID,
                            id_usuario: user?.id_usuario || null,
                            total: finalTotal,
                            items: items.map(item => ({
                              id_producto: item.id_producto,
                              cantidad: item.cantidad,
                              precio: item.precio
                            })),
                            direccion: form
                          })
                        });
                        const resData = await res.json();
                        if (resData.success) {
                          setSuccess(true);
                          setOrderId(resData.id_pedido);
                          showToast('¡Pago procesado con éxito en PayPal!', 'success');
                          clearCart();
                        } else {
                          showToast(resData.error || 'No se pudo completar la transacción.', 'error');
                        }
                      } catch (err) {
                        console.error('Error al capturar orden PayPal:', err);
                        showToast('Error de red al procesar la transacción.', 'error');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    onError={(err) => {
                      console.error('PayPal button error:', err);
                      showToast('Ocurrió un error con el botón de PayPal.', 'error');
                    }}
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleStandardSubmit}>
                <button
                  type="submit"
                  className="checkout-submit-btn"
                  disabled={loading}
                  id="place-order-btn"
                  style={{ marginTop: '16px', width: '100%' }}
                >
                  {loading ? 'PROCESANDO...' : 'REALIZAR PEDIDO DIRECTO'}
                </button>
              </form>
            )}
          </div>

          <div className="checkout-summary" id="checkout-summary">
            <h3 className="checkout-summary-title">Resumen del Pedido</h3>
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
                    <span className="checkout-summary-item-qty">Cant: {item.cantidad}</span>
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
                <span>Envío</span>
                <span>{totalPrice >= 100 ? 'Gratis' : '$12.00'}</span>
              </div>
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
