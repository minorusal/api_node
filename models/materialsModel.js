const db = require('../db');

const createMaterial = (name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO raw_materials (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, description });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM raw_materials WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM raw_materials', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateMaterial = (id, name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE raw_materials SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [name, description, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteMaterial = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM raw_materials WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createMaterial,
  findById,
  findAll,
  updateMaterial,
  deleteMaterial
};
