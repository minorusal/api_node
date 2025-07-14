const db = require('../db');
const ownerCompanyModel = require('./ownerCompaniesModel');

const createMaterial = async (materialData) => {
    const { name, description, material_type_id, owner_id, purchase_price, attributes } = materialData;
    
    const ownerCompany = await ownerCompanyModel.getOwnerCompanyById(owner_id);
    const profitPercentage = ownerCompany ? ownerCompany.profit_percentage : 0;
    const sale_price = purchase_price * (1 + profitPercentage / 100);

    const sql = `INSERT INTO materials (name, description, material_type_id, owner_id, purchase_price, profit_percentage_at_creation, sale_price, attributes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [name, description, material_type_id, owner_id, purchase_price, profitPercentage, sale_price, JSON.stringify(attributes)];
    
    const [result] = await db.query(sql, params);
    const [newMaterial] = await db.query('SELECT * FROM materials WHERE id = ?', [result.insertId]);
    return newMaterial[0];
};

const getMaterialById = async (id) => {
    const [rows] = await db.query('SELECT * FROM materials WHERE id = ?', [id]);
    if (rows.length > 0) {
        rows[0].attributes = typeof rows[0].attributes === 'string' ? JSON.parse(rows[0].attributes) : rows[0].attributes;
    }
    return rows[0];
};

const findPaginated = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    const searchQuery = search ? `%${search}%` : '%';
    const sql = `
        SELECT m.*, mt.name as material_type_name 
        FROM materials m 
        LEFT JOIN material_types mt ON m.material_type_id = mt.id
        WHERE m.name LIKE ? OR m.description LIKE ?
        LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(sql, [searchQuery, searchQuery, limit, offset]);
    return rows;
};

const countAll = async (search = '') => {
    const searchQuery = search ? `%${search}%` : '%';
    const sql = 'SELECT COUNT(*) as count FROM materials WHERE name LIKE ? OR description LIKE ?';
    const [rows] = await db.query(sql, [searchQuery, searchQuery]);
    return rows[0].count;
};

const updateMaterial = async (id, materialData) => {
    const { name, description, material_type_id, purchase_price, attributes } = materialData;
    const material = await getMaterialById(id);
    if (!material) throw new Error('Material not found');

    const ownerCompany = await ownerCompanyModel.getOwnerCompanyById(material.owner_id);
    const profitPercentage = ownerCompany ? ownerCompany.profit_percentage : material.profit_percentage_at_creation;
    const sale_price = purchase_price * (1 + profitPercentage / 100);
    
    const sql = `UPDATE materials SET name = ?, description = ?, material_type_id = ?, purchase_price = ?, attributes = ?, sale_price = ? WHERE id = ?`;
    const params = [name, description, material_type_id, purchase_price, JSON.stringify(attributes), sale_price, id];
    
    await db.query(sql, params);

    // INICIO: Lógica de actualización en cascada de 2 pasos
    const accessoriesModel = require('./accessoriesModel');
    const accessoryMaterialsModel = require('./accessoryMaterialsModel');

    // 1. Actualizar los snapshots en la tabla intermedia.
    await accessoryMaterialsModel.updateMaterialSnapshots(id);

    // 2. Encontrar todos los accesorios afectados para recalcular su precio TOTAL.
    const amSql = 'SELECT DISTINCT accessory_id, owner_id FROM accessory_materials WHERE material_id = ?';
    const [accessoryLinks] = await db.query(amSql, [id]);

    for (const link of accessoryLinks) {
        await accessoriesModel.updateAccessoryPrice(link.accessory_id, link.owner_id);
    }
    // FIN: Lógica de actualización en cascada

    return getMaterialById(id);
};

const deleteMaterial = async (id) => {
    const [result] = await db.query('DELETE FROM materials WHERE id = ?', [id]);
    return result;
};

module.exports = {
    createMaterial,
    getMaterialById,
    findPaginated,
    countAll,
    updateMaterial,
    deleteMaterial
};
