const db = require('../db');

const getAllMaterialTypes = async () => {
    const [rows] = await db.query('SELECT * FROM material_types');
    return rows;
};

const getMaterialTypeById = async (id) => {
    const [rows] = await db.query('SELECT * FROM material_types WHERE id = ?', [id]);
    return rows[0];
};

const createMaterialType = async (type) => {
    const { name, description } = type;
    const sql = 'INSERT INTO material_types (name, description) VALUES (?, ?)';
    const [result] = await db.query(sql, [name, description]);
    const [newType] = await db.query('SELECT * FROM material_types WHERE id = ?', [result.insertId]);
    return newType[0];
};

const updateMaterialType = async (id, type) => {
    const { name, description } = type;
    const sql = 'UPDATE material_types SET name = ?, description = ? WHERE id = ?';
    await db.query(sql, [name, description, id]);
    return getMaterialTypeById(id);
};

const deleteMaterialType = async (id) => {
    const [result] = await db.query('DELETE FROM material_types WHERE id = ?', [id]);
    return result;
};

module.exports = {
    getAllMaterialTypes,
    getMaterialTypeById,
    createMaterialType,
    updateMaterialType,
    deleteMaterialType,
};
