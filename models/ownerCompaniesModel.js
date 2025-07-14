const db = require('../db');

const getAllOwnerCompanies = async () => {
    const [rows] = await db.query('SELECT * FROM owner_companies');
    return rows;
};

const getOwnerCompanyById = async (id) => {
    const [rows] = await db.query('SELECT * FROM owner_companies WHERE id = ?', [id]);
    return rows[0];
};

const createOwnerCompany = async (company) => {
    const { name, profit_percentage } = company;
    const sql = 'INSERT INTO owner_companies (name, profit_percentage) VALUES (?, ?)';
    const [result] = await db.query(sql, [name, profit_percentage]);
    const [newCompany] = await db.query('SELECT * FROM owner_companies WHERE id = ?', [result.insertId]);
    return newCompany[0];
};

const findByName = async (name) => {
    const query = 'SELECT * FROM owner_companies WHERE TRIM(LOWER(name)) = TRIM(LOWER(?))';
    const [rows] = await db.query(query, [name]);
    return rows[0];
};

const updateOwnerCompany = async (id, company) => {
    const { name, profit_percentage } = company;
    const sql = 'UPDATE owner_companies SET name = ?, profit_percentage = ? WHERE id = ?';
    const [result] = await db.query(sql, [name, profit_percentage, id]);
    return result;
};

const deleteOwnerCompany = async (id) => {
    const [result] = await db.query('DELETE FROM owner_companies WHERE id = ?', [id]);
    return result;
};

module.exports = {
    getAllOwnerCompanies,
    getOwnerCompanyById,
    createOwnerCompany,
    findByName,
    updateOwnerCompany,
    deleteOwnerCompany
};
