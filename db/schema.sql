-- =============================================================================
-- AURA STORE - ESQUEMA COMPLETO + DATOS DE PRUEBA
-- PostgreSQL 14+ | E-commerce de tecnologia premium
-- =============================================================================
-- USO: psql -U postgres -d aura_store -f db/schema.sql
-- =============================================================================

-- =============================================================================
-- 1. ELIMINAR TABLAS EXISTENTES (orden inverso a dependencias)
-- =============================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================================
-- 2. CREAR TABLAS
-- =============================================================================

-- -------------------------------------------------------------------------
-- 2.1 users - Usuarios del sistema (clientes + admins)
-- -------------------------------------------------------------------------
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'Customer'
        CHECK (role IN ('Administrator', 'Admin', 'Operador', 'Auditor', 'Customer')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
        CHECK (status IN ('Active', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 2.2 products - Catalogo de productos
-- -------------------------------------------------------------------------
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL
        CHECK (category IN ('Mac', 'iPad', 'iPhone', 'Audio', 'Displays', 'Accessories')),
    tagline VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    compare_at_price NUMERIC(12, 2) NULL
        CHECK (compare_at_price IS NULL OR compare_at_price > price),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    colorway VARCHAR(60) NOT NULL DEFAULT 'Midnight',
    specifications JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 2.3 orders - Pedidos de clientes
-- -------------------------------------------------------------------------
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending'
        CHECK (status IN ('Pending', 'Paid', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_name VARCHAR(120) NOT NULL,
    shipping_email VARCHAR(150) NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 2.4 order_items - Lineas de cada pedido
-- -------------------------------------------------------------------------
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------------------
-- 2.5 audit_logs - Trazabilidad de acciones de administradores
-- -------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    actor_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(120) NOT NULL,
    resource VARCHAR(120) NULL,
    resource_id VARCHAR(120) NULL,
    details JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- 3. INDICES
-- =============================================================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);

-- =============================================================================
-- 4. DATOS DE PRUEBA
-- =============================================================================

-- -------------------------------------------------------------------------
-- 4.1 Usuarios
-- Passwords (hasheadas con bcrypt, costo 12):
--   admin@aura.co       / admin123
--   client@aura.co      / client123
--   vendedor@aura.co    / vendedor123
--   editor@aura.co      / editor123
-- -------------------------------------------------------------------------
INSERT INTO users (name, email, password_hash, role, status) VALUES
('Aura Admin',      'admin@aura.co',    '$2a$12$feDgxMEZHFY2FsVXO5GDjOOdTdLQ6hFhrYxTe.ddm9eMvlzWkjDPK', 'Admin', 'Active'),
('Carlos Cliente',   'client@aura.co',   '$2a$12$C3/q2ckTOT3wBLE60PMJOeCLxkggJ7CiQp3acVWd6qVrqd3A01lzy', 'Customer', 'Active'),
('Maria Vendedora',  'vendedor@aura.co', '$2a$12$LdJ3HIZJEe6ZDoElwrm4juv.GkWMtIPCMzoaE2WW114yyzRZ63u5K', 'Operador', 'Active'),
('Pedro Editor',     'editor@aura.co',   '$2a$12$yhOs/WuM.WyTpjKfudPeIuYbY7mCaoIgEZM0R9wJqedhuV0S5Iq6K', 'Auditor', 'Active'),
('Laura Suspendida', 'laura@aura.co',    '$2a$12$C3/q2ckTOT3wBLE60PMJOeCLxkggJ7CiQp3acVWd6qVrqd3A01lzy', 'Customer', 'Suspended');

-- -------------------------------------------------------------------------
-- 4.2 Productos - iPhone
-- -------------------------------------------------------------------------
INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications) VALUES
('iPhone 16 Pro Max', 'iphone-16-pro-max', 'iPhone',
 'El iPhone mas potente jamas creado.',
 'Pantalla Super Retina XDR de 6.9 pulgadas, chip A18 Pro con GPU de 6 nucleos, sistema de camaras Pro con teleobjetivo de 5x, bateria para todo el dia y diseno en titanio.',
 6499000.00, 6999000.00, 15, TRUE, 'Titanio Natural',
 '{"storage": "256GB", "display": "6.9\"", "chip": "A18 Pro", "cameras": "48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto", "battery": "33h"}'),

('iPhone 16 Pro', 'iphone-16-pro', 'iPhone',
 'Titanio. Potencia. Pro.',
 'El iPhone mas versatil con camara de 48MP, chip A18 Pro, pantalla de 6.3 pulgadas y diseno en titanio de grado aeroespacial.',
 5299000.00, 5899000.00, 22, TRUE, 'Titanio Azul',
 '{"storage": "256GB", "display": "6.3\"", "chip": "A18 Pro", "cameras": "48MP Fusion + 12MP Ultra Wide + 12MP 3x Telephoto", "battery": "27h"}'),

('iPhone 16', 'iphone-16', 'iPhone',
 'Disenado para la inteligencia.',
 'Potencia y rendimiento con el chip A18, camara de 48MP con gran angular, boton de accion y Apple Intelligence integrado.',
 3999000.00, 4499000.00, 30, FALSE, 'Rosa',
 '{"storage": "128GB", "display": "6.1\"", "chip": "A18", "cameras": "48MP Fusion + 12MP Ultra Wide", "battery": "22h"}'),

('iPhone 15 Pro Max', 'iphone-15-pro-max', 'iPhone',
 'El iPhone mas premium de la generacion anterior.',
 'Pantalla de 6.7 pulgadas, chip A17 Pro, teleobjetivo de 5x y diseno en titanio. Una bestia a un precio increible.',
 4999000.00, 5699000.00, 8, FALSE, 'Titanio Blanco',
 '{"storage": "256GB", "display": "6.7\"", "chip": "A17 Pro", "cameras": "48MP + 12MP Ultra Wide + 12MP 5x Telephoto", "battery": "29h"}'),

('iPhone SE (3ra gen)', 'iphone-se-3gen', 'iPhone',
 'Potencia en un formato clasico.',
 'El chip A15 Bionic en el iPhone mas accesible. Camara de 12MP, Touch ID y 5G en un diseno compacto.',
 1999000.00, 2299000.00, 45, FALSE, 'Medianoche',
 '{"storage": "64GB", "display": "4.7\"", "chip": "A15 Bionic", "cameras": "12MP Wide", "battery": "15h"}');

-- -------------------------------------------------------------------------
-- 4.3 Productos - Mac
-- -------------------------------------------------------------------------
INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications) VALUES
('MacBook Pro 14" M4 Pro', 'macbook-pro-14-m4-pro',
 'Mac',
 'Potencia para flujos de trabajo sin limites.',
 'Workstation compacta con pantalla Liquid Retina XDR, chip M4 Pro de hasta 14 nucleos, bateria de hasta 22h y conectividad avanzada.',
 11999000.00, 12999000.00, 12, TRUE, 'Negro Espacial',
 '{"ram": "24GB", "ssd": "512GB", "chip": "M4 Pro (12 CPU + 16 GPU)", "display": "14.2\" Liquid Retina XDR", "battery": "22h"}'),

('MacBook Pro 16" M4 Max', 'macbook-pro-16-m4-max',
 'Mac',
 'Potencia de estacion de trabajo en una laptop.',
 'La maxima expresion de rendimiento portatil. Chip M4 Max de hasta 16 nucleos, pantalla de 16.2 pulgadas, hasta 128GB de memoria unificada.',
 17999000.00, 19999000.00, 5, TRUE, 'Negro Espacial',
 '{"ram": "48GB", "ssd": "1TB", "chip": "M4 Max (16 CPU + 40 GPU)", "display": "16.2\" Liquid Retina XDR", "battery": "21h"}'),

('MacBook Air 15" M4', 'macbook-air-15-m4',
 'Mac',
 'Ultra-delgada. Ultra-capaz.',
 'La laptop mas delgada del mundo con chip M4, pantalla Liquid Retina de 15.3 pulgadas, bateria de 18h y diseno sin ventilador.',
 8499000.00, 9299000.00, 20, FALSE, 'Plateado',
 '{"ram": "16GB", "ssd": "512GB", "chip": "M4 (10 CPU + 10 GPU)", "display": "15.3\" Liquid Retina", "battery": "18h"}'),

('Mac mini M4 Pro', 'mac-mini-m4-pro',
 'Mac',
 'Escritorio compacto. Ambicion gigante.',
 'El Mac mini mas potente jamas creado. Chip M4 Pro, conectividad Thunderbolt 5 y soporte para multiples pantallas.',
 5499000.00, 5999000.00, 18, FALSE, 'Plateado',
 '{"ram": "24GB", "ssd": "512GB", "chip": "M4 Pro (14 CPU + 20 GPU)", "connectivity": "Thunderbolt 5"}'),

('iMac 24" M4', 'imac-24-m4',
 'Mac',
 'Hecho para brillar.',
 'El all-in-one mas colorido con chip M4, pantalla 4.5K Retina de 24 pulgadas y siete colores vibrantes.',
 6999000.00, 7499000.00, 10, FALSE, 'Azul',
 '{"ram": "16GB", "ssd": "512GB", "chip": "M4 (10 CPU + 10 GPU)", "display": "24\" 4.5K Retina"}');

-- -------------------------------------------------------------------------
-- 4.4 Productos - iPad
-- -------------------------------------------------------------------------
INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications) VALUES
('iPad Pro 13" M4', 'ipad-pro-13-m4',
 'iPad',
 'Ultra-delgado. Ultra-capaz.',
 'El lienzo definitivo para creadores con chip M4, pantalla Ultra Retina XDR con tecnologia OLED tandem, Apple Pencil Pro y multitarea de escritorio.',
 8999000.00, 9999000.00, 14, TRUE, 'Plateado',
 '{"storage": "256GB", "display": "13\" Ultra Retina XDR (OLED)", "chip": "M4", "pencil": "Apple Pencil Pro"}'),

('iPad Pro 11" M4', 'ipad-pro-11-m4',
 'iPad',
 'Portatil. Potente. Pro.',
 'Toda la potencia del M4 en un formato de 11 pulgadas. Perfecto para creativos, profesionales y estudiantes avanzados.',
 7499000.00, 8299000.00, 10, FALSE, 'Negro Espacial',
 '{"storage": "256GB", "display": "11\" Ultra Retina XDR (OLED)", "chip": "M4", "pencil": "Apple Pencil Pro"}'),

('iPad Air 13" M2', 'ipad-air-13-m2',
 'iPad',
 'Mucho poder. Mucha pantalla. Mucho Air.',
 'El iPad Air mas grande con pantalla Liquid Retina de 13 pulgadas, chip M2, y compatibilidad con Apple Pencil Pro y Magic Keyboard.',
 5499000.00, 5999000.00, 20, FALSE, 'Purpura',
 '{"storage": "128GB", "display": "13\" Liquid Retina", "chip": "M2", "pencil": "Apple Pencil Pro"}'),

('iPad 10ma gen', 'ipad-10gen',
 'iPad',
 'Lo mejor de iPad. Para todos.',
 'El iPad con pantalla Liquid Retina de 10.9 pulgadas, chip A14 Bionic, USB-C y camara frontal ultra gran angular con Encuadre Centrado.',
 1999000.00, 2299000.00, 35, FALSE, 'Amarillo',
 '{"storage": "64GB", "display": "10.9\" Liquid Retina", "chip": "A14 Bionic", "connectivity": "USB-C"}');

-- -------------------------------------------------------------------------
-- 4.5 Productos - Audio
-- -------------------------------------------------------------------------
INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications) VALUES
('AirPods Pro 2', 'airpods-pro-2',
 'Audio',
 'Sonido immersivo con audio adaptativo.',
 'Cancelacion activa de ruido pro, audio adaptativo, deteccion de conversacion y carga MagSafe. El audio pro mas avanzado.',
 1199000.00, 1399000.00, 50, TRUE, 'Blanco',
 '{"battery": "30h", "chip": "H2", "case": "MagSafe USB-C", "water_resistance": "IPX4"}'),

('AirPods Max', 'airpods-max',
 'Audio',
 'Sonido over-ear de referencia.',
 'Audio de alta fidelidad con cancelacion activa de ruido, audio espacial personalizado y diseno over-ear con almohadillas de memory foam.',
 2799000.00, 2999000.00, 8, FALSE, 'Gris Espacial',
 '{"battery": "20h", "chip": "H1", "driver": "40mm Apple", "connectivity": "Bluetooth 5.0"}'),

('AirPods 4', 'airpods-4',
 'Audio',
 'Comodidad iconica. Sonido mejorado.',
 'Los AirPods mas comodos con audio espacial personalizado, chip H2, control por deslizamiento y resistencia al agua.',
 799000.00, 899000.00, 60, FALSE, 'Blanco',
 '{"battery": "30h", "chip": "H2", "water_resistance": "IPX4", "case": "USB-C"}'),

('HomePod mini', 'homepod-mini',
 'Audio',
 'Sonido grande. Tamano mini.',
 'Altavoz inteligente con sonido envolvente de 360 grados, chip S5, integracion con Shazam y control por voz con Siri.',
 549000.00, 649000.00, 25, FALSE, 'Blanco',
 '{"driver": "Full-range", "chip": "S5", "connectivity": "Wi-Fi 4, Bluetooth 5.0"}');

-- -------------------------------------------------------------------------
-- 4.6 Productos - Displays
-- -------------------------------------------------------------------------
INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications) VALUES
('Studio Display 27"', 'studio-display-27',
 'Displays',
 'Nitidez Retina para creadores.',
 'Monitor 5K con camara de 12MP con Encuadre Centrado, audio de seis altavoces, y tres microfonos de calidad estudio.',
 8499000.00, 8999000.00, 7, FALSE, 'Plateado',
 '{"resolution": "5K (5120x2880)", "size": "27\"", "panel": "IPS Retina", "brightness": "600 nits"}'),

('Pro Display XDR 32"', 'pro-display-xdr-32',
 'Displays',
 'El mejor monitor del mundo.',
 'Monitor de 32 pulgadas con retroiluminacion LED 2D y relacion de contraste de 1,000,000:1. Brillo de 1600 nits maximo.',
 14999000.00, 15999000.00, 3, FALSE, 'Negro',
 '{"resolution": "6K (6016x3384)", "size": "32\"", "panel": "IPS LCD with 576 blue LED zones", "brightness": "1600 nits peak"}');

-- -------------------------------------------------------------------------
-- 4.7 Productos - Accessories
-- -------------------------------------------------------------------------
INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications) VALUES
('Apple Watch Series 10', 'apple-watch-series-10',
 'Accessories',
 'El reloj mas completo. Para el dia a dia.',
 'Salud, fitness, notificaciones y diseno elegante. Pantalla mas grande y brillante, deteccion de apneas y carga rapida.',
 2499000.00, 2799000.00, 28, FALSE, 'Negro Jet',
 '{"case": "46mm", "display": "Always-On Retina LTPO3", "health": "ECG, SpO2, temperature", "battery": "36h"}'),

('Apple Watch Ultra 2', 'apple-watch-ultra-2',
 'Accessories',
 'Aventura sin limites.',
 'El reloj mas robusto con caja de titanio, pantalla de hasta 3000 nits, GPS de precision y boton de accion personalizable.',
 3499000.00, 3999000.00, 10, TRUE, 'Titanio',
 '{"case": "49mm", "display": "Always-On Retina LTPO3 (3000 nits)", "health": "ECG, SpO2, temperature, depth", "battery": "72h"}'),

('Magic Keyboard with Touch ID', 'magic-keyboard-touch-id',
 'Accessories',
 'Escribir que se siente inmediato.',
 'Teclado inalambrico con Touch ID, bateria recargable y experiencia de escritura precisa y silenciosa.',
 999000.00, 1199000.00, 32, FALSE, 'Blanco',
 '{"connectivity": "Bluetooth + USB-C", "battery": "1 month", "layout": "ANSI Spanish"}'),

('Magic Mouse', 'magic-mouse',
 'Accessories',
 'Superficie Multi-Touch. Sin cables.',
 'Mouse inalambrico con superficie Multi-Touch, bateria recargable y diseno ergonomico de una sola pieza.',
 599000.00, 699000.00, 40, FALSE, 'Blanco',
 '{"connectivity": "Bluetooth + USB-C", "battery": "1 month", "sensor": "Laser"}'),

('Apple Pencil Pro', 'apple-pencil-pro',
 'Accessories',
 'El lapiz mas magico.',
 'Nuevo sensor de presion con apretar, giro del barril, retroalimentacion haptica y carga inalambrica.',
 699000.00, 799000.00, 18, FALSE, 'Blanco',
 '{"compatibility": "iPad Pro M4, iPad Air M2", "charging": "Wireless", "sensors": "Squeeze, Barrel roll, Haptic"}'),

('MagSafe Charger', 'magsafe-charger',
 'Accessories',
 'Carga inalambrica. Rapida y facil.',
 'Cargador inalambrico MagSafe con alineacion magnetica perfecta y carga rapida de hasta 15W para iPhone.',
 249000.00, 299000.00, 55, FALSE, 'Blanco',
 '{"power": "15W", "standard": "Qi2", "cable": "USB-C, 1m"}');

-- -------------------------------------------------------------------------
-- 4.8 Pedidos de ejemplo (para metricas del dashboard)
-- -------------------------------------------------------------------------
INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_email, shipping_address) VALUES
(1, 'Delivered', 18498000.00, 'Admin Aura', 'admin@aura.co', 'Carrera 15 # 88-10, Bogota, Colombia'),
(2, 'Delivered', 16788000.00, 'Carlos Cliente', 'client@aura.co', 'Calle 50 # 20-30, Medellin, Colombia'),
(2, 'Delivered', 5299000.00,  'Carlos Cliente', 'client@aura.co', 'Calle 50 # 20-30, Medellin, Colombia'),
(1, 'Delivered', 999000.00,   'Admin Aura', 'admin@aura.co', 'Carrera 15 # 88-10, Bogota, Colombia'),
(2, 'Processing', 25997000.00,'Carlos Cliente', 'client@aura.co', 'Calle 50 # 20-30, Medellin, Colombia'),
(1, 'Paid', 8999000.00,       'Admin Aura', 'admin@aura.co', 'Carrera 15 # 88-10, Bogota, Colombia'),
(4, 'Shipped', 11999000.00,   'Pedro Editor', 'editor@aura.co', 'Av. El Poblado # 5-15, Medellin, Colombia'),
(1, 'Pending', 1999000.00,    'Admin Aura', 'admin@aura.co', 'Carrera 15 # 88-10, Bogota, Colombia'),
(2, 'Delivered', 6999000.00,  'Carlos Cliente', 'client@aura.co', 'Calle 50 # 20-30, Medellin, Colombia'),
(1, 'Cancelled', 5499000.00,  'Admin Aura', 'admin@aura.co', 'Carrera 15 # 88-10, Bogota, Colombia'),
(2, 'Paid', 1999000.00,       'Carlos Cliente', 'client@aura.co', 'Calle 50 # 20-30, Medellin, Colombia'),
(3, 'Delivered', 3499000.00,  'Maria Vendedora', 'vendedor@aura.co', 'Cra 45 # 23-12, Cali, Colombia'),
(1, 'Processing', 799000.00,  'Admin Aura', 'admin@aura.co', 'Carrera 15 # 88-10, Bogota, Colombia');

-- -------------------------------------------------------------------------
-- 4.9 Items de los pedidos
-- -------------------------------------------------------------------------
INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total) VALUES
-- Pedido 1: MacBook Pro + AirPods Pro + Magic Keyboard
(1, 6,  1, 11999000.00, 11999000.00),
(1, 16, 1, 1199000.00,  1199000.00),
(1, 21, 1, 999000.00,   999000.00),
-- Pedido 2: iPad Pro M4 + AirPods Pro + Apple Pencil Pro
(2, 12, 1, 8999000.00,  8999000.00),
(2, 16, 1, 1199000.00,  1199000.00),
(2, 24, 1, 699000.00,   699000.00),
(2, 23, 1, 599000.00,   599000.00),
-- Pedido 3: iPhone 16 Pro (Carlos)
(3, 2,  1, 5299000.00,  5299000.00),
-- Pedido 4: Magic Keyboard (Admin)
(4, 21, 1, 999000.00,   999000.00),
-- Pedido 5: MacBook Pro M4 Max + Studio Display
(5, 7,  1, 17999000.00, 17999000.00),
(5, 19, 1, 8499000.00,  8499000.00),
-- Pedido 6: iPad Pro M4 (Admin)
(6, 12, 1, 8999000.00,  8999000.00),
-- Pedido 7: MacBook Pro M4 Pro (Pedro)
(7, 6,  1, 11999000.00, 11999000.00),
-- Pedido 8: iPhone SE
(8, 5,  1, 1999000.00,  1999000.00),
-- Pedido 9: iMac 24 M4
(9, 11, 1, 6999000.00,  6999000.00),
-- Pedido 10: Mac mini M4 Pro (cancelled)
(10, 10, 1, 5499000.00, 5499000.00),
-- Pedido 11: iPad 10gen
(11, 15, 1, 1999000.00, 1999000.00),
-- Pedido 12: Apple Watch Ultra 2
(12, 20, 1, 3499000.00, 3499000.00),
-- Pedido 13: AirPods 4
(13, 18, 1, 799000.00,  799000.00);

-- -------------------------------------------------------------------------
-- 4.10 Auditoria de ejemplo
-- -------------------------------------------------------------------------
INSERT INTO audit_logs (actor_id, action, resource, resource_id, details) VALUES
(1, 'CREATE_PRODUCT', 'products', '1',  '{"name": "iPhone 16 Pro Max", "category": "iPhone"}'::jsonb),
(1, 'UPDATE_PRODUCT', 'products', '3',  '{"price": {"old": 4299000, "new": 3999000}}'::jsonb),
(1, 'UPDATE_USER_ROLE', 'users', '3',   '{"role": {"old": "Customer", "new": "Operador"}}'::jsonb),
(1, 'UPDATE_ORDER_STATUS', 'orders', '5','{"status": {"old": "Paid", "new": "Processing"}}'::jsonb),
(1, 'SUSPEND_USER', 'users', '5',       '{"reason": "Fraude detectado"}'::jsonb);

-- =============================================================================
-- 5. VERIFICACION
-- =============================================================================
SELECT 'ESQUEMA CREADO CORRECTAMENTE' AS mensaje;
SELECT 'Usuarios:    ' || COUNT(*)::TEXT FROM users;
SELECT 'Productos:   ' || COUNT(*)::TEXT FROM products;
SELECT 'Pedidos:     ' || COUNT(*)::TEXT FROM orders;
SELECT 'Items:       ' || COUNT(*)::TEXT FROM order_items;
SELECT 'Auditorias:  ' || COUNT(*)::TEXT FROM audit_logs;
