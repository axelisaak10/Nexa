'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import DashboardCharts from '@/components/DashboardCharts';

export default function DashboardPage() {
  const { user, fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('metricas');

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Add/Edit product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nombre: '',
    precio: '',
    stock: 10,
    id_categoria: 1,
    descripcion: '',
    url_imagen: '/images/products/travertine_tray.png',
    badge: 'NUEVO'
  });

  const isAdmin = user && (user.id_rol === 1 || user.email === 'admin@nexa.com');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [resProd, resOrd, resUsers, resMet] = await Promise.all([
        fetchWithAuth('/api/admin/products'),
        fetchWithAuth('/api/admin/orders'),
        fetchWithAuth('/api/admin/users'),
        fetchWithAuth('/api/metrics')
      ]);

      const dataProd = await resProd.json();
      const dataOrd = await resOrd.json();
      const dataUsers = await resUsers.json();
      const dataMet = await resMet.json();

      setProducts(dataProd.products || []);
      setOrders(dataOrd.pedidos || []);
      setUsers(dataUsers.usuarios || []);
      setMetrics(dataMet.metricas || []);
    } catch (e) {
      console.error('Error loading admin dashboard:', e);
    }
    setLoading(false);
  }, [fetchWithAuth]);

  useEffect(() => {
    if (isAdmin) {
      // Defer state-setting callback to avoid synchronous setState inside render-phase effects
      Promise.resolve().then(() => {
        fetchDashboardData();
      });
    }
  }, [isAdmin, fetchDashboardData]);

  // ADMIN ROUTE GUARD
  if (!isAdmin) {
    return (
      <div className="container section-padding text-center" style={{ maxWidth: '600px', margin: 'auto' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '16px', padding: '40px 24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#FFF3E0', color: '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '12px' }}>
            Acceso Restringido
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
            Este panel de administración es exclusivo para personal autorizado de Nexa. Por favor, inicia sesión con una cuenta de administrador.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/login" className="btn-primary">
              INICIAR SESIÓN COMO ADMIN
            </Link>
            <Link href="/" className="btn-secondary" style={{ border: '1px solid var(--border)', padding: '12px 20px' }}>
              VOLVER A LA TIENDA
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Product CRUD Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      nombre: '',
      precio: '',
      stock: 10,
      id_categoria: 1,
      descripcion: '',
      url_imagen: '/images/products/travertine_tray.png',
      badge: 'NUEVO'
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      nombre: prod.nombre || '',
      precio: prod.precio || '',
      stock: prod.stock || 10,
      id_categoria: prod.id_categoria || 1,
      descripcion: prod.descripcion || '',
      url_imagen: prod.url_imagen || '/images/products/travertine_tray.png',
      badge: prod.badge || ''
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const body = editingProduct
        ? { id_producto: editingProduct.id_producto, ...productForm }
        : productForm;

      const res = await fetchWithAuth('/api/admin/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingProduct ? '¡Producto actualizado!' : '¡Producto creado exitosamente!', 'success');
        setShowProductModal(false);
        fetchDashboardData();
      } else {
        showToast(data.error || 'Error al guardar producto', 'error');
      }
    } catch (e) {
      showToast('Error de conexión', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto de la tienda?')) return;
    try {
      const res = await fetchWithAuth(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Producto eliminado', 'success');
        fetchDashboardData();
      }
    } catch (e) {
      showToast('Error al eliminar producto', 'error');
    }
  };

  // Order Status Handler
  const handleUpdateOrderStatus = async (id_pedido, nuevoEstado) => {
    try {
      const res = await fetchWithAuth('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_pedido, estado_pedido: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Pedido #${id_pedido} actualizado a: ${nuevoEstado}`, 'success');
        fetchDashboardData();
      }
    } catch (e) {
      showToast('Error al actualizar estado del pedido', 'error');
    }
  };

  // User Role Handler
  const handleUpdateUserRole = async (id_usuario, nuevoRol) => {
    try {
      const res = await fetchWithAuth('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario, id_rol: nuevoRol })
      });
      const data = await res.json();
      if (data.success) {
        showToast('¡Rol de usuario actualizado!', 'success');
        fetchDashboardData();
      }
    } catch (e) {
      showToast('Error al cambiar rol', 'error');
    }
  };

  const totalVentas = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <div className="container section-padding" id="admin-dashboard-page">
      {/* Header Panel */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="hero-label">PANEL DE CONTROL GENERAL</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginTop: '6px' }}>
            Gestión de Tienda Nexa
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/profile" className="btn-primary" style={{ backgroundColor: '#1A1A1A' }}>
            MI PERFIL
          </Link>
          <button onClick={handleOpenAddProduct} className="btn-primary" style={{ backgroundColor: 'var(--accent)' }}>
            + NUEVO PRODUCTO
          </button>
        </div>
      </div>

      {/* Tabs de Navegación del Panel */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E5DCD0', marginBottom: '32px', gap: '24px', overflowX: 'auto' }}>
        {[
          { id: 'metricas', label: '📊 MÉTRICAS & RESUMEN' },
          { id: 'productos', label: `📦 PRODUCTOS (${products.length})` },
          { id: 'pedidos', label: `🚚 PEDIDOS (${orders.length})` },
          { id: 'usuarios', label: `👥 USUARIOS (${users.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              letterSpacing: '1px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '3px solid var(--accent)' : '3px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ margin: 'auto' }} />
          <p style={{ marginTop: '16px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Cargando datos del panel...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: MÉTRICAS & DATO ANALÍTICO */}
          {activeTab === 'metricas' && (
            <div>
              {/* Tarjetas de Métricas */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>INGRESOS TOTALES</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: '8px 0 0 0', color: 'var(--accent)' }}>
                    ${totalVentas.toFixed(2)}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>TOTAL DE PEDIDOS</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: '8px 0 0 0' }}>
                    {orders.length}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>PRODUCTOS ACTIVOS</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: '8px 0 0 0' }}>
                    {products.length}
                  </h2>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '10px', padding: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>USUARIOS REGISTRADOS</span>
                  <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', margin: '8px 0 0 0' }}>
                    {users.length}
                  </h2>
                </div>
              </div>

              {/* Gráfico Canvas */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '20px' }}>Ventas Diarias (Última Semana)</h3>
                <DashboardCharts metrics={metrics} />
              </div>
            </div>
          )}

          {/* TAB 2: GESTIÓN DE PRODUCTOS */}
          {activeTab === 'productos' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Inventario de Productos</h3>
                <button onClick={handleOpenAddProduct} className="btn-primary" style={{ fontSize: '0.75rem' }}>
                  + AÑADIR PRODUCTO
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5DCD0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px' }}>PRODUCTO</th>
                      <th style={{ padding: '12px' }}>CATEGORÍA</th>
                      <th style={{ padding: '12px' }}>PRECIO</th>
                      <th style={{ padding: '12px' }}>STOCK</th>
                      <th style={{ padding: '12px' }}>ETIQUETA</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id_producto} style={{ borderBottom: '1px solid #F0E8DF' }}>
                        <td style={{ padding: '16px 12px', fontWeight: '600' }}>{p.nombre}</td>
                        <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)' }}>{p.categorias?.nombre || 'General'}</td>
                        <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${p.precio}</td>
                        <td style={{ padding: '16px 12px' }}>{p.stock} unid.</td>
                        <td style={{ padding: '16px 12px' }}>
                          {p.badge && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '3px 8px', borderRadius: '4px', backgroundColor: '#E8E0D6', color: '#1A1A1A' }}>
                              {p.badge}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            style={{ background: 'none', border: 'none', color: '#1A1A1A', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginRight: '12px', fontWeight: '600' }}
                          >
                            EDITAR
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id_producto)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: '600' }}
                          >
                            ELIMINAR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: GESTIÓN DE PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '24px' }}>Gestión de Pedidos de Clientes</h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5DCD0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px' }}># PEDIDO</th>
                      <th style={{ padding: '12px' }}>CLIENTE</th>
                      <th style={{ padding: '12px' }}>FECHA</th>
                      <th style={{ padding: '12px' }}>TOTAL</th>
                      <th style={{ padding: '12px' }}>ESTADO</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>CAMBIAR ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id_pedido} style={{ borderBottom: '1px solid #F0E8DF' }}>
                        <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>#{o.id_pedido}</td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{ fontWeight: '600', display: 'block' }}>{o.usuarios?.nombre || 'Cliente Demo'}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{o.usuarios?.email || 'demo@nexa.com'}</span>
                        </td>
                        <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {new Date(o.fecha_pedido).toLocaleDateString('es-MX')}
                        </td>
                        <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>${o.total}</td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: o.estado_pedido === 'Entregado' ? '#E8F5E9' : o.estado_pedido === 'Enviado' ? '#E3F2FD' : '#FFF3E0',
                            color: o.estado_pedido === 'Entregado' ? '#2E7D32' : o.estado_pedido === 'Enviado' ? '#1565C0' : '#E65100',
                            fontWeight: '600'
                          }}>
                            {o.estado_pedido}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <select
                            value={o.estado_pedido}
                            onChange={(e) => handleUpdateOrderStatus(o.id_pedido, e.target.value)}
                            style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                          >
                            <option value="En Proceso">En Proceso</option>
                            <option value="Enviado">Enviado</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: GESTIÓN DE USUARIOS */}
          {activeTab === 'usuarios' && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '24px' }}>Control de Usuarios y Roles</h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5DCD0', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '12px' }}># ID</th>
                      <th style={{ padding: '12px' }}>NOMBRE</th>
                      <th style={{ padding: '12px' }}>CORREO ELECTRÓNICO</th>
                      <th style={{ padding: '12px' }}>ROL ACTUAL</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>CAMBIAR ROL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id_usuario} style={{ borderBottom: '1px solid #F0E8DF' }}>
                        <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)' }}>#{u.id_usuario}</td>
                        <td style={{ padding: '16px 12px', fontWeight: '600' }}>{u.nombre}</td>
                        <td style={{ padding: '16px 12px', fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: u.id_rol === 1 ? '#C85A2A' : '#1A1A1A',
                            color: 'white'
                          }}>
                            {u.id_rol === 1 ? 'ADMINISTRADOR' : 'CLIENTE'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <button
                            onClick={() => handleUpdateUserRole(u.id_usuario, u.id_rol === 1 ? 2 : 1)}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.7rem' }}
                          >
                            {u.id_rol === 1 ? 'HACER CLIENTE' : 'HACER ADMIN'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL PARA AGREGAR / EDITAR PRODUCTO */}
      {showProductModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border)', borderRadius: '12px', padding: '36px', maxWidth: '520px', width: '100%', position: 'relative' }}>
            <button onClick={() => setShowProductModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', marginBottom: '20px' }}>
              {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </h2>

            <form onSubmit={handleSaveProduct}>
              <div style={{ marginBottom: '14px' }}>
                <label className="auth-label">Nombre del Producto</label>
                <input
                  type="text"
                  className="auth-input"
                  value={productForm.nombre}
                  onChange={(e) => setProductForm({ ...productForm, nombre: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="auth-label">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="auth-input"
                    value={productForm.precio}
                    onChange={(e) => setProductForm({ ...productForm, precio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="auth-label">Stock</label>
                  <input
                    type="number"
                    className="auth-input"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label className="auth-label">Categoría</label>
                  <select
                    className="auth-input"
                    value={productForm.id_categoria}
                    onChange={(e) => setProductForm({ ...productForm, id_categoria: Number(e.target.value) })}
                  >
                    <option value={1}>Cerámica</option>
                    <option value={2}>Textiles</option>
                    <option value={3}>Iluminación</option>
                    <option value={4}>Muebles</option>
                    <option value={5}>Objetos</option>
                  </select>
                </div>
                <div>
                  <label className="auth-label">Etiqueta (Badge)</label>
                  <select
                    className="auth-input"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                  >
                    <option value="">Ninguna</option>
                    <option value="NUEVO">NUEVO</option>
                    <option value="MÁS VENDIDO">MÁS VENDIDO</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="auth-label">URL de Imagen</label>
                <input
                  type="text"
                  className="auth-input"
                  value={productForm.url_imagen}
                  onChange={(e) => setProductForm({ ...productForm, url_imagen: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label className="auth-label">Descripción</label>
                <textarea
                  className="auth-input"
                  value={productForm.descripcion}
                  onChange={(e) => setProductForm({ ...productForm, descripcion: e.target.value })}
                  rows={3}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="auth-btn" style={{ flex: 1 }}>
                  {editingProduct ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
                </button>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn-secondary" style={{ border: '1px solid var(--border)', padding: '14px' }}>
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
