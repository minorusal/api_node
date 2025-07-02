CREATE TABLE IF NOT EXISTS raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    thickness_mm DECIMAL(10,2),
    width_m DECIMAL(10,2),
    length_m DECIMAL(10,2),
    price DECIMAL(10,2),
    material_type_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS material_attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

CREATE TABLE IF NOT EXISTS accessories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accessory_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accessory_id INT NOT NULL,
    material_id INT NOT NULL,
    costo DECIMAL(10,2),
    porcentaje_ganancia DECIMAL(5,2),
    precio DECIMAL(10,2),
    quantity INT,
    width_m DECIMAL(10,2),
    length_m DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    owner_id INT,
    FOREIGN KEY (accessory_id) REFERENCES accessories(id),
    FOREIGN KEY (material_id) REFERENCES raw_materials(id),
    FOREIGN KEY (owner_id) REFERENCES owner_companies(id)
);

CREATE TABLE IF NOT EXISTS playsets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS playset_accessories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playset_id INT NOT NULL,
    accessory_id INT NOT NULL,
    quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (playset_id) REFERENCES playsets(id),
    FOREIGN KEY (accessory_id) REFERENCES accessories(id)
);

CREATE TABLE IF NOT EXISTS accessory_components (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_accessory_id INT NOT NULL,
    child_accessory_id INT NOT NULL,
    quantity INT,
    cost DECIMAL(10,2),
    price DECIMAL(10,2),
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_accessory_id) REFERENCES accessories(id),
    FOREIGN KEY (child_accessory_id) REFERENCES accessories(id),
    FOREIGN KEY (owner_id) REFERENCES owner_companies(id)
);

-- Tabla de ejemplo para almacenar operaciones básicas
CREATE TABLE IF NOT EXISTS demo_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numA DECIMAL(10,2) NOT NULL,
    numB DECIMAL(10,2) NOT NULL,
    resultado DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    contact_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(100),
    address TEXT,
    requires_invoice BOOLEAN DEFAULT FALSE,
    billing_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    playset_id INT NOT NULL,
    sale_price DECIMAL(10,2),
    contact_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (playset_id) REFERENCES playsets(id)
);


/* ──────────── raw_materials ──────────── */
ALTER TABLE raw_materials
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── material_attributes ──────────── */
ALTER TABLE material_attributes
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── accessories ──────────── */
ALTER TABLE accessories
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── accessory_materials ──────────── */
ALTER TABLE accessory_materials
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── playsets ──────────── */
ALTER TABLE playsets
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── playset_accessories ──────────── */
ALTER TABLE playset_accessories
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── demo_table ──────────── */
ALTER TABLE demo_table
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── clients ──────────── */
ALTER TABLE clients
  ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                               ON UPDATE CURRENT_TIMESTAMP;

/* ──────────── projects ──────────── */
ALTER TABLE projects
  ADD COLUMN contact_email VARCHAR(100),
  ADD COLUMN created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS remissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    data JSON NOT NULL,
    pdf_path VARCHAR(255) NOT NULL,
    recipient_type ENUM('owner','client') DEFAULT 'owner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS owner_companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    profit_percentage DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS installation_costs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    workers INT,
    days INT,
    meal_per_person DECIMAL(10,2),
    hotel_per_day DECIMAL(10,2),
    labor_cost DECIMAL(10,2),
    personal_transport DECIMAL(10,2),
    local_transport DECIMAL(10,2),
    extra_expenses DECIMAL(10,2),
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (owner_id) REFERENCES owner_companies(id)
);

CREATE TABLE IF NOT EXISTS menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    path VARCHAR(255),
    parent_id INT,
    owner_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES menus(id),
    FOREIGN KEY (owner_id) REFERENCES owner_companies(id)
);
CREATE TABLE IF NOT EXISTS accessory_pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accessory_id INT NOT NULL,
    owner_id INT NOT NULL,
    markup_percentage DECIMAL(10,2) DEFAULT 0,
    total_materials_price DECIMAL(10,2) DEFAULT 0,
    total_accessories_price DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (accessory_id) REFERENCES accessories(id),
    FOREIGN KEY (owner_id) REFERENCES owner_companies(id)
);

/* ──────────── Asociaciones con owner ──────────── */
ALTER TABLE raw_materials
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);
ALTER TABLE raw_materials
  ADD COLUMN material_type_id INT,
  ADD CONSTRAINT FOREIGN KEY (material_type_id) REFERENCES material_types(id);

ALTER TABLE material_attributes
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

ALTER TABLE accessories
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

-- owner_id column included in initial table definition

ALTER TABLE playsets
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

ALTER TABLE playset_accessories
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

ALTER TABLE demo_table
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

ALTER TABLE clients
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

ALTER TABLE projects
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

ALTER TABLE remissions
  ADD COLUMN owner_id INT,
  ADD CONSTRAINT FOREIGN KEY (owner_id) REFERENCES owner_companies(id);

ALTER TABLE remissions
  ADD COLUMN recipient_type ENUM('owner','client') DEFAULT 'owner';

ALTER TABLE owner_companies
  ADD COLUMN profit_percentage DECIMAL(10,2) DEFAULT 0;

ALTER TABLE owner_companies
  ADD COLUMN logo_path VARCHAR(255);

ALTER TABLE accessory_components
  ADD COLUMN cost DECIMAL(10,2),
  ADD COLUMN price DECIMAL(10,2);
