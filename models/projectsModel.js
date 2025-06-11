const db = require('../db');

const createProject = (clientId, playsetId, salePrice) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO projects (client_id, playset_id, sale_price) VALUES (?, ?, ?)`;
    db.query(sql, [clientId, playsetId, salePrice], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, client_id: clientId, playset_id: playsetId, sale_price: salePrice });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM projects WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM projects', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateProject = (id, clientId, playsetId, salePrice) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE projects SET client_id = ?, playset_id = ?, sale_price = ? WHERE id = ?`;
    db.query(sql, [clientId, playsetId, salePrice, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteProject = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM projects WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createProject,
  findById,
  findAll,
  updateProject,
  deleteProject
};
