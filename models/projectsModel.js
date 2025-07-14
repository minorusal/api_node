const db = require('../db');

const createProject = async (projectData, ownerCompanyId) => {
    const { client_id, playset_id, sale_price, contact_email } = projectData;
    const sql = `INSERT INTO projects (client_id, playset_id, sale_price, contact_email, owner_company_id) VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [client_id, playset_id, sale_price, contact_email, ownerCompanyId]);
    return { id: result.insertId, ...projectData, owner_company_id: ownerCompanyId };
};

const findById = async (id, ownerCompanyId) => {
    const [rows] = await db.query('SELECT * FROM projects WHERE id = ? AND owner_company_id = ?', [id, ownerCompanyId]);
    return rows[0];
};

const findAll = async (ownerCompanyId) => {
    const [rows] = await db.query('SELECT * FROM projects WHERE owner_company_id = ?', [ownerCompanyId]);
    return rows;
};

const updateProject = async (id, projectData, ownerCompanyId) => {
    const { client_id, playset_id, sale_price, contact_email } = projectData;
    const sql = `UPDATE projects SET client_id = ?, playset_id = ?, sale_price = ?, contact_email = ? WHERE id = ? AND owner_company_id = ?`;
    const [result] = await db.query(sql, [client_id, playset_id, sale_price, contact_email, id, ownerCompanyId]);
    return result;
};

const deleteProject = async (id, ownerCompanyId) => {
    const [result] = await db.query('DELETE FROM projects WHERE id = ? AND owner_company_id = ?', [id, ownerCompanyId]);
    return result;
};

module.exports = {
  createProject,
  findById,
  findAll,
  updateProject,
  deleteProject
};
