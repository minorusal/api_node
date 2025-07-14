const db = require('../db');

const getAllRemissions = async () => {
    const [rows] = await db.query('SELECT * FROM remissions');
    return rows;
};

const getRemissionById = async (id) => {
    const [rows] = await db.query('SELECT * FROM remissions WHERE id = ?', [id]);
    return rows[0];
};

const createRemission = async (remission) => {
    const { project_id, date, total_amount, pdf_path } = remission;
    const sql = 'INSERT INTO remissions (project_id, date, total_amount, pdf_path) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [project_id, date, total_amount, pdf_path]);
    return { id: result.insertId, ...remission };
};

const updateRemission = async (id, remission) => {
    const { project_id, date, total_amount, pdf_path } = remission;
    const sql = 'UPDATE remissions SET project_id = ?, date = ?, total_amount = ?, pdf_path = ? WHERE id = ?';
    const [result] = await db.query(sql, [project_id, date, total_amount, pdf_path, id]);
    return result;
};

const deleteRemission = async (id) => {
    const [result] = await db.query('DELETE FROM remissions WHERE id = ?', [id]);
    return result;
};

const getRemissionDetails = async (id) => {
    const sql = `
        SELECT
            r.id AS remission_id,
            r.date,
            p.name AS project_name,
            p.description AS project_description,
            c.name AS client_name,
            c.address AS client_address,
            oc.name AS company_name,
            oc.address AS company_address,
            oc.phone AS company_phone,
            oc.email AS company_email,
            oc.logo_url
        FROM remissions r
        JOIN projects p ON r.project_id = p.id
        JOIN clients c ON p.client_id = c.id
        JOIN owner_companies oc ON p.owner_id = oc.id
        WHERE r.id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
};

module.exports = {
    getAllRemissions,
    getRemissionById,
    createRemission,
    updateRemission,
    deleteRemission,
    getRemissionDetails
};
