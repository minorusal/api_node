const db = require('../db');

const getAllPlaysets = async (ownerCompanyId) => {
    const [rows] = await db.query('SELECT * FROM playsets WHERE owner_company_id = ?', [ownerCompanyId]);
    return rows;
};

const getPlaysetById = async (id, ownerCompanyId) => {
    const [rows] = await db.query('SELECT * FROM playsets WHERE id = ? AND owner_company_id = ?', [id, ownerCompanyId]);
    return rows[0];
};

const createPlayset = async (playset, ownerCompanyId) => {
    const { name, description, status, image_url } = playset;
    const sql = 'INSERT INTO playsets (name, description, status, image_url, owner_company_id) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, description, status, image_url, ownerCompanyId]);
    return { id: result.insertId, ...playset, owner_company_id: ownerCompanyId };
};

const updatePlayset = async (id, playset, ownerCompanyId) => {
    const { name, description, status, image_url } = playset;
    const sql = 'UPDATE playsets SET name = ?, description = ?, status = ?, image_url = ? WHERE id = ? AND owner_company_id = ?';
    const [result] = await db.query(sql, [name, description, status, image_url, id, ownerCompanyId]);
    return result;
};

const deletePlayset = async (id, ownerCompanyId) => {
    const [result] = await db.query('DELETE FROM playsets WHERE id = ? AND owner_company_id = ?', [id, ownerCompanyId]);
    return result;
};

module.exports = {
    getAllPlaysets,
    getPlaysetById,
    createPlayset,
    updatePlayset,
    deletePlayset
};
