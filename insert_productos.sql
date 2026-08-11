-- =============================================================================
-- SCRIPT DE INSERCIÓN DE NUEVOS PRODUCTOS PARA SUPABASE (NEXA E-COMMERCE)
-- Copia y ejecuta este script en el SQL Editor de Supabase
-- =============================================================================

-- 1. Asegurar Categorías Existentes
INSERT INTO categorias (id_categoria, nombre, orden) VALUES
  (1, 'Cerámica', 1),
  (2, 'Textiles', 2),
  (3, 'Iluminación', 3),
  (4, 'Muebles', 4),
  (5, 'Objetos', 5)
ON CONFLICT (id_categoria) DO NOTHING;

-- 2. Insertar Colección Ampliada de Productos Curados
INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, url_imagen, badge, rating, reviews) VALUES
  -- Cerámica
  ('Set de Platos de Barro Negro', 'Vajilla artesanal de 4 piezas elaborada en barro negro de Oaxaca con pulido natural.', 120.00, 15, 1, '/images/products/stoneware_vase.png', 'NUEVO', 4.9, 12),
  ('Taza Escultórica Ocre', 'Taza de gres modelada con asa curva minimalista y esmalte ocre semimate.', 45.00, 30, 1, '/images/products/ceramics_cups.png', NULL, 4.8, 25),
  ('Cuenco de Cerámica Raku', 'Cuenco decorativo elaborado con la técnica ancestral Raku, efecto craquelado único.', 78.00, 10, 1, '/images/products/stoneware_vase.png', 'EXCLUSIVO', 5.0, 8),
  
  -- Textiles
  ('Cojín de Algodón Orgánico', 'Cojín tejido en telar de cintura con hilos teñidos naturalmente en tono terracota.', 65.00, 20, 2, '/images/products/linen_throw.png', 'MÁS VENDIDO', 4.9, 34),
  ('Tapete Artístico Berber', 'Tapete 100% lana pura de oveja anudado a mano con patrones geométricos étnicos.', 380.00, 5, 2, '/images/products/linen_throw.png', 'NUEVO', 4.9, 19),
  ('Camino de Mesa de Lino', 'Camino de mesa artesanal en lino natural de alta densidad con remate deshilado.', 52.00, 18, 2, '/images/products/linen_throw.png', NULL, 4.7, 14),

  -- Iluminación
  ('Lámpara de Colgar Palma', 'Lámpara colgante tejida a mano por artesanos en palma silvestre. Proyecta sombra cálida.', 160.00, 12, 3, '/images/products/desk_lamp.png', 'NUEVO', 4.8, 22),
  ('Lámpara de Pie Ópalo', 'Lámpara de suelo con globo de vidrio soplado opalino y estructura de acero negro.', 290.00, 7, 3, '/images/products/desk_lamp.png', 'MÁS VENDIDO', 5.0, 16),
  ('Vela Escultórica de Cera de Abeja', 'Vela de cera 100% pura de abeja sin refinar con aroma natural a miel y mecha de algodón.', 35.00, 40, 3, '/images/products/travertine_tray.png', NULL, 4.9, 50),

  -- Muebles
  ('Sillón Lounge Madera de Nogal', 'Sillón bajo con estructura maciza de nogal americano y cojinería en piel sintética suave.', 680.00, 4, 4, '/images/products/rattan_table.png', 'EXCLUSIVO', 5.0, 11),
  ('Banca Artesanal Tejida', 'Banca de entrada en maderal de encino con tejido cruzado de cordón de algodón.', 210.00, 9, 4, '/images/products/rattan_table.png', 'NUEVO', 4.8, 7),
  ('Estantería Modular Mínima', 'Estante de pared en madera de pino cepillado con soportes de latón envejecido.', 175.00, 14, 4, '/images/products/rattan_table.png', NULL, 4.6, 29),

  -- Objetos
  ('Espejo Marco de Bronce', 'Espejo de mesa o pared circular con marco de bronce fundido y pátina oscura.', 145.00, 11, 5, '/images/products/travertine_tray.png', 'NUEVO', 4.9, 15),
  ('Reloj de Pared Mármol Negro', 'Reloj de pared analógico de 30cm esculpido en bloque de mármol negro Monterrey.', 185.00, 8, 5, '/images/products/travertine_tray.png', 'MÁS VENDIDO', 4.8, 27),
  ('Caja de Almacenaje Madera', 'Caja organizadora de madera de cedro con tapa deslizante e interiores acolchados.', 68.00, 22, 5, '/images/products/travertine_tray.png', NULL, 4.7, 18);
