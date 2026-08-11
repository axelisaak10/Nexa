'use client';

import { useState, useEffect } from 'react';
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
  const [metodoPago, setMetodoPago] = useState('paypal');
  const [savedAddressLoaded, setSavedAddressLoaded] = useState(false);

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    calle_numero: '',
    colonia: '',
    ciudad: '',
    codigo_postal: '',
    telefono_contacto: ''
  });

  // Auto-load saved address from DB when user is logged in
  useEffect(() => {
    if (!user?.id_usuario) return;
    fetchWithAuth('/api/address')
      .then(r => r.json())
      .then(data => {
        if (data.success && data.direccion) {
          const d = data.direccion;
          setForm(prev => ({
            ...prev,
            calle_numero: d.calle_numero || prev.calle_numero,
            colonia: d.colonia || prev.colonia,
            ciudad: d.ciudad || prev.ciudad,
            codigo_postal: d.codigo_postal || prev.codigo_postal,
            telefono_contacto: d.telefono_contacto || prev.telefono_contacto,
          }));
          setSavedAddressLoaded(true);
        }
      })
      .catch(() => {});
  }, [user?.id_usuario, fetchWithAuth]);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'BAAZuDEi8xdRFWFcOJSOwDxJtNePzpPUNVRNdwtiqiBtImgSc8vkTu4FPCxVvpUSxqJpTP_pmX2CC_iLfk';

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.calle_numero.trim() ||
        !form.colonia.trim() || !form.ciudad.trim() || !form.codigo_postal.trim() ||
        !form.telefono_contacto.trim()) {
      showToast('Por favor completa todos los campos de contacto y dirección de envío.', 'error');
      return false;
    }
    return true;
  };

  // Save address to DB after successful order
  const saveAddressToDB = async () => {
    if (!user?.id_usuario) return;
    try {
      await fetchWithAuth('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calle_numero: form.calle_numero,
          colonia: form.colonia,
          ciudad: form.ciudad,
          codigo_postal: form.codigo_postal,
          telefono_contacto: form.telefono_contacto,
        })
      });
    } catch {}
  };

  // Direct PayPal Sandbox Simulation Fallback
  const handleDirectPayPalSimulate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const finalTotal = totalPrice + (totalPrice >= 100 ? 0 : 12);
      // Create mock order directly
      const res = await fetchWithAuth('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user?.id_usuario || null,
          total: finalTotal,
          metodo_pago: 'PayPal (Sandbox Simulado)',
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
        await saveAddressToDB();
        setSuccess(true);
        setOrderId(data.id_pedido);
        showToast('¡Pago procesado con éxito mediante PayPal Sandbox!', 'success');
        clearCart();
      } else {
        showToast(data.error || 'No se pudo procesar el pago de PayPal.', 'error');
      }
    } catch (e) {
      console.error('PayPal simulation error:', e);
      showToast('Error de red al procesar el pago con PayPal.', 'error');
    }
    setLoading(false);
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
        await saveAddressToDB();
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
        <div className="checkout-success-card" id="checkout-success">
          <div className="success-icon-badge">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1 className="checkout-success-title">¡Orden Confirmada!</h1>
          <p className="checkout-success-text">Gracias por tu compra. Tu número de pedido es:</p>
          <div className="checkout-success-id-box">{orderId}</div>
          <p className="checkout-success-subtext">Hemos recibido tu pago y estamos preparando tus objetos curados.</p>
          <button onClick={() => router.push('/shop')} className="btn-primary" style={{ marginTop: '24px' }}>
            CONTINUAR COMPRANDO
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section-padding text-center">
        <div className="empty-cart-checkout-card">
          <h1>Tu carrito está vacío</h1>
          <p>Agrega productos a tu carrito antes de proceder al pago.</p>
          <button onClick={() => router.push('/shop')} className="btn-primary" style={{ marginTop: '24px' }}>
            EXPLORAR COLECCIÓN
          </button>
        </div>
      </div>
    );
  }

  const finalTotal = totalPrice + (totalPrice >= 100 ? 0 : 12);

  return (
    <PayPalScriptProvider options={{ "clientId": paypalClientId, currency: "USD", intent: "capture" }}>
      <div className="container section-padding">
        <h1 className="page-title text-center">Finalizar Compra</h1>
        <p className="page-subtitle text-center">Completa tu información para procesar el pago y envío.</p>
        
        <div className="checkout-page" id="checkout-page">
          <div className="checkout-form-container">
            
            {/* Contact Information */}
            <div className="checkout-card">
              <h2 className="checkout-section-title">
                <span className="step-number">1</span>
                <span>Información de Contacto</span>
              </h2>
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="nombre">Nombre Completo</label>
                  <input
                    className="checkout-input"
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Ej. Axel Isaac"
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
                    placeholder="ejemplo@correo.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="checkout-card">
              <h2 className="checkout-section-title">
                <span className="step-number">2</span>
                <span>Dirección de Envío</span>
                {savedAddressLoaded && (
                  <span className="checkout-saved-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Guardada
                  </span>
                )}
              </h2>
              <div className="checkout-form-group">
                <label className="checkout-label" htmlFor="calle_numero">Calle y Número</label>
                <input
                  className="checkout-input"
                  type="text"
                  id="calle_numero"
                  name="calle_numero"
                  placeholder="Av. Principal #123"
                  value={form.calle_numero}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="colonia">Colonia / Municipio</label>
                  <input
                    className="checkout-input"
                    type="text"
                    id="colonia"
                    name="colonia"
                    placeholder="Col. Centro"
                    value={form.colonia}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="ciudad">Ciudad / Estado</label>
                  <input
                    className="checkout-input"
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    placeholder="Ciudad de México"
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
                    placeholder="01000"
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
                    placeholder="5512345678"
                    value={form.telefono_contacto}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <h2 className="checkout-section-title">
                <span className="step-number">3</span>
                <span>Método de Pago</span>
              </h2>
              
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
                  <div className="payment-method-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#003087">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.761.761 0 0 1 .752-.644h6.868c3.2 0 5.488.672 6.444 2.378.835 1.488.647 3.576-.554 6.136-1.572 3.353-4.636 4.97-8.83 4.97H7.791l-.715 4.777z"/>
                    </svg>
                  </div>
                  <div className="payment-method-info">
                    <span className="payment-method-title">PayPal / Sandbox</span>
                    <span className="payment-method-desc">Paga seguro con tu cuenta de PayPal Sandbox</span>
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
                  <div className="payment-method-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  </div>
                  <div className="payment-method-info">
                    <span className="payment-method-title">Tarjeta / Pago Directo</span>
                    <span className="payment-method-desc">Simulación express de tarjeta de crédito</span>
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
                      Credenciales de Prueba PayPal Sandbox
                    </div>
                    <div className="paypal-credentials-row">
                      <span><strong>Email:</strong> sb-eep1652409955@business.example.com</span>
                      <span><strong>Password:</strong> $v/G-3$N</span>
                    </div>
                  </div>

                  {/* Dual PayPal Option: Smart Buttons + Direct Express Simulation */}
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
                          showToast(orderData.error || 'Error al conectar con PayPal.', 'error');
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
                        showToast('Ocurrió un error al cargar el servicio de PayPal.', 'error');
                      }}
                    />

                    <div className="paypal-fallback-divider">
                      <span>O SIMULA EL PAGO EN 1 CLIC</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDirectPayPalSimulate}
                      className="paypal-express-simulate-btn"
                      disabled={loading}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#003087">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.761.761 0 0 1 .752-.644h6.868c3.2 0 5.488.672 6.444 2.378.835 1.488.647 3.576-.554 6.136-1.572 3.353-4.636 4.97-8.83 4.97H7.791l-.715 4.777z"/>
                      </svg>
                      {loading ? 'PROCESANDO PAGO PAYPAL...' : 'PAGAR AHORA CON PAYPAL SANDBOX (SIMULAR)'}
                    </button>
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
                    {loading ? 'PROCESANDO...' : 'REALIZAR PEDIDO CON TARJETA'}
                  </button>
                </form>
              )}
            </div>

          </div>

          {/* Order Summary Sidebar Card */}
          <div className="checkout-summary-card" id="checkout-summary">
            <h3 className="checkout-summary-title">Resumen del Pedido</h3>
            <div className="checkout-summary-items">
              {items.map((item) => (
                <div className="checkout-summary-item" key={item.id_producto}>
                  <div className="checkout-summary-item-thumb">
                    <Image
                      src={item.url_imagen || '/images/products/travertine_tray.png'}
                      alt={item.nombre}
                      width={64}
                      height={64}
                      className="checkout-summary-item-image"
                    />
                    <span className="item-qty-badge">{item.cantidad}</span>
                  </div>
                  <div className="checkout-summary-item-info">
                    <span className="checkout-summary-item-name">{item.nombre}</span>
                    <span className="checkout-summary-item-qty">Cantidad: {item.cantidad}</span>
                  </div>
                  <span className="checkout-summary-item-price">${(item.precio * item.cantidad).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-totals">
              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Envío estimado</span>
                <span>{totalPrice >= 100 ? 'Gratis' : '$12.00'}</span>
              </div>
              <div className="checkout-summary-divider" />
              <div className="checkout-summary-row checkout-summary-total">
                <span>Total a pagar</span>
                <span className="total-amount-highlight">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-security-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>Pago 100% Encriptado y Seguro</span>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
