-- =====================================================================
-- PROYECTO AURA - SCRIPT DE RESPALDO Y CREACION DE BASE DE DATOS
-- RDBMS: PostgreSQL 14+
-- =====================================================================

DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'Operator' CHECK (role IN ('Administrator', 'Operator', 'Auditor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE devices (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Mac', 'iPad', 'iPhone', 'Audio', 'Displays')),
    serial_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(30) DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'In Maintenance', 'Retired')),
    purchase_price NUMERIC(12, 2) NOT NULL CHECK (purchase_price > 0),
    purchase_date DATE NOT NULL CHECK (purchase_date <= CURRENT_DATE),
    specifications JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    user_id INT NULL REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP WITH TIME ZONE NULL,
    notes TEXT NULL,
    CONSTRAINT chk_dates CHECK (returned_at IS NULL OR returned_at >= assigned_at)
);

CREATE TABLE maintenance_logs (
    id SERIAL PRIMARY KEY,
    device_id INT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    issue_description TEXT NOT NULL,
    maintenance_cost NUMERIC(10, 2) DEFAULT 0.00 CHECK (maintenance_cost >= 0),
    started_at DATE NOT NULL,
    resolved_at DATE NULL,
    CONSTRAINT chk_maint_dates CHECK (resolved_at IS NULL OR resolved_at >= started_at)
);

CREATE INDEX idx_devices_category ON devices(category);
CREATE INDEX idx_devices_status ON devices(status);
CREATE INDEX idx_assignments_dates ON assignments(assigned_at, returned_at);

INSERT INTO users (name, email, password_hash, role) VALUES
('Juan Camilo Silva', 'juan.silva@aura.co', '$2b$10$SleekHashForTestingPurposesOnly12345', 'Administrator'),
('Carolina Mendoza', 'caro.mendoza@aura.co', '$2b$10$SleekHashForTestingPurposesOnly67890', 'Operator');

INSERT INTO devices (model_name, category, serial_number, status, purchase_price, purchase_date, specifications) VALUES
('MacBook Pro 16" M3 Max', 'Mac', 'C02FX4H0Q05D', 'Assigned', 15499000.00, '2025-01-15', '{"ram": "64GB", "ssd": "1TB", "chip": "M3 Max"}'),
('MacBook Air 15" M3', 'Mac', 'C02JX7G1Q05E', 'Available', 6899000.00, '2025-03-10', '{"ram": "16GB", "ssd": "512GB", "chip": "M3"}'),
('iPad Pro 13" M4', 'iPad', 'DLXFX7H1Q05F', 'In Maintenance', 5999000.00, '2025-06-20', '{"display": "OLED", "storage": "256GB"}'),
('iPhone 15 Pro Max', 'iPhone', 'G6TFX8H2Q05G', 'Assigned', 5299000.00, '2025-02-14', '{"color": "Titanio Natural", "storage": "256GB"}'),
('Studio Display 27"', 'Displays', 'C02HX9A1Q05H', 'Available', 8499000.00, '2024-11-02', '{"panel": "5K Retina"}');

INSERT INTO assignments (device_id, user_id, assigned_at, returned_at) VALUES
(1, 1, '2025-01-16 08:00:00-05', NULL),
(4, 2, '2025-02-15 09:30:00-05', NULL);

INSERT INTO maintenance_logs (device_id, issue_description, maintenance_cost, started_at, resolved_at) VALUES
(3, 'Falla en modulo de carga Thunderbolt', 450000.00, '2026-01-10', NULL);
