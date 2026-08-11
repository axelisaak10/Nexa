-- ─── CREACIÓN DE TABLAS PARA CARRITO Y FAVORITOS EN SUPABASE ─────────────────

-- 1. Tabla para guardar ítems del carrito de compras por usuario
CREATE TABLE IF NOT EXISTS carrito_items (
  id_carrito SERIAL PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_producto INT REFERENCES productos(id_producto) ON DELETE CASCADE,
  cantidad INT DEFAULT 1,
  fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_usuario, id_producto)
);

-- 2. Tabla para guardar lista de productos favoritos por usuario
CREATE TABLE IF NOT EXISTS favoritos (
  id_favorito SERIAL PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  id_producto INT REFERENCES productos(id_producto) ON DELETE CASCADE,
  fecha_agregado TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(id_usuario, id_producto)
);

-- 3. Deshabilitar RLS para permitir lectura y escritura desde la aplicación
ALTER TABLE carrito_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE favoritos DISABLE ROW LEVEL SECURITY;
