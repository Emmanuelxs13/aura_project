-- =====================================================================
-- AURA STORE - SCHEMA Y SEED DE ECOMMERCE
-- PostgreSQL 14+
-- =====================================================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'Customer' CHECK (role IN ('Administrator', 'Admin', 'Operador', 'Auditor', 'Customer')),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    slug VARCHAR(140) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Mac', 'iPad', 'iPhone', 'Audio', 'Displays', 'Accessories')),
    tagline VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    compare_at_price NUMERIC(12, 2) NULL CHECK (compare_at_price IS NULL OR compare_at_price > price),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    colorway VARCHAR(60) NOT NULL DEFAULT 'Midnight',
    specifications JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled')),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    shipping_name VARCHAR(120) NOT NULL,
    shipping_email VARCHAR(150) NOT NULL,
    shipping_address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price > 0),
    line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

INSERT INTO users (name, email, password_hash, role, status) VALUES
('Aura Admin', 'admin@aura.co', 'bdf0d8561a931ccc717c7257aca94839f0d7381fcafb19b8e0af5066f8b6b2e23f1acbc571f1e3e92ac88a2ece358a10ae327023c11289662b4cca06f5537fc8', 'Admin', 'Active'),
('Aura Client', 'client@aura.co', '900b27d9e64daa5d4e42b238ac0289cae4cdbefdf54ab56c6231494f906b2fb9713042062c1e75579f37b4f455884fc2971db49c59b3adf921517040232f5621', 'Customer', 'Active');

INSERT INTO products (name, slug, category, tagline, description, price, compare_at_price, stock, featured, colorway, specifications) VALUES
('iPhone 16 Pro', 'iphone-16-pro', 'iPhone', 'Titanium design. A18 Pro power.', 'The most advanced iPhone experience with pro cameras, long battery life, and a Super Retina XDR display.', 5299000.00, 5899000.00, 18, TRUE, 'Natural Titanium', '{"storage": "256GB", "display": "6.3\"", "chip": "A18 Pro"}'),
('MacBook Pro 14" M4 Pro', 'macbook-pro-14-m4-pro', 'Mac', 'Power for workflows that never slow down.', 'A compact pro notebook with a liquid retina XDR display, all-day battery, and workstation performance.', 11999000.00, 12999000.00, 12, TRUE, 'Space Black', '{"ram": "24GB", "ssd": "512GB", "chip": "M4 Pro"}'),
('iPad Pro 13" M4', 'ipad-pro-13-m4', 'iPad', 'Ultra-thin. Ultra-capable.', 'A cinematic canvas for creators with the M4 chip, OLED display, Apple Pencil support and desktop-grade multitasking.', 8999000.00, 9999000.00, 15, TRUE, 'Silver', '{"storage": "256GB", "display": "13\" Ultra Retina XDR", "chip": "M4"}'),
('Mac mini M4', 'mac-mini-m4', 'Mac', 'Small desktop. Big ambition.', 'A compact desktop with astonishing efficiency, multiple display support and fast SSD performance.', 3899000.00, 4299000.00, 22, FALSE, 'Silver', '{"ram": "16GB", "ssd": "512GB", "chip": "M4"}'),
('AirPods Pro 2', 'airpods-pro-2', 'Audio', 'Immersive sound with adaptive audio.', 'Pro-level active noise cancellation with a redesigned acoustic experience and MagSafe charging.', 1199000.00, 1399000.00, 40, TRUE, 'White', '{"battery": "30h", "chip": "H2", "case": "MagSafe"}'),
('Studio Display 27"', 'studio-display-27', 'Displays', 'Stunning Retina clarity for creators.', 'A 5K display with wide color, rich speakers and camera integration for premium studio work.', 8499000.00, 8999000.00, 7, FALSE, 'Silver', '{"resolution": "5K", "size": "27\"", "panel": "Retina"}'),
('Apple Watch Series 10', 'apple-watch-series-10', 'Accessories', 'A powerful companion on your wrist.', 'Fitness, health, notifications and elegant design with day-to-day battery and water resistance.', 2499000.00, 2799000.00, 30, FALSE, 'Jet Black', '{"case": "46mm", "health": "ECG", "battery": "18h"}'),
('Magic Keyboard with Touch ID', 'magic-keyboard-touch-id', 'Accessories', 'Typing that feels immediate.', 'A wireless keyboard with Touch ID, rechargeable battery and a precise, quiet typing experience.', 999000.00, 1199000.00, 28, FALSE, 'White', '{"connectivity": "Bluetooth", "battery": "1 month", "layout": "Spanish"}');

INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_email, shipping_address) VALUES
(1, 'Delivered', 18498000.00, 'Aura Admin', 'admin@aura.co', 'Bogota, Colombia'),
(2, 'Paid', 6598000.00, 'Aura Client', 'client@aura.co', 'Medellin, Colombia');

INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total) VALUES
(1, 2, 1, 11999000.00, 11999000.00),
(1, 5, 1, 1199000.00, 1199000.00),
(1, 8, 1, 999000.00, 999000.00),
(2, 1, 1, 5299000.00, 5299000.00),
(2, 5, 1, 1199000.00, 1199000.00),
(2, 7, 1, 2499000.00, 2499000.00);

-- Devices (assets) and maintenance logs for Admin inventory/support
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS devices CASCADE;

CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    serial_number VARCHAR(120) UNIQUE,
    status VARCHAR(40) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available','Assigned','In Repair','Retired')),
    purchase_price NUMERIC(12,2) NULL,
    purchase_date DATE NULL,
    specifications JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    device_id INT REFERENCES devices(id) ON DELETE CASCADE,
    code VARCHAR(60) NOT NULL,
    title VARCHAR(300) NOT NULL,
    area VARCHAR(120) NULL,
    maintenance_cost NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(40) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open','In Progress','Resolved','Closed')),
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO devices (model_name, category, serial_number, status, purchase_price, purchase_date, specifications) VALUES
('MacBook Pro 13" M1', 'Mac', 'SN-MBP-001', 'Available', 4500000.00, '2024-09-10', '{"ram":"16GB","ssd":"512GB"}'),
('iPhone 14 Pro Max', 'iPhone', 'SN-IP14-042', 'Assigned', 3200000.00, '2024-10-02', '{"color":"Natural Titanium","storage":"256GB"}');

INSERT INTO maintenance_logs (device_id, code, title, area, maintenance_cost, status, notes) VALUES
(1, 'INC-301', 'Bateria degradada', 'Ingenieria', 420000.00, 'Resolved', 'Reemplazo bajo garantia'),
(2, 'INC-302', 'Pantalla fisurada', 'Soporte', 780000.00, 'In Progress', 'Requiere autorizacion de compra');
