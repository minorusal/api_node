CREATE TABLE IF NOT EXISTS raw_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    thickness_mm DECIMAL(10,2),
    width_m DECIMAL(10,2),
    length_m DECIMAL(10,2),
    price DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS material_attributes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(255),
    FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

CREATE TABLE IF NOT EXISTS accessories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS accessory_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    accessory_id INT NOT NULL,
    material_id INT NOT NULL,
    quantity INT,
    width_m DECIMAL(10,2),
    length_m DECIMAL(10,2),
    FOREIGN KEY (accessory_id) REFERENCES accessories(id),
    FOREIGN KEY (material_id) REFERENCES raw_materials(id)
);

CREATE TABLE IF NOT EXISTS playsets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS playset_accessories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playset_id INT NOT NULL,
    accessory_id INT NOT NULL,
    quantity INT,
    FOREIGN KEY (playset_id) REFERENCES playsets(id),
    FOREIGN KEY (accessory_id) REFERENCES accessories(id)
);
