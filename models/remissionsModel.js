const db = require('../db');

const createRemission = (projectId, data, pdfPath, ownerId = 1) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO remissions (project_id, data, pdf_path, owner_id) VALUES (?, ?, ?, ?)`;
    db.query(sql, [projectId, data, pdfPath, ownerId], (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        project_id: projectId,
        data: JSON.parse(data),
        pdf_path: pdfPath,
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

module.exports = {
  createRemission,
  findById,
  findAll
};
