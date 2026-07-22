-- ==========================================
-- NEXA E-COMMERCE DATABASE SETUP SCRIPT
-- ==========================================
-- Instructions: Copy and paste this script directly into the 
-- SQL Editor of your Supabase project (https://database.new) 
-- and click "Run".

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS analytics;

-- 1. PRODUCTS TABLE
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  stock INT DEFAULT 10,
  featured BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 4.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ORDERS TABLE
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ORDER ITEMS TABLE
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

-- 4. CONTACT MESSAGES TABLE
CREATE TABLE contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. ANALYTICS TABLE
CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_views INT DEFAULT 0,
  total_sales NUMERIC(10, 2) DEFAULT 0.00,
  order_count INT DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE UNIQUE
);

-- SEED DATA: PRODUCTS
INSERT INTO products (name, description, price, image_url, category, stock, featured, rating) VALUES
('Nexa Watch Pro', 'Ultra smart watch with AMOLED screen, active health tracking, and 7-day battery life.', 199.99, '/images/products/nexa_watch.jpg', 'Wearables', 15, true, 4.8),
('AeroBuds Active', 'Premium active noise-cancelling earbuds with immersive sound and high-fidelity drivers.', 129.99, '/images/products/aerobuds.jpg', 'Audio', 24, true, 4.6),
('VoltPad Wireless Duo', '15W fast dual wireless charging pad made with recycled glassmorphism casing.', 49.99, '/images/products/voltpad.jpg', 'Accessories', 50, false, 4.4),
('Vortex Soundbar', 'Chambered home theater soundbar with Dolby Atmos and wireless sub-bass.', 299.99, '/images/products/vortex_soundbar.jpg', 'Audio', 8, true, 4.9),
('Spectra Keyboard', 'Hot-swappable mechanical keyboard with RGB backlit and silent tactile switches.', 89.99, '/images/products/spectra_keyboard.jpg', 'Accessories', 30, false, 4.5),
('Horizon Backpack', 'Waterproof tech travel pack with anti-theft compartments and USB charging port.', 79.99, '/images/products/horizon_backpack.jpg', 'Lifestyle', 18, false, 4.3);

-- SEED DATA: ANALYTICS (7-day history for dashboard display)
INSERT INTO analytics (date, page_views, total_sales, order_count) VALUES
(CURRENT_DATE - INTERVAL '6 days', 150, 450.00, 3),
(CURRENT_DATE - INTERVAL '5 days', 210, 780.00, 5),
(CURRENT_DATE - INTERVAL '4 days', 180, 540.00, 4),
(CURRENT_DATE - INTERVAL '3 days', 290, 1120.00, 7),
(CURRENT_DATE - INTERVAL '2 days', 340, 1580.00, 9),
(CURRENT_DATE - INTERVAL '1 day', 410, 1890.00, 11),
(CURRENT_DATE, 120, 329.98, 2)
ON CONFLICT (date) DO NOTHING;
