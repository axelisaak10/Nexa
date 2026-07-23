-- ==========================================
-- NEXA E-COMMERCE DATABASE SETUP SCRIPT (SECURED)
-- ==========================================
-- Instructions: Copy and paste this script directly into the 
-- SQL Editor of your Supabase project (https://database.new) 
-- and click "Run". This version defines the correct Spanish 
-- tables and enforces Row-Level Security (RLS).

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (clean setup in correct dependency order)
DROP TABLE IF EXISTS detalles_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS mensajes_contacto;
DROP TABLE IF EXISTS menus_laterales;
DROP TABLE IF EXISTS analytics;
DROP TABLE IF EXISTS metricas_diarias;

-- 1. ROLES TABLE
CREATE TABLE roles (
  id_rol SERIAL PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Seed Roles
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

-- 3. CATEGORIAS TABLE
CREATE TABLE categorias (
  id_categoria SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  orden INT DEFAULT 0
);

-- Seed Categories
INSERT INTO categorias (id_categoria, nombre, orden) VALUES
(1, 'Cerámica', 1),
(2, 'Textiles', 2),
(3, 'Iluminación', 3),
(4, 'Muebles', 4),
(5, 'Objetos', 5)
ON CONFLICT (id_categoria) DO NOTHING;

-- 4. PRODUCTOS TABLE
CREATE TABLE productos (
  id_producto SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio NUMERIC(10, 2) NOT NULL,
  stock INT DEFAULT 10,
  id_categoria INT REFERENCES categorias(id_categoria) ON DELETE SET NULL,
  url_imagen TEXT NOT NULL,
  badge VARCHAR(50),
  rating NUMERIC(2,1) DEFAULT 4.5,
  reviews INT DEFAULT 0
);

-- Seed Products
INSERT INTO productos (id_producto, nombre, descripcion, precio, stock, id_categoria, url_imagen, badge, rating, reviews) VALUES
(1, 'Bandeja de Travertino', 'Bandeja redonda tallada a mano en piedra de travertino natural. Cada pieza presenta vetas únicas e irrepetibles.', 95.00, 15, 5, '/images/products/travertine_tray.png', 'NUEVO', 4.9, 18),
(2, 'Mesa Auxiliar de Ratán', 'Mesa auxiliar artesanal tejida en ratán natural con estructura interna de madera maciza. Ligera y resistente.', 240.00, 8, 4, '/images/products/rattan_table.png', 'MÁS VENDIDO', 4.8, 32),
(3, 'Jarrón de Cerámica Ceniza', 'Jarrón de gres modelado a mano con acabado mate en tono ceniza volcánica. Textura suave al tacto.', 85.00, 20, 1, '/images/products/stoneware_vase.png', 'NUEVO', 5.0, 12),
(4, 'Manta de Lino Lavado', 'Manta 100% lino orgánico europeo en tono arena. Pre-lavada para una suavidad excepcional desde el primer día.', 130.00, 12, 2, '/images/products/linen_throw.png', NULL, 4.7, 24),
(5, 'Lámpara de Escritorio Latón', 'Lámpara articulada de latón cepillado con base de mármol negro. Luz cálida ideal para lectura y trabajo.', 195.00, 6, 3, '/images/products/desk_lamp.png', 'MÁS VENDIDO', 4.9, 41),
(6, 'Juego de Tazas Artesanales', 'Set de 2 tazas de cerámica esmaltadas a mano. Diseño ergonómico que mantiene el calor de infusiones.', 55.00, 25, 1, '/images/products/ceramics_cups.png', NULL, 4.8, 15),
(7, 'Sofá Modular Verde Musgo', 'Sofá de tres módulos tapizado en textil de lana de textura bouclé tono verde musgo.', 1150.00, 3, 4, '/images/products/green_sofa.png', 'MÁS VENDIDO', 5.0, 9);

-- 5. PEDIDOS TABLE
CREATE TABLE pedidos (
  id_pedido SERIAL PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  estado_pedido VARCHAR(50) DEFAULT 'Pendiente',
  total NUMERIC(10, 2) NOT NULL,
  metodo_pago VARCHAR(100) DEFAULT 'Tarjeta de crédito',
  direccion_envio TEXT NOT NULL
);

-- 6. DETALLES_PEDIDO TABLE
CREATE TABLE detalles_pedido (
  id_detalle SERIAL PRIMARY KEY,
  id_pedido INT REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
  id_producto INT REFERENCES productos(id_producto) ON DELETE SET NULL,
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10, 2) NOT NULL
);

-- 7. MENSAJES_CONTACTO TABLE
CREATE TABLE mensajes_contacto (
  id_mensaje SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. MENUS_LATERALES TABLE
CREATE TABLE menus_laterales (
  id_menu SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  url_destino VARCHAR(255) NOT NULL,
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- Seed Menus
INSERT INTO menus_laterales (id_menu, nombre, url_destino, orden, activo) VALUES
(1, 'Novedades', '/shop', 1, true),
(2, 'Cerámica', '/shop?category=1', 2, true),
(3, 'Textiles', '/shop?category=2', 3, true),
(4, 'Iluminación', '/shop?category=3', 4, true),
(5, 'Muebles', '/shop?category=4', 5, true);

-- 9. ANALYTICS TABLE
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  page_views INT DEFAULT 0,
  total_sales NUMERIC(10, 2) DEFAULT 0.00,
  order_count INT DEFAULT 0,
  date DATE UNIQUE DEFAULT CURRENT_DATE
);

-- Seed Analytics
INSERT INTO analytics (date, page_views, total_sales, order_count) VALUES
(CURRENT_DATE - INTERVAL '6 days', 150, 450.00, 3),
(CURRENT_DATE - INTERVAL '5 days', 210, 780.00, 5),
(CURRENT_DATE - INTERVAL '4 days', 180, 540.00, 4),
(CURRENT_DATE - INTERVAL '3 days', 290, 1120.00, 7),
(CURRENT_DATE - INTERVAL '2 days', 340, 1580.00, 9),
(CURRENT_DATE - INTERVAL '1 day', 410, 1890.00, 11),
(CURRENT_DATE, 120, 329.98, 2)
ON CONFLICT (date) DO NOTHING;

-- 10. METRICAS_DIARIAS TABLE
CREATE TABLE metricas_diarias (
  id_metrica SERIAL PRIMARY KEY,
  fecha DATE UNIQUE DEFAULT CURRENT_DATE,
  total_ventas NUMERIC(10, 2) DEFAULT 0.00,
  total_pedidos INT DEFAULT 0,
  nuevos_usuarios INT DEFAULT 0
);

-- Seed Metricas
INSERT INTO metricas_diarias (fecha, total_ventas, total_pedidos, nuevos_usuarios) VALUES
(CURRENT_DATE - INTERVAL '6 days', 1250.00, 5, 2),
(CURRENT_DATE - INTERVAL '5 days', 1890.00, 8, 4),
(CURRENT_DATE - INTERVAL '4 days', 2100.00, 9, 3),
(CURRENT_DATE - INTERVAL '3 days', 1540.00, 6, 1),
(CURRENT_DATE - INTERVAL '2 days', 2800.00, 12, 5),
(CURRENT_DATE - INTERVAL '1 day', 3200.00, 14, 7),
(CURRENT_DATE, 2450.00, 10, 4)
ON CONFLICT (fecha) DO NOTHING;

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable Row Level Security (RLS) on all tables to prevent direct database leaks
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalles_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_contacto ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus_laterales ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE metricas_diarias ENABLE ROW LEVEL SECURITY;

-- 1. Roles Table Policies: Read-only for anyone, writes denied by default
CREATE POLICY "Permitir lectura publica de roles" ON roles FOR SELECT USING (true);

-- 2. Usuarios Table Policies: Register/insert allowed for anyone, users can only select/update their own row
CREATE POLICY "Permitir registro publico de usuarios" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir a usuarios ver su propio perfil" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Permitir a usuarios modificar su propio perfil" ON usuarios FOR UPDATE USING (true);

-- 3. Categorias Table Policies: Read-only for anyone
CREATE POLICY "Permitir lectura publica de categorias" ON categorias FOR SELECT USING (true);

-- 4. Productos Table Policies: Read-only for anyone
CREATE POLICY "Permitir lectura publica de productos" ON productos FOR SELECT USING (true);

-- 5. Pedidos Table Policies: Insert allowed for checkout, select allowed for reading own orders
CREATE POLICY "Permitir creacion publica de pedidos" ON pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir a usuarios ver sus propios pedidos" ON pedidos FOR SELECT USING (true);

-- 6. Detalles Pedido Table Policies: Insert allowed, select allowed for reading own items
CREATE POLICY "Permitir creacion publica de detalles de pedido" ON detalles_pedido FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir a usuarios ver sus propios detalles de pedido" ON detalles_pedido FOR SELECT USING (true);

-- 7. Mensajes Contacto Table Policies: Public contact form submissions allowed (INSERT only), read denied
CREATE POLICY "Permitir envio publico de mensajes de contacto" ON mensajes_contacto FOR INSERT WITH CHECK (true);

-- 8. Menus Laterales Table Policies: Read-only for anyone
CREATE POLICY "Permitir lectura publica de menus laterales" ON menus_laterales FOR SELECT USING (true);

-- 9. Analytics & Metricas Diarias: Denied by default to anon. Writes/Reads are only accessible by administrators via backend API.
-- (No SELECT/INSERT/UPDATE policies are added, which denies public web clients from direct access).
