const db = require('../db');

const getAllMaterialAttributes = async () => {
    const [rows] = await db.query('SELECT * FROM material_attributes');
    return rows;
};

const getMaterialAttributeById = async (id) => {
    const [rows] = await db.query('SELECT * FROM material_attributes WHERE id = ?', [id]);
    return rows[0];
};

const createMaterialAttribute = async (attribute) => {
    const { material_id, attribute_name, attribute_value } = attribute;
    const sql = 'INSERT INTO material_attributes (material_id, attribute_name, attribute_value) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [material_id, attribute_name, attribute_value]);
    return { id: result.insertId, ...attribute };
};

const updateMaterialAttribute = async (id, attribute) => {
    const { material_id, attribute_name, attribute_value } = attribute;
    const sql = 'UPDATE material_attributes SET material_id = ?, attribute_name = ?, attribute_value = ? WHERE id = ?';
    const [result] = await db.query(sql, [material_id, attribute_name, attribute_value, id]);
    return result;
};

const deleteMaterialAttribute = async (id) => {
    const [result] = await db.query('DELETE FROM material_attributes WHERE id = ?', [id]);
    return result;
};

module.exports = {
    getAllMaterialAttributes,
    getMaterialAttributeById,
    createMaterialAttribute,
    updateMaterialAttribute,
    deleteMaterialAttribute
};
