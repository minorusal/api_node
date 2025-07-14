const db = require('../db');

const createClient = async (clientData, ownerCompanyId) => {
    const { contact_name, company_name, address, requires_invoice, billing_info } = clientData;
    const sql = `INSERT INTO clients (contact_name, company_name, address, requires_invoice, billing_info, owner_company_id) VALUES (?, ?, ?, ?, ?, ?)`;
    const [result] = await db.query(sql, [contact_name, company_name, address, requires_invoice, billing_info, ownerCompanyId]);
    return { id: result.insertId, ...clientData, owner_company_id: ownerCompanyId };
};

const findById = async (id, ownerCompanyId) => {
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ? AND owner_company_id = ?', [id, ownerCompanyId]);
    return rows[0];
};

const findAll = async (ownerCompanyId) => {
    const [rows] = await db.query('SELECT * FROM clients WHERE owner_company_id = ?', [ownerCompanyId]);
    return rows;
};

const updateClient = async (id, clientData, ownerCompanyId) => {
    const { contact_name, company_name, address, requires_invoice, billing_info } = clientData;
    const sql = `UPDATE clients SET contact_name = ?, company_name = ?, address = ?, requires_invoice = ?, billing_info = ? WHERE id = ? AND owner_company_id = ?`;
    const [result] = await db.query(sql, [contact_name, company_name, address, requires_invoice, billing_info, id, ownerCompanyId]);
    return result;
};

const deleteClient = async (id, ownerCompanyId) => {
    const sql = 'DELETE FROM clients WHERE id = ? AND owner_company_id = ?';
    const [result] = await db.query(sql, [id, ownerCompanyId]);
    return result;
};

module.exports = {
  createClient,
  findById,
  findAll,
  updateClient,
  deleteClient
};
