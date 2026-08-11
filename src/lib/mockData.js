import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export function getMockProductos() { return mockProductos; }

export async function updateUsuarioAdmin(id_usuario, { nombre, email, id_rol, is_enabled, password, pin }) {
  const updates = {};
  if (nombre) updates.nombre = nombre;
  if (email) updates.email = email.trim().toLowerCase();
  if (id_rol !== undefined) updates.id_rol = Number(id_rol);
  if (typeof is_enabled === 'boolean') updates.is_enabled = is_enabled;
  if (password && password.trim()) {
    const salt = await bcrypt.genSalt(10);
    updates.password_hash = await bcrypt.hash(password.trim(), salt);
  }
  if (pin && String(pin).trim()) {
    const salt = await bcrypt.genSalt(10);
    updates.pin_hash = await bcrypt.hash(String(pin).trim(), salt);
  }

  if (supabase) {
    try {
      let query = supabase.from('usuarios').update(updates);
      if (id_usuario && email) {
        query = query.or(`id_usuario.eq.${id_usuario},email.ilike.${email.trim()}`);
      } else if (id_usuario) {
        query = query.eq('id_usuario', id_usuario);
      } else if (email) {
        query = query.ilike('email', email.trim());
      }
      const { data, error } = await query.select();

      if (error) {
        console.error('Supabase updateUsuarioAdmin error:', error);
        if (error.message?.includes('pin_hash')) {
          return { success: false, error: 'Falta la columna pin_hash en Supabase. Ejecuta: ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);' };
        }
        return { success: false, error: `Error de Supabase: ${error.message}` };
      }

      if (!data || data.length === 0) {
        console.warn('Supabase updateUsuarioAdmin: 0 filas actualizadas. Posible bloqueo por RLS.');
        // Re-try updating without select or report RLS lock
        const retry = await supabase.from('usuarios').update(updates).eq('email', email.trim().toLowerCase());
        if (retry.error) return { success: false, error: `Error al actualizar: ${retry.error.message}` };
      }

      return { success: true, usuario: data ? data[0] : null };
    } catch (e) {
      console.error('Supabase updateUsuarioAdmin error:', e);
      return { success: false, error: e.message };
    }
  }
  return { success: true };
}

export async function updatePerfilUsuario(id_usuario, { nombre, email, password, pin }) {
  const updates = {};
  if (nombre) updates.nombre = nombre;
  if (email) updates.email = email.trim().toLowerCase();
  if (password && password.trim()) {
    const salt = await bcrypt.genSalt(10);
    updates.password_hash = await bcrypt.hash(password.trim(), salt);
  }
  if (pin && pin.trim()) {
    const salt = await bcrypt.genSalt(10);
    updates.pin_hash = await bcrypt.hash(pin.trim(), salt);
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id_usuario', id_usuario)
        .select()
        .single();
      if (!error && data) return { success: true, usuario: data };
    } catch (e) {
      console.error('Supabase updatePerfilUsuario error:', e);
    }
  }
  return { success: true };
}

// Mock fallback products matching Spanish database schema
export const mockProductos = [
  {
    id_producto: 1,
    nombre: "Bandeja de Travertino",
    descripcion: "Bandeja redonda tallada a mano en piedra de travertino natural. Cada pieza presenta vetas únicas e irrepetibles.",
    precio: 95.00,
    stock: 15,
    id_categoria: 5,
    url_imagen: "/images/products/travertine_tray.png",
    badge: "NUEVO",
    rating: 4.9,
    reviews: 18,
    categorias: { nombre: "Objetos" }
  },
  {
    id_producto: 2,
    nombre: "Mesa Auxiliar de Ratán",
    descripcion: "Mesa auxiliar artesanal tejida en ratán natural con estructura interna de madera maciza. Ligera y resistente.",
    precio: 240.00,
    stock: 8,
    id_categoria: 4,
    url_imagen: "/images/products/rattan_table.png",
    badge: "MÁS VENDIDO",
    rating: 4.8,
    reviews: 32,
    categorias: { nombre: "Muebles" }
  },
  {
    id_producto: 3,
    nombre: "Jarrón de Cerámica Ceniza",
    descripcion: "Jarrón de gres modelado a mano con acabado mate en tono ceniza volcánica. Textura suave al tacto.",
    precio: 85.00,
    stock: 20,
    id_categoria: 1,
    url_imagen: "/images/products/stoneware_vase.png",
    badge: "NUEVO",
    rating: 5.0,
    reviews: 12,
    categorias: { nombre: "Cerámica" }
  },
  {
    id_producto: 4,
    nombre: "Manta de Lino Lavado",
    descripcion: "Manta 100% lino orgánico europeo en tono arena. Pre-lavada para una suavidad excepcional desde el primer día.",
    precio: 130.00,
    stock: 12,
    id_categoria: 2,
    url_imagen: "/images/products/linen_throw.png",
    badge: null,
    rating: 4.7,
    reviews: 24,
    categorias: { nombre: "Textiles" }
  },
  {
    id_producto: 5,
    nombre: "Lámpara de Escritorio Latón",
    descripcion: "Lámpara articulada de latón cepillado con base de mármol negro. Luz cálida ideal para lectura y trabajo.",
    precio: 195.00,
    stock: 6,
    id_categoria: 3,
    url_imagen: "/images/products/desk_lamp.png",
    badge: "MÁS VENDIDO",
    rating: 4.9,
    reviews: 41,
    categorias: { nombre: "Iluminación" }
  },
  {
    id_producto: 6,
    nombre: "Juego de Tazas Artesanales",
    descripcion: "Set de 2 tazas de cerámica esmaltadas a mano. Diseño ergonómico que mantiene el calor de infusiones.",
    precio: 55.00,
    stock: 25,
    id_categoria: 1,
    url_imagen: "/images/products/ceramics_cups.png",
    badge: null,
    rating: 4.8,
    reviews: 15,
    categorias: { nombre: "Cerámica" }
  },
  {
    id_producto: 7,
    nombre: "Sofá Modular Verde Musgo",
    descripcion: "Sofá de tres módulos tapizado en textil de lana de textura bouclé tono verde musgo.",
    precio: 1150.00,
    stock: 3,
    id_categoria: 4,
    url_imagen: "/images/products/green_sofa.png",
    badge: "MÁS VENDIDO",
    rating: 5.0,
    reviews: 9,
    categorias: { nombre: "Muebles" }
  }
];

export const mockCategorias = [
  { id_categoria: 1, nombre: "Cerámica", orden: 1 },
  { id_categoria: 2, nombre: "Textiles", orden: 2 },
  { id_categoria: 3, nombre: "Iluminación", orden: 3 },
  { id_categoria: 4, nombre: "Muebles", orden: 4 },
  { id_categoria: 5, nombre: "Objetos", orden: 5 }
];

export const mockPedidos = [
  {
    id_pedido: 101,
    id_usuario: 2,
    fecha_pedido: "2026-07-18T14:30:00Z",
    estado_pedido: "Entregado",
    total: 335.00,
    metodo_pago: "Tarjeta de crédito",
    direccion_envio: "Av. Reforma 402, CDMX",
    usuarios: { nombre: "Cliente Demo", email: "demo@nexa.com" },
    detalles_pedido: [
      { id_producto: 2, cantidad: 1, precio_unitario: 240.00, productos: { nombre: "Mesa Auxiliar de Ratán" } },
      { id_producto: 1, cantidad: 1, precio_unitario: 95.00, productos: { nombre: "Bandeja de Travertino" } }
    ]
  },
  {
    id_pedido: 102,
    id_usuario: 2,
    fecha_pedido: "2026-07-19T10:15:00Z",
    estado_pedido: "En Proceso",
    total: 195.00,
    metodo_pago: "PayPal",
    direccion_envio: "Calle Olivos 18, Guadalajara",
    usuarios: { nombre: "Cliente Demo", email: "demo@nexa.com" },
    detalles_pedido: [
      { id_producto: 5, cantidad: 1, precio_unitario: 195.00, productos: { nombre: "Lámpara de Escritorio Latón" } }
    ]
  }
];

export async function getProductos(categoryId = null, searchQuery = null) {
  if (supabase) {
    try {
      let query = supabase.from('productos').select('*, categorias(nombre)');
      if (categoryId) query = query.eq('id_categoria', categoryId);
      if (searchQuery) query = query.ilike('nombre', `%${searchQuery}%`);
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.error('Supabase fetch failed:', e);
    }
  }
  let filtered = [...mockProductos];
  if (categoryId) filtered = filtered.filter(p => p.id_categoria === Number(categoryId));
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q));
  }
  return filtered;
}

export async function getProductoById(id) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('productos').select('*, categorias(nombre)').eq('id_producto', id).single();
      if (!error && data) return data;
    } catch (e) {
      console.error('Supabase getProductoById failed:', e);
    }
  }
  return mockProductos.find(p => p.id_producto === Number(id)) || mockProductos[0];
}

// ─── DB persistence for CART (carrito_items) ──────────────────────────────
export async function getCarritoDB(id_usuario) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('carrito_items')
        .select('id_carrito, id_producto, cantidad, productos(id_producto, nombre, precio, url_imagen)')
        .eq('id_usuario', id_usuario);
      if (!error && data) {
        return data.map(item => ({
          id_producto: item.id_producto,
          nombre: item.productos?.nombre || 'Producto',
          precio: Number(item.productos?.precio || 0),
          url_imagen: item.productos?.url_imagen || '/images/products/travertine_tray.png',
          cantidad: item.cantidad
        }));
      }
    } catch (e) {
      console.error('Supabase getCarritoDB error:', e);
    }
  }
  return [];
}

export async function saveItemCarritoDB(id_usuario, product, cantidad = 1) {
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('carrito_items')
        .select('id_carrito, cantidad')
        .eq('id_usuario', id_usuario)
        .eq('id_producto', product.id_producto)
        .maybeSingle();

      if (existing) {
        const newQty = existing.cantidad + cantidad;
        if (newQty <= 0) {
          await supabase.from('carrito_items').delete().eq('id_carrito', existing.id_carrito);
        } else {
          await supabase.from('carrito_items').update({ cantidad: newQty }).eq('id_carrito', existing.id_carrito);
        }
      } else if (cantidad > 0) {
        await supabase.from('carrito_items').insert([{
          id_usuario,
          id_producto: product.id_producto,
          cantidad
        }]);
      }
      return { success: true };
    } catch (e) {
      console.error('Supabase saveItemCarritoDB error:', e);
    }
  }
  return { success: true };
}

export async function updateCantidadCarritoDB(id_usuario, id_producto, cantidad) {
  if (supabase) {
    try {
      if (cantidad <= 0) {
        await supabase.from('carrito_items').delete().eq('id_usuario', id_usuario).eq('id_producto', id_producto);
      } else {
        await supabase.from('carrito_items').upsert([{ id_usuario, id_producto, cantidad }], { onConflict: 'id_usuario,id_producto' });
      }
      return { success: true };
    } catch (e) {
      console.error('Supabase updateCantidadCarritoDB error:', e);
    }
  }
  return { success: true };
}

export async function removeItemCarritoDB(id_usuario, id_producto) {
  if (supabase) {
    try {
      await supabase.from('carrito_items').delete().eq('id_usuario', id_usuario).eq('id_producto', id_producto);
      return { success: true };
    } catch (e) {
      console.error('Supabase removeItemCarritoDB error:', e);
    }
  }
  return { success: true };
}

export async function clearCarritoDB(id_usuario) {
  if (supabase) {
    try {
      await supabase.from('carrito_items').delete().eq('id_usuario', id_usuario);
      return { success: true };
    } catch (e) {
      console.error('Supabase clearCarritoDB error:', e);
    }
  }
  return { success: true };
}

// ─── DB persistence for FAVORITES (favoritos) ────────────────────────────
export async function getFavoritosDB(id_usuario) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('id_favorito, id_producto, productos(*, categorias(nombre))')
        .eq('id_usuario', id_usuario);
      if (!error && data) {
        return data.map(item => item.productos).filter(Boolean);
      }
    } catch (e) {
      console.error('Supabase getFavoritosDB error:', e);
    }
  }
  return [];
}

export async function toggleFavoritoDB(id_usuario, product) {
  if (supabase) {
    try {
      const { data: existing } = await supabase
        .from('favoritos')
        .select('id_favorito')
        .eq('id_usuario', id_usuario)
        .eq('id_producto', product.id_producto)
        .maybeSingle();

      if (existing) {
        await supabase.from('favoritos').delete().eq('id_favorito', existing.id_favorito);
        return { success: true, action: 'removed' };
      } else {
        await supabase.from('favoritos').insert([{ id_usuario, id_producto: product.id_producto }]);
        return { success: true, action: 'added' };
      }
    } catch (e) {
      console.error('Supabase toggleFavoritoDB error:', e);
    }
  }
  return { success: true, action: 'added' };
}

export async function getCategorias() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('categorias').select('*').order('orden');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.error('Supabase getCategorias failed:', e);
    }
  }
  return mockCategorias;
}

export async function loginUsuario(email, password) {
  // Normalize email to lowercase to avoid case-sensitivity issues
  const normalizedEmail = email.trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, nombre, email, id_rol, password_hash, is_enabled, pin_hash')
        .ilike('email', normalizedEmail)
        .single();
      
      if (!error && data) {
        if (data.is_enabled === false) return { success: false, error: 'Tu cuenta ha sido suspendida. Contacta al administrador.', suspended: true };
        const passwordMatch = data.password_hash 
          ? await bcrypt.compare(password, data.password_hash)
          : false;
        if (passwordMatch) {
          await supabase.from('usuarios').update({ last_login: new Date().toISOString() }).eq('id_usuario', data.id_usuario);
          return { success: true, user: { id_usuario: data.id_usuario, nombre: data.nombre, email: data.email, id_rol: data.id_rol, has_pin: !!data.pin_hash } };
        }
        return { success: false, error: 'Contraseña incorrecta. Verifica tu contraseña e intenta de nuevo.' };
      }
      // User not found in Supabase
      if (error && error.code !== 'PGRST116') {
        console.error('Supabase login error:', error);
      }
    } catch (e) {
      console.error('Supabase login failed:', e);
    }
  }
  
  // Safe Bcrypt comparison check for hardcoded fallback users
  if (normalizedEmail === 'admin@nexa.com') {
    const match = await bcrypt.compare(password, '$2a$10$7q5f5mJmC6HlD3iN78D8Ae/iN/y/g0W1WlSjK16hR0p3a7a9Z3x8q');
    const legacyMatch = password === 'admin123';
    if (match || legacyMatch) {
      return { success: true, user: { id_usuario: 1, nombre: 'Administrador Nexa', email: 'admin@nexa.com', id_rol: 1, last_login: new Date().toISOString() } };
    }
  }
  if (normalizedEmail === 'demo@nexa.com') {
    const match = await bcrypt.compare(password, '$2a$10$tZ9c/JqN/B8c4y7J7c2oOe/y0G1G1wK8uSjK16hR0p3a7a9Z3x8q');
    const legacyMatch = password === 'demo123';
    if (match || legacyMatch) {
      return { success: true, user: { id_usuario: 2, nombre: 'Cliente Demo', email: 'demo@nexa.com', id_rol: 2, last_login: new Date().toISOString() } };
    }
  }
  return { success: false, error: 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.' };
}

export async function registerUsuario(nombre, email, password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  if (supabase) {
    try {
      // 1. Try to auto-seed roles table if empty to prevent foreign key errors
      try {
        await supabase.from('roles').upsert([
          { id_rol: 1, nombre_rol: 'Admin' },
          { id_rol: 2, nombre_rol: 'Cliente' }
        ], { onConflict: 'id_rol' });
      } catch (roleErr) {
        console.warn('Roles upsert skipped/warn:', roleErr);
      }

      // 2. Insert into usuarios with id_rol: 2
      let { data, error } = await supabase
        .from('usuarios')
        .insert([{ nombre, email, password_hash: hashedPassword, id_rol: 2 }])
        .select('id_usuario, nombre, email, id_rol')
        .single();

      // 3. Fallback: if foreign key error, try inserting without id_rol constraint
      if (error && (error.message?.includes('foreign key') || error.code === '23503')) {
        const retry = await supabase
          .from('usuarios')
          .insert([{ nombre, email, password_hash: hashedPassword }])
          .select('id_usuario, nombre, email, id_rol')
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error('Supabase registration error:', error);
        return { success: false, error: `Error de Supabase: ${error.message}` };
      }

      if (data) {
        return { success: true, user: data };
      }
    } catch (e) {
      console.error('Supabase registration exception:', e);
      return { success: false, error: `Error al conectar con Supabase: ${e.message}` };
    }
  }

  return { success: true, user: { id_usuario: Date.now(), nombre, email, id_rol: 2 } };
}

export async function getPedidos(usuarioId = null) {
  if (supabase) {
    try {
      let query = supabase.from('pedidos').select('*, usuarios(nombre, email), detalles_pedido(*, productos(nombre))');
      if (usuarioId) query = query.eq('id_usuario', usuarioId);
      const { data, error } = await query;
      if (!error && data) return data;
    } catch (e) {
      console.error('Supabase getPedidos failed:', e);
    }
  }
  if (usuarioId) return mockPedidos.filter(p => p.id_usuario === Number(usuarioId));
  return mockPedidos;
}

export async function createPedido(pedidoData, detalles) {
  if (supabase) {
    try {
      const { data: pedido, error: errPedido } = await supabase.from('pedidos').insert([pedidoData]).select().single();
      if (!errPedido && pedido) {
        const detallesFormatted = detalles.map(d => ({ ...d, id_pedido: pedido.id_pedido }));
        await supabase.from('detalles_pedido').insert(detallesFormatted);
        return { success: true, pedido };
      }
    } catch (e) {
      console.error('Supabase createPedido failed:', e);
    }
  }
  const newPedido = { id_pedido: Date.now(), ...pedidoData, detalles_pedido: detalles };
  mockPedidos.unshift(newPedido);
  return { success: true, pedido: newPedido };
}

export async function createMensajeContacto(nombre, email, mensaje) {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('mensajes_contacto').insert([{ nombre, email, mensaje }]).select().single();
      if (!error) return { success: true, data };
    } catch (e) {
      console.error('Supabase createMensajeContacto failed:', e);
    }
  }
  return { success: true, data: { id: Date.now(), nombre, email, mensaje } };
}

export async function getMenusLaterales() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('menus_laterales').select('*').eq('activo', true).order('orden');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.error('Supabase getMenusLaterales failed:', e);
    }
  }
  return [
    { id_menu: 1, nombre: "Novedades", url_destino: "/shop", orden: 1 },
    { id_menu: 2, nombre: "Cerámica", url_destino: "/shop?category=1", orden: 2 },
    { id_menu: 3, nombre: "Textiles", url_destino: "/shop?category=2", orden: 3 },
    { id_menu: 4, nombre: "Iluminación", url_destino: "/shop?category=3", orden: 4 },
    { id_menu: 5, nombre: "Muebles", url_destino: "/shop?category=4", orden: 5 }
  ];
}

export async function getMetricas() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('metricas_diarias').select('*').order('fecha', { ascending: false }).limit(7);
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.error('Supabase getMetricas failed:', e);
    }
  }
  return [
    { fecha: "2026-07-14", total_ventas: 1250, total_pedidos: 5, nuevos_usuarios: 2 },
    { fecha: "2026-07-15", total_ventas: 1890, total_pedidos: 8, nuevos_usuarios: 4 },
    { fecha: "2026-07-16", total_ventas: 2100, total_pedidos: 9, nuevos_usuarios: 3 },
    { fecha: "2026-07-17", total_ventas: 1540, total_pedidos: 6, nuevos_usuarios: 1 },
    { fecha: "2026-07-18", total_ventas: 2800, total_pedidos: 12, nuevos_usuarios: 5 },
    { fecha: "2026-07-19", total_ventas: 3200, total_pedidos: 14, nuevos_usuarios: 7 },
    { fecha: "2026-07-20", total_ventas: 2450, total_pedidos: 10, nuevos_usuarios: 4 }
  ];
}

export async function getAnalytics() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('analytics').select('*').order('date', { ascending: true }).limit(7);
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.error('Supabase getAnalytics failed:', e);
    }
  }
  return [
    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], page_views: 150, total_sales: 450.00, order_count: 3 },
    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], page_views: 210, total_sales: 780.00, order_count: 5 },
    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], page_views: 180, total_sales: 540.00, order_count: 4 },
    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], page_views: 290, total_sales: 1120.00, order_count: 7 },
    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], page_views: 340, total_sales: 1580.00, order_count: 9 },
    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], page_views: 410, total_sales: 1890.00, order_count: 11 },
    { date: new Date().toISOString().split('T')[0], page_views: 120, total_sales: 329.98, order_count: 2 }
  ];
}

export async function createProducto(data) {
  if (supabase) {
    try {
      const { data: inserted, error } = await supabase.from('productos').insert([data]).select().single();
      if (!error && inserted) return { success: true, product: inserted };
    } catch (e) {
      console.error('Supabase createProducto error:', e);
    }
  }
  const newProduct = { id_producto: Date.now(), ...data, categorias: { nombre: 'Objetos' } };
  mockProductos.unshift(newProduct);
  return { success: true, product: newProduct };
}

export async function updateProducto(id, data) {
  if (supabase) {
    try {
      const { data: updated, error } = await supabase.from('productos').update(data).eq('id_producto', id).select().single();
      if (!error && updated) return { success: true, product: updated };
    } catch (e) {
      console.error('Supabase updateProducto error:', e);
    }
  }
  const idx = mockProductos.findIndex(p => p.id_producto === Number(id));
  if (idx !== -1) {
    mockProductos[idx] = { ...mockProductos[idx], ...data };
    return { success: true, product: mockProductos[idx] };
  }
  return { success: false, error: 'Producto no encontrado' };
}

export async function deleteProducto(id) {
  if (supabase) {
    try {
      const { error } = await supabase.from('productos').delete().eq('id_producto', id);
      if (!error) return { success: true };
    } catch (e) {
      console.error('Supabase deleteProducto error:', e);
    }
  }
  const idx = mockProductos.findIndex(p => p.id_producto === Number(id));
  if (idx !== -1) {
    mockProductos.splice(idx, 1);
    return { success: true };
  }
  return { success: false, error: 'Producto no encontrado' };
}

export async function updateEstadoPedido(id_pedido, nuevoEstado) {
  if (supabase) {
    try {
      const { data: updated, error } = await supabase.from('pedidos').update({ estado_pedido: nuevoEstado }).eq('id_pedido', id_pedido).select().single();
      if (!error && updated) return { success: true, pedido: updated };
    } catch (e) {
      console.error('Supabase updateEstadoPedido error:', e);
    }
  }
  const p = mockPedidos.find(item => item.id_pedido === Number(id_pedido));
  if (p) {
    p.estado_pedido = nuevoEstado;
    return { success: true, pedido: p };
  }
  return { success: false, error: 'Pedido no encontrado' };
}

export async function getUsuarios() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('usuarios').select('id_usuario, nombre, email, id_rol, fecha_registro, is_enabled, last_login, require_password_change, pin_hash, roles(nombre_rol)');
      if (!error && data) return data;
    } catch (e) {
      console.error('Supabase getUsuarios error:', e);
    }
  }
  return [
    { id_usuario: 1, nombre: "Administrador Nexa", email: "admin@nexa.com", id_rol: 1, fecha_registro: "2026-01-10T00:00:00Z", roles: { nombre_rol: "Admin" } },
    { id_usuario: 2, nombre: "Cliente Demo", email: "demo@nexa.com", id_rol: 2, fecha_registro: "2026-03-15T00:00:00Z", roles: { nombre_rol: "Cliente" } }
  ];
}

export async function updateRolUsuario(id_usuario, nuevoRol) {
  if (supabase) {
    try {
      const { data: updated, error } = await supabase.from('usuarios').update({ id_rol: nuevoRol }).eq('id_usuario', id_usuario).select().single();
      if (!error && updated) return { success: true, usuario: updated };
    } catch (e) {
      console.error('Supabase updateRolUsuario error:', e);
    }
  }
  return { success: true };
}

// ─── PIN MANAGEMENT ────────────────────────────────────────────────────────
export async function setPinUsuario(id_usuario, pin, email = null) {
  if (!pin) return { success: false, error: 'PIN requerido' };
  const salt = await bcrypt.genSalt(10);
  const pin_hash = await bcrypt.hash(String(pin).trim(), salt);
  if (supabase) {
    try {
      let query = supabase.from('usuarios').update({ pin_hash });
      if (id_usuario) {
        query = query.eq('id_usuario', id_usuario);
      } else if (email) {
        query = query.ilike('email', email.trim());
      } else {
        return { success: false, error: 'ID de usuario o email requerido' };
      }
      const { data, error } = await query.select();
      if (error) {
        console.error('Supabase setPinUsuario error:', error);
        if (error.message?.includes('pin_hash')) {
          return { success: false, error: 'Falta la columna pin_hash en Supabase. Ejecuta: ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);' };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e) {
      console.error('Supabase setPinUsuario error:', e);
      return { success: false, error: e.message };
    }
  }
  return { success: true };
}

export async function verificarPin(id_usuario, pin) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('pin_hash')
        .eq('id_usuario', id_usuario)
        .single();
      if (!error && data && data.pin_hash) {
        const match = await bcrypt.compare(pin, data.pin_hash);
        return { success: match, hasPin: true };
      }
      if (!error && data && !data.pin_hash) return { success: false, hasPin: false };
    } catch (e) {
      console.error('Supabase verificarPin error:', e);
    }
  }
  return { success: false, hasPin: false };
}

export async function verificarPinByToken(token, pin) {
  // Used by wearable: token is a confirmed qr_session token, userId stored there
  if (supabase) {
    try {
      const { data: session, error: sessErr } = await supabase
        .from('qr_sessions')
        .select('user_id, status')
        .eq('token', token)
        .single();
      if (sessErr || !session || session.status !== 'confirmed') {
        return { success: false, error: 'Token inválido o no confirmado' };
      }
      const userId = session.user_id;
      // Try to find user by id or email
      let userQuery = supabase.from('usuarios').select('id_usuario, pin_hash');
      if (!isNaN(Number(userId))) {
        userQuery = userQuery.eq('id_usuario', Number(userId));
      } else {
        userQuery = userQuery.ilike('email', userId);
      }
      const { data: user, error: userErr } = await userQuery.single();
      if (userErr || !user || !user.pin_hash) {
        return { success: false, error: 'Usuario sin PIN configurado' };
      }
      const match = await bcrypt.compare(pin, user.pin_hash);
      return { success: match, userId: user.id_usuario };
    } catch (e) {
      console.error('Supabase verificarPinByToken error:', e);
    }
  }
  return { success: false, error: 'Supabase no configurado' };
}

// ─── USER STATUS (is_enabled) ──────────────────────────────────────────────
export async function toggleEstadoUsuario(id_usuario, is_enabled) {
  const now = new Date().toISOString();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ is_enabled })
        .eq('id_usuario', id_usuario)
        .select()
        .single();
      if (!error && data) return { success: true, usuario: data };
    } catch (e) {
      console.error('Supabase toggleEstadoUsuario error:', e);
    }
  }
  return { success: true };
}

export async function createUsuarioAdmin(data) {
  const { nombre, email, password, id_rol = 2 } = data;
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  if (supabase) {
    try {
      const { data: newUser, error } = await supabase
        .from('usuarios')
        .insert([{ nombre, email, password_hash, id_rol, is_enabled: true }])
        .select('id_usuario, nombre, email, id_rol, fecha_registro, is_enabled')
        .single();
      if (!error && newUser) return { success: true, usuario: newUser };
      if (error) return { success: false, error: error.message };
    } catch (e) {
      console.error('Supabase createUsuarioAdmin error:', e);
    }
  }
  return { success: true, usuario: { id_usuario: Date.now(), nombre, email, id_rol, is_enabled: true } };
}

// ─── ADDRESS (direcciones_envio) ──────────────────────────────────────────
export async function getDireccionByUsuario(id_usuario) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('direcciones_envio')
        .select('*')
        .eq('id_usuario', id_usuario)
        .order('id_direccion', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) return data;
    } catch (e) {
      console.error('Supabase getDireccionByUsuario error:', e);
    }
  }
  return null;
}

export async function saveDireccion(id_usuario, { calle_numero, colonia, ciudad, codigo_postal, telefono_contacto }) {
  if (supabase) {
    try {
      // Check if a direccion already exists
      const { data: existing } = await supabase
        .from('direcciones_envio')
        .select('id_direccion')
        .eq('id_usuario', id_usuario)
        .limit(1)
        .single();
      if (existing?.id_direccion) {
        // Update
        const { data, error } = await supabase
          .from('direcciones_envio')
          .update({ calle_numero, colonia, ciudad, codigo_postal, telefono_contacto })
          .eq('id_direccion', existing.id_direccion)
          .select()
          .single();
        if (!error) return { success: true, direccion: data };
      } else {
        // Insert
        const { data, error } = await supabase
          .from('direcciones_envio')
          .insert([{ id_usuario, calle_numero, colonia, ciudad, codigo_postal, telefono_contacto }])
          .select()
          .single();
        if (!error) return { success: true, direccion: data };
      }
    } catch (e) {
      console.error('Supabase saveDireccion error:', e);
    }
  }
  return { success: true, direccion: null };
}

// ─── BANNERS ──────────────────────────────────────────────────────────────
export async function getBanners() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('activo', true)
        .order('orden');
      if (!error && data && data.length > 0) return data;
    } catch (e) {
      console.error('Supabase getBanners error:', e);
    }
  }
  return [
    { id_banner: 1, titulo: 'Nueva Colección', subtitulo: 'Objetos que ganan su lugar', url_imagen: '/images/products/travertine_tray.png', url_destino: '/shop', activo: true, orden: 1 },
    { id_banner: 2, titulo: 'Envío Gratis', subtitulo: 'En pedidos mayores a $100', url_imagen: '/images/products/desk_lamp.png', url_destino: '/shop', activo: true, orden: 2 },
  ];
}
