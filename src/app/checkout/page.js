'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart, mounted, closeDrawer } = useCart();
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [metodoPago, setMetodoPago] = useState('paypal'); // 'paypal' | 'card'
  const [addressLoaded, setAddressLoaded] = useState(false);

  // Close CartDrawer automatically when navigating to Checkout
  useEffect(() => {
    closeDrawer();
  }, [closeDrawer]);

  const items = cart || [];

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    calle_numero: '',
    colonia: '',
    ciudad: '',
    codigo_postal: '',
    telefono_contacto: ''
  });

  const [cardForm, setCardForm] = useState({
    numero: '',
    expiracion: '',
    cvv: '',
    titular: ''
  });

  // Autocargar la dirección guardada del usuario desde la BD Supabase
  const loadSavedAddress = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/address');
      if (res.ok) {
        const data = await res.json();
        const d = data.success ? data.direccion : null;
        setForm(prev => ({
          ...prev,
          nombre: user?.nombre || prev.nombre,
          email: user?.email || prev.email,
          calle_numero: d?.calle_numero || prev.calle_numero,
          colonia: d?.colonia || prev.colonia,
          ciudad: d?.ciudad || prev.ciudad,
          codigo_postal: d?.codigo_postal || prev.codigo_postal,
          telefono_contacto: d?.telefono_contacto || prev.telefono_contacto
        }));
        if (d) setAddressLoaded(true);
      }
    } catch (e) {
      console.error('Error loading address in checkout:', e);
    }
  }, [fetchWithAuth, user]);

  useEffect(() => {
    if (user) {
      loadSavedAddress();
    }
  }, [user, loadSavedAddress]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardForm({ ...cardForm, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.nombre || !form.email || !form.calle_numero || !form.ciudad || !form.codigo_postal) {
      showToast('Por favor completa todos los campos de envío obligatorios.', 'error');
      return false;
    }
    return true;
  };

  const saveAddressToDB = async () => {
    if (!user) return;
    try {
      await fetchWithAuth('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } catch (e) {
      console.error('Error saving address:', e);
    }
  };

  const handleDirectOrder = async (metodo) => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: user?.id_usuario || null,
          total: finalTotal,
          metodo_pago: metodo,
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
          <div className="checkout-success-id-box">#{orderId}</div>
          <p className="checkout-success-subtext">Hemos recibido tu pago y estamos preparando tus objetos curados.</p>
          <button onClick={() => router.push('/shop')} className="btn-primary" style={{ marginTop: '24px' }}>
            CONTINUAR COMPRANDO
          </button>
        </div>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="container section-padding text-center">
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', padding: '60px 0' }}>Cargando tu carrito...</p>
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
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 className="checkout-section-title" style={{ margin: 0 }}>
                  <span className="step-number">2</span>
                  <span>Dirección de Envío</span>
                </h2>
                {addressLoaded && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#2E7D32', backgroundColor: '#E8F5E9', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                    ✓ Cargar de BD
                  </span>
                )}
              </div>
              <div className="checkout-form-group">
                <label className="checkout-label" htmlFor="calle_numero">Calle y Número</label>
                <input
                  className="checkout-input"
                  type="text"
                  id="calle_numero"
                  name="calle_numero"
                  placeholder="Av. Paseo de la Reforma 402, Int. 5B"
                  value={form.calle_numero}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="colonia">Colonia / Barrio</label>
                  <input
                    className="checkout-input"
                    type="text"
                    id="colonia"
                    name="colonia"
                    placeholder="Juárez"
                    value={form.colonia}
                    onChange={handleChange}
                  />
                </div>
                <div className="checkout-form-group">
                  <label className="checkout-label" htmlFor="ciudad">Ciudad / Municipio</label>
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
                    placeholder="06600"
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
                    <span className="payment-method-desc">Pago seguro con botones inteligentes o simulación</span>
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
                  <div className="paypal-sandbox-info" style={{ backgroundColor: '#FFFDE7', border: '1px solid #FFE082', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
                    <div className="paypal-sandbox-info-title" style={{ fontWeight: 'bold', color: '#F57F17', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      Instrucciones de Prueba PayPal Sandbox
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#5D4037', margin: '6px 0' }}>
                      ⚠️ <strong>Nota:</strong> Para pagar en el popup de PayPal, usa una cuenta de <strong>Comprador (Personal)</strong>. No uses la del vendedor (`@business`). O presiona el botón verde de aprobación directa abajo.
                    </p>
                    <div className="paypal-credentials-row" style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#3E2723' }}>
                      <span><strong>Cuenta Comprador Test:</strong> sb-buyer-nexa@personal.example.com</span>
                      <span><strong>Password:</strong> nexa1234</span>
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
                            await saveAddressToDB();
                            setSuccess(true);
                            setOrderId(resData.id_pedido);
                            showToast('¡Pago procesado con éxito en PayPal!', 'success');
                            clearCart();
                          } else {
                            showToast(resData.error || 'Error al capturar orden.', 'error');
                          }
                        } catch (e) {
                          console.error('PayPal approve error:', e);
                          showToast('Error de red al capturar pago PayPal.', 'error');
                        }
                        setLoading(false);
                      }}
                      onError={(err) => {
                        console.error('PayPal Button Error:', err);
                        showToast('Ocurrió un aviso en PayPal Sandbox.', 'error');
                      }}
                    />

                    {/* Botón de respaldo 1-clic Sandbox */}
                    <button
                      type="button"
                      onClick={() => handleDirectOrder('PayPal (Sandbox Directo)')}
                      disabled={loading}
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#107C41',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      ⚡ SIMULAR PAGO PAYPAL SANDBOX (Aprobación 1-Clic)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card-checkout-container" style={{ marginTop: '16px' }}>
                  <div className="checkout-form-group">
                    <label className="checkout-label">Nombre en la Tarjeta</label>
                    <input
                      className="checkout-input"
                      type="text"
                      name="titular"
                      placeholder="Axel Isaac"
                      value={cardForm.titular}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="checkout-form-group" style={{ marginTop: '12px' }}>
                    <label className="checkout-label">Número de Tarjeta (Simulación)</label>
                    <input
                      className="checkout-input"
                      type="text"
                      name="numero"
                      placeholder="4000 1234 5678 9010"
                      maxLength={19}
                      value={cardForm.numero}
                      onChange={handleCardChange}
                      required
                    />
                  </div>
                  <div className="checkout-form-row" style={{ marginTop: '12px' }}>
                    <div className="checkout-form-group">
                      <label className="checkout-label">Vencimiento</label>
                      <input
                        className="checkout-input"
                        type="text"
                        name="expiracion"
                        placeholder="12/28"
                        maxLength={5}
                        value={cardForm.expiracion}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                    <div className="checkout-form-group">
                      <label className="checkout-label">CVV</label>
                      <input
                        className="checkout-input"
                        type="password"
                        name="cvv"
                        placeholder="123"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDirectOrder('Tarjeta de Crédito')}
                    disabled={loading}
                    className="auth-btn"
                    style={{ marginTop: '20px', width: '100%' }}
                  >
                    {loading ? 'PROCESANDO PAGO...' : `PAGAR $${finalTotal.toFixed(2)} CON TARJETA`}
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Order Summary Right Panel */}
          <div className="checkout-summary-container">
            <div className="checkout-card checkout-summary-card">
              <h3 className="checkout-summary-title">Resumen del Pedido</h3>
              
              <div className="checkout-summary-items">
                {items.map((item) => (
                  <div key={item.id_producto} className="checkout-summary-item">
                    <div className="checkout-summary-item-info">
                      <span className="checkout-summary-item-title">{item.nombre}</span>
                      <span className="checkout-summary-item-qty">Cantidad: {item.cantidad}</span>
                    </div>
                    <span className="checkout-summary-item-price">${(item.precio * item.cantidad).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Envío</span>
                  <span>{totalPrice >= 100 ? 'GRATIS' : '$12.00'}</span>
                </div>
                <div className="summary-row total-row">
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-security-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Pago 100% Encriptado y Seguro</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PayPalScriptProvider>
  );
}
