-- ==========================================
-- NEXA E-COMMERCE DATABASE SETUP SCRIPT (FIXED)
-- ==========================================
-- Instrucciones: Copia y pega este script en el SQL Editor de Supabase.
-- Se usa CASCADE para evitar errores de dependencias de llaves foráneas.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. CLEANUP (Uso de CASCADE para evitar el error de la imagen del usuario)
DROP TABLE IF EXISTS detalles_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS direcciones_envio CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS mensajes_contacto CASCADE;
DROP TABLE IF EXISTS menus_laterales CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS metricas_diarias CASCADE;
DROP TABLE IF EXISTS qr_sessions CASCADE;

-- 1. ROLES TABLE
CREATE TABLE roles (
  id_rol SERIAL PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO roles (id_rol, nombre_rol) VALUES
(1, 'Admin'),
(2, 'Cliente')
ON CONFLICT (id_rol) DO NOTHING;

-- 2. USUARIOS TABLE
CREATE TABLE usuarios (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  id_rol INT REFERENCES roles(id_rol) DEFAULT 2,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. DIRECCIONES_ENVIO TABLE (Faltaba en el script anterior)
CREATE TABLE direcciones_envio (
  id_direccion SERIAL PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  calle_numero VARCHAR(255) NOT NULL,
  colonia VARCHAR(255) NOT NULL,
  ciudad VARCHAR(255) NOT NULL,
  codigo_postal VARCHAR(20) NOT NULL,
  telefono_contacto VARCHAR(20) NOT NULL
);

-- 4. CATEGORIAS TABLE
CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT
);

INSERT INTO categorias (id_categoria, nombre) VALUES
(1, 'Cerámica'),
(2, 'Textiles'),
(3, 'Iluminación'),
(4, 'Muebles'),
(5, 'Objetos')
ON CONFLICT (id_categoria) DO NOTHING;

-- 5. PRODUCTOS TABLE
CREATE TABLE productos (
  id_producto SERIAL PRIMARY KEY,
  id_categoria INT REFERENCES categorias(id_categoria) ON DELETE SET NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion_corta VARCHAR(255),
  descripcion_larga TEXT,
  precio NUMERIC(10, 2) NOT NULL,
  stock INT DEFAULT 10,
  url_imagen TEXT,
  badge VARCHAR(50),
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Products (Ajustado a la estructura original)
INSERT INTO productos (id_producto, nombre, descripcion_corta, precio, stock, id_categoria, url_imagen, badge) VALUES
(1, 'Bandeja de Travertino', 'Piedra natural tallada', 95.00, 15, 5, '/images/products/travertine_tray.png', 'NUEVO'),
(2, 'Mesa Auxiliar de Ratán', 'Tejida artesanalmente', 240.00, 8, 4, '/images/products/rattan_table.png', 'MÁS VENDIDO'),
(3, 'Jarrón de Cerámica Ceniza', 'Gres modelado a mano', 85.00, 20, 1, '/images/products/stoneware_vase.png', 'NUEVO'),
(5, 'Lámpara de Escritorio Latón', 'Base de mármol negro', 195.00, 6, 3, '/images/products/desk_lamp.png', 'MÁS VENDIDO'),
(7, 'Sofá Modular Verde Musgo', 'Textil de lana bouclé', 1150.00, 3, 4, '/images/products/green_sofa.png', 'MÁS VENDIDO');

-- 6. PEDIDOS TABLE
CREATE TABLE pedidos (
  id_pedido SERIAL PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  id_direccion INT REFERENCES direcciones_envio(id_direccion) ON DELETE SET NULL,
  fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  total NUMERIC(10, 2) NOT NULL,
  estado_pedido VARCHAR(50) DEFAULT 'Pendiente'
);

-- 7. DETALLES_PEDIDO TABLE
CREATE TABLE detalles_pedido (
  id_detalle SERIAL PRIMARY KEY,
  id_pedido INT REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  id_producto INT REFERENCES productos(id_producto) ON DELETE SET NULL,
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10, 2) NOT NULL
);

-- 8. MENSAJES_CONTACTO TABLE
CREATE TABLE mensajes_contacto (
  id_mensaje SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  leido BOOLEAN DEFAULT false,
  fecha_envio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. MENUS_LATERALES TABLE
CREATE TABLE menus_laterales (
  id_menu SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  url_destino VARCHAR(255),
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- 10. METRICAS_DIARIAS TABLE
CREATE TABLE metricas_diarias (
  id_metrica SERIAL PRIMARY KEY,
  fecha DATE UNIQUE DEFAULT CURRENT_DATE,
  total_ventas_dia NUMERIC(10, 2) DEFAULT 0.00,
  visitas_totales INT DEFAULT 0,
  pedidos_nuevos INT DEFAULT 0
);

-- 11. QR_SESSIONS TABLE (Crucial para el Reloj)
CREATE TABLE qr_sessions (
  token TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE direcciones_envio ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus_laterales ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_diarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas Públicas Básicas
CREATE POLICY "Lectura publica roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Lectura publica categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Lectura publica productos" ON productos FOR SELECT USING (true);
CREATE POLICY "Lectura publica menus" ON menus_laterales FOR SELECT USING (true);
CREATE POLICY "Registro publico usuarios" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Login publico usuarios" ON usuarios FOR SELECT USING (true);

-- POLÍTICAS CRÍTICAS PARA EL QR
-- Permitir que el servidor (Vercel) maneje los tokens
CREATE POLICY "Permitir gestion de QR" ON qr_sessions FOR ALL USING (true) WITH CHECK (true);

-- Permitir a usuarios ver/editar sus direcciones
CREATE POLICY "Usuarios gestionan sus direcciones" ON direcciones_envio FOR ALL USING (true) WITH CHECK (true);
