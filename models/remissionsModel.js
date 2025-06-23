const db = require('../db');

const createRemission = (projectId, data, pdfPath, recipientType = 'owner', ownerId = 1) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO remissions (project_id, data, pdf_path, recipient_type, owner_id) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [projectId, data, pdfPath, recipientType, ownerId], (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        project_id: projectId,
        data: JSON.parse(data),
        pdf_path: pdfPath,
        recipient_type: recipientType,
        owner_id: ownerId
      });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM remissions WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM remissions', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const findByProjectId = (projectId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM remissions WHERE project_id = ?';
    db.query(sql, [projectId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const findByOwnerId = (ownerId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM remissions WHERE owner_id = ?';
    db.query(sql, [ownerId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const findByOwnerIdWithClient = (ownerId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT r.*, c.id AS client_id, c.contact_name, c.company_name, c.address,
             c.requires_invoice, c.billing_info
      FROM remissions r
      JOIN projects p ON r.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      WHERE r.owner_id = ?
      ORDER BY r.created_at ASC`;
    db.query(sql, [ownerId], (err, rows) => {
      if (err) return reject(err);
      const result = rows.map(row => {
        const data = row.data ? JSON.parse(row.data) : null;
        return {
          id: row.id,
          project_id: row.project_id,
          data,
          pdf_path: row.pdf_path,
          recipient_type: row.recipient_type,
          owner_id: row.owner_id,
          created_at: row.created_at,
          client: {
            id: row.client_id,
            contact_name: row.contact_name,
            company_name: row.company_name,
            address: row.address,
            requires_invoice: row.requires_invoice,
            billing_info: row.billing_info
          }
        };
      });
      resolve(result);
    });
  });
};

const buildSearchQuery = (search) => {
  if (!search) return { clause: '', params: [] };
  const pattern = `%${search}%`;
  const clause =
    'AND CONCAT_WS(" ", r.id, r.project_id, r.data, r.pdf_path, r.recipient_type, r.owner_id, r.created_at, c.contact_name, c.company_name, c.address, c.requires_invoice, c.billing_info) LIKE ?';
  return { clause, params: [pattern] };
};

const findByOwnerIdWithClientPaginated = (
  ownerId,
  page = 1,
  limit = 10,
  search = ''
) => {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    const { clause, params } = buildSearchQuery(search);
    const sql = `
      SELECT r.*, c.id AS client_id, c.contact_name, c.company_name, c.address,
             c.requires_invoice, c.billing_info
      FROM remissions r
      JOIN projects p ON r.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      WHERE r.owner_id = ? ${clause}
      ORDER BY r.created_at ASC
      LIMIT ? OFFSET ?`;
    db.query(sql, [ownerId, ...params, parseInt(limit, 10), offset], (err, rows) => {
      if (err) return reject(err);
      const result = rows.map(row => {
        const data = row.data ? JSON.parse(row.data) : null;
        return {
          id: row.id,
          project_id: row.project_id,
          data,
          pdf_path: row.pdf_path,
          recipient_type: row.recipient_type,
          owner_id: row.owner_id,
          created_at: row.created_at,
          client: {
            id: row.client_id,
            contact_name: row.contact_name,
            company_name: row.company_name,
            address: row.address,
            requires_invoice: row.requires_invoice,
            billing_info: row.billing_info
          }
        };
      });
      resolve(result);
    });
  });
};

const countByOwnerIdWithClient = (ownerId, search = '') => {
  return new Promise((resolve, reject) => {
    const { clause, params } = buildSearchQuery(search);
    const sql = `
      SELECT COUNT(*) AS count
      FROM remissions r
      JOIN projects p ON r.project_id = p.id
      JOIN clients c ON p.client_id = c.id
      WHERE r.owner_id = ? ${clause}`;
    db.query(sql, [ownerId, ...params], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0].count);
    });
  });
};

module.exports = {
  createRemission,
  findById,
  findAll,
  findByProjectId,
  findByOwnerId,
  findByOwnerIdWithClient,
  findByOwnerIdWithClientPaginated,
  countByOwnerIdWithClient
};
