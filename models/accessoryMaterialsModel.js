const db = require('../db');
const materialTypesModel = require('./materialTypesModel'); // Necesitamos este modelo
const ownerCompanyModel = require('./ownerCompaniesModel');

/**
 * Lógica centralizada para calcular el costo y precio de un material dentro de un accesorio.
 * @param {object} material - El objeto del material base.
 * @param {object} usageData - Datos de uso { quantity, width, length, owner_id }.
 * @returns {Promise<object>} - { proportionalCost, salePrice, profitPercentage }.
 */
const calculateMaterialCost = async (material, usageData) => {
    const { quantity, width, length, owner_id } = usageData;

    const materialType = await materialTypesModel.getMaterialTypeById(material.material_type_id);
    if (!materialType) throw new Error('El tipo de material no fue encontrado.');

    const ownerCompany = await ownerCompanyModel.getOwnerCompanyById(owner_id);
    const profitPercentage = ownerCompany ? parseFloat(ownerCompany.profit_percentage) : 0;
    const profitMultiplier = 1 + (profitPercentage / 100);

    let proportionalCost = 0;
    if (materialType.name.toLowerCase().includes('area')) {
        const area = (width || 0) * (length || 0);
        proportionalCost = (material.purchase_price || 0) * area;
    } else {
        proportionalCost = (material.purchase_price || 0) * quantity;
    }

    const salePrice = proportionalCost * profitMultiplier;

    return { proportionalCost, salePrice, profitPercentage };
}

/**
 * Añade un material a un accesorio, utilizando la lógica de cálculo centralizada.
 * @param {object} data - Datos para la asociación.
 */
const addMaterialToAccessory = async (data) => {
    const { accessory_id, material_id, quantity, owner_id, width, length } = data;

    const materialModel = require('./materialsModel');
    const material = await materialModel.getMaterialById(material_id);
    if (!material) throw new Error('El material especificado no existe.');

    const { proportionalCost, salePrice, profitPercentage } = await calculateMaterialCost(material, data);
    
    const attributesToStore = { width, length };
    
    const sql = `
        INSERT INTO accessory_materials
        (accessory_id, material_id, quantity, attributes, proportional_cost, profit_percentage, sale_price, owner_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
        accessory_id,
        material_id,
        quantity,
        JSON.stringify(attributesToStore),
        proportionalCost,
        profitPercentage,
        salePrice,
        owner_id
    ];
    
    const [result] = await db.query(sql, params);
    const [createdRow] = await db.query('SELECT * FROM accessory_materials WHERE id = ?', [result.insertId]);
    return createdRow[0];
};


const getMaterialsForAccessory = async (accessoryId) => {
    const sql = `
        SELECT
            am.id,
            am.material_id,
            m.name,
            am.quantity,
            am.attributes,
            am.proportional_cost,
            am.profit_percentage,
            am.sale_price
        FROM
            accessory_materials am
        JOIN
            materials m ON am.material_id = m.id
        WHERE
            am.accessory_id = ?
    `;
    const [rows] = await db.query(sql, [accessoryId]);
    return rows.map(row => ({
        ...row,
        attributes: typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes
    }));
};

const removeMaterialFromAccessory = async (accessoryMaterialId) => {
    const sql = 'DELETE FROM accessory_materials WHERE id = ?';
    const [result] = await db.query(sql, [accessoryMaterialId]);
    return result;
};

/**
 * Actualiza los snapshots de precios en 'accessory_materials' para un material específico.
 * @param {number} materialId - El ID del material que cambió.
 */
const updateMaterialSnapshots = async (materialId) => {
    // Se usa require local para evitar dependencia circular.
    const materialModel = require('./materialsModel');
    const material = await materialModel.getMaterialById(materialId);
    if (!material) return;

    const [links] = await db.query('SELECT * FROM accessory_materials WHERE material_id = ?', [materialId]);

    for (const link of links) {
        const attributes = typeof link.attributes === 'string' ? JSON.parse(link.attributes) : {};
        const usageData = {
            quantity: link.quantity,
            width: attributes.width,
            length: attributes.length,
            owner_id: link.owner_id
        };
        
        const { proportionalCost, salePrice, profitPercentage } = await calculateMaterialCost(material, usageData);

        const updateSql = 'UPDATE accessory_materials SET proportional_cost = ?, sale_price = ?, profit_percentage = ? WHERE id = ?';
        await db.query(updateSql, [proportionalCost, salePrice, profitPercentage, link.id]);
    }
};

module.exports = {
    addMaterialToAccessory,
    getMaterialsForAccessory,
    removeMaterialFromAccessory,
    calculateMaterialCost,
    updateMaterialSnapshots,
};
