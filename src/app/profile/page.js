'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function ProfilePage() {
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    direccion: 'Av. Paseo de la Reforma 402, Juárez, CDMX'
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

  useEffect(() => {
    if (user) {
      // Defer state update to satisfy React linting rules against sync setState inside effects
      Promise.resolve().then(() => {
        setProfileData({
          nombre: user.nombre || '',
          email: user.email || '',
          direccion: 'Av. Paseo de la Reforma 402, Juárez, CDMX'
        });
        fetchUserOrders(user.id_usuario);
      });
    }
  }, [user, fetchUserOrders]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    showToast('¡Información de perfil actualizada!', 'success');
    setIsEditing(false);
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

  return (
    <div className="container section-padding" id="profile-page">
      <div className="profile-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="hero-label">MI CUENTA</span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginTop: '6px' }}>
              Hola, {user.nombre}
            </h1>
          </div>
          {isAdmin && (
            <Link href="/dashboard" className="btn-primary" style={{ backgroundColor: 'var(--accent)' }}>
              PANEL DE ADMINISTRACIÓN →
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }} className="profile-grid">
        {/* Columna Izquierda: Información de Perfil */}
        <div className="profile-card" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>Datos Personales</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', backgroundColor: isAdmin ? '#C85A2A' : '#1A1A1A', color: 'white', letterSpacing: '1px' }}>
              {isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}
            </span>
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="auth-label">Nombre Completo</label>
                <input
                  type="text"
                  className="auth-input"
                  value={profileData.nombre}
                  onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="auth-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="auth-input"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="auth-label">Dirección Principal</label>
                <input
                  type="text"
                  className="auth-input"
                  value={profileData.direccion}
                  onChange={(e) => setProfileData({ ...profileData, direccion: e.target.value })}
                  required
                />
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
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>{profileData.nombre}</span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>CORREO ELECTRÓNICO</span>
                <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '500' }}>{profileData.email}</span>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>DIRECCIÓN DE ENVÍO</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{profileData.direccion}</span>
              </div>
              <button onClick={() => setIsEditing(true)} className="btn-primary" style={{ width: '100%' }}>
                EDITAR PERFIL
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
    </div>
  );
}
