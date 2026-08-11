'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import PinPad from '@/components/PinPad';

export default function ProfilePage() {
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState('');

  const [profileForm, setProfileForm] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    calle_numero: '',
    colonia: '',
    ciudad: '',
    codigo_postal: '',
    telefono_contacto: ''
  });

  const fetchUserOrders = useCallback(async (userId) => {
    setLoadingOrders(true);
    try {
      const res = await fetchWithAuth(`/api/orders?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || data.pedidos || []);
      }
    } catch (e) {
      console.error('Error loading user orders:', e);
    }
    setLoadingOrders(false);
  }, [fetchWithAuth]);

  const fetchUserAddress = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/address');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.direccion) {
          const d = data.direccion;
          setProfileForm(prev => ({
            ...prev,
            calle_numero: d.calle_numero || '',
            colonia: d.colonia || '',
            ciudad: d.ciudad || '',
            codigo_postal: d.codigo_postal || '',
            telefono_contacto: d.telefono_contacto || ''
          }));
        }
      }
    } catch (e) {
      console.error('Error loading user address:', e);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        setProfileForm(prev => ({
          ...prev,
          nombre: user.nombre || '',
          email: user.email || ''
        }));
        fetchUserOrders(user.id_usuario);
        fetchUserAddress();
      });
    }
  }, [user, fetchUserOrders, fetchUserAddress]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Guardar nombre/email en API Perfil
      const resProfile = await fetchWithAuth('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: profileForm.nombre, email: profileForm.email })
      });

      // 2. Guardar dirección en API Address
      const resAddr = await fetchWithAuth('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calle_numero: profileForm.calle_numero,
          colonia: profileForm.colonia,
          ciudad: profileForm.ciudad,
          codigo_postal: profileForm.codigo_postal,
          telefono_contacto: profileForm.telefono_contacto
        })
      });

      const dataProf = await resProfile.json();
      const dataAddr = await resAddr.json();

      if (dataProf.success || dataAddr.success) {
        showToast('¡Información de perfil y dirección actualizada!', 'success');
        setIsEditing(false);
      } else {
        showToast('Ocurrió un error al guardar los cambios.', 'error');
      }
    } catch (e) {
      showToast('Error de red al actualizar perfil.', 'error');
    }
  };

  const handlePinSave = async (newPin) => {
    setPinLoading(true);
    setPinError('');
    try {
      const res = await fetchWithAuth('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: user.id_usuario, pin: newPin })
      });
      const data = await res.json();
      if (data.success) {
        showToast('¡Nuevo PIN configurado exitosamente!', 'success');
        setShowPinModal(false);
      } else {
        setPinError(data.error || 'Error al guardar el PIN.');
      }
    } catch (e) {
      setPinError('Error de conexión.');
    }
    setPinLoading(false);
  };

  if (!user) {
    return (
      <div className="container section-padding text-center">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '16px' }}>Acceso Requerido</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Inicia sesión para ver tu perfil y tu historial de pedidos.</p>
        <Link href="/auth/login" className="btn-primary">INICIAR SESIÓN</Link>
      </div>
    );
  }

  const isAdmin = user.id_rol === 1 || user.email === 'admin@nexa.com';
  const fullAddress = [profileForm.calle_numero, profileForm.colonia, profileForm.ciudad, profileForm.codigo_postal].filter(Boolean).join(', ');

  return (
    <div className="container section-padding" id="profile-page">
      <div className="profile-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="hero-label">MI CUENTA</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginTop: '6px' }}>
              Hola, {profileForm.nombre || user.nombre}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowPinModal(true)}
              className="btn-secondary"
              style={{ border: '1px solid var(--border)', padding: '10px 18px', backgroundColor: '#FFFFFF' }}
            >
              🔒 CONFIGURAR PIN (4 DÍGITOS)
            </button>
            {isAdmin && (
              <Link href="/dashboard" className="btn-primary" style={{ backgroundColor: 'var(--accent)' }}>
                PANEL DE ADMINISTRACIÓN →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }} className="profile-grid">
        {/* Columna Izquierda: Información de Perfil */}
        <div className="profile-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>Datos Personales y Dirección</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: isAdmin ? '#C85A2A' : '#1A1A1A', color: 'white', letterSpacing: '1px' }}>
              {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label className="auth-label">Nombre Completo</label>
                <input
                  type="text"
                  className="auth-input"
                  value={profileForm.nombre}
                  onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="auth-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="auth-input"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>
              
              <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #EAE2D8' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent)', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>
                DIRECCIÓN DE ENVÍO PREDETERMINADA
              </span>

              <div style={{ marginBottom: '12px' }}>
                <label className="auth-label">Calle y Número</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Av. Principal #123"
                  value={profileForm.calle_numero}
                  onChange={(e) => setProfileForm({ ...profileForm, calle_numero: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label className="auth-label">Colonia</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="Col. Centro"
                    value={profileForm.colonia}
                    onChange={(e) => setProfileForm({ ...profileForm, colonia: e.target.value })}
                  />
                </div>
                <div>
                  <label className="auth-label">Ciudad / Estado</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="CDMX"
                    value={profileForm.ciudad}
                    onChange={(e) => setProfileForm({ ...profileForm, ciudad: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <label className="auth-label">Código Postal</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="01000"
                    value={profileForm.codigo_postal}
                    onChange={(e) => setProfileForm({ ...profileForm, codigo_postal: e.target.value })}
                  />
                </div>
                <div>
                  <label className="auth-label">Teléfono</label>
                  <input
                    type="text"
                    className="auth-input"
                    placeholder="5512345678"
                    value={profileForm.telefono_contacto}
                    onChange={(e) => setProfileForm({ ...profileForm, telefono_contacto: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="auth-btn" style={{ flex: 1 }}>GUARDAR</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ border: '1px solid var(--border)', padding: '12px 16px' }}>CANCELAR</button>
              </div>
            </form>
          ) : (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>NOMBRE</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>{profileForm.nombre}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>CORREO ELECTRÓNICO</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>{profileForm.email}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>DIRECCIÓN PREDETERMINADA</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{fullAddress || 'Sin dirección guardada aún.'}</span>
              </div>
              {profileForm.telefono_contacto && (
                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>TELÉFONO</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{profileForm.telefono_contacto}</span>
                </div>
              )}
              <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ width: '100%' }}>
                EDITAR PERFIL Y DIRECCIÓN
              </button>
            </div>
          )}
        </div>

        {/* Columna Derecha: Historial de Pedidos */}
        <div className="orders-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '20px' }}>
            Historial de Pedidos ({orders.length})
          </h3>

          {loadingOrders ? (
            <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Cargando tus pedidos...</p>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F8F5F1', borderRadius: '8px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Aún no has realizado pedidos en Nexa.</p>
              <Link href="/shop" className="btn-primary">EXPLORAR TIENDA</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((pedido) => (
                <div key={pedido.id_pedido} style={{ border: '1px solid #EAE2D8', borderRadius: '8px', padding: '20px', backgroundColor: '#FBF9F6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '0.9rem' }}>
                        PEDIDO #{pedido.id_pedido}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                        {new Date(pedido.fecha_pedido).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.7rem',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      backgroundColor: pedido.estado_pedido === 'Entregado' ? '#E8F5E9' : '#FFF3E0',
                      color: pedido.estado_pedido === 'Entregado' ? '#2E7D32' : '#E65100',
                      fontWeight: '600'
                    }}>
                      {pedido.estado_pedido}
                    </span>
                  </div>

                  <div style={{ borderTop: '1px dashed #E5DCD0', paddingTop: '12px', marginBottom: '12px' }}>
                    {pedido.detalles_pedido?.map((det, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span>{det.cantidad}x {det.productos?.nombre || 'Producto'}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>${det.precio_unitario}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #EAE2D8', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Método de Pago: {pedido.metodo_pago}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      Total: ${pedido.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CONFIGURACIÓN DE PIN */}
      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%', position: 'relative', color: '#F5F0EB' }}>
            <button onClick={() => setShowPinModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#F5F0EB', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <PinPad
              mode="create"
              title="Configura tu PIN de 4 dígitos"
              subtitle="Lo usarás para autenticación rápida y en el Smartwatch"
              error={pinError}
              loading={pinLoading}
              onComplete={handlePinSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}
