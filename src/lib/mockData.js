import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id_usuario, nombre, email, id_rol, password_hash')
        .eq('email', email)
        .single();
      
      if (!error && data) {
        if (data.password_hash === password || !data.password_hash) {
          return { success: true, user: data };
        }
        return { success: false, error: 'Contraseña incorrecta para este usuario.' };
      }
    } catch (e) {
      console.error('Supabase login failed:', e);
    }
  }
  if (email === 'admin@nexa.com') {
    return { success: true, user: { id_usuario: 1, nombre: 'Administrador Nexa', email: 'admin@nexa.com', id_rol: 1 } };
  }
  if (email === 'demo@nexa.com') {
    return { success: true, user: { id_usuario: 2, nombre: 'Cliente Demo', email: 'demo@nexa.com', id_rol: 2 } };
  }
  return { success: false, error: 'Correo o contraseña incorrectos. Verifica tus datos o usa una cuenta demo.' };
}

export async function registerUsuario(nombre, email, password) {
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
        .insert([{ nombre, email, password_hash: password, id_rol: 2 }])
        .select('id_usuario, nombre, email, id_rol')
        .single();

      // 3. Fallback: if foreign key error, try inserting without id_rol constraint
      if (error && (error.message?.includes('foreign key') || error.code === '23503')) {
        const retry = await supabase
          .from('usuarios')
          .insert([{ nombre, email, password_hash: password }])
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
      const { data, error } = await supabase.from('usuarios').select('id_usuario, nombre, email, id_rol, fecha_registro, roles(nombre_rol)');
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
