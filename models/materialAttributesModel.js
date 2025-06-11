const db = require('../db');

const createAttribute = (materialId, attributeName, attributeValue) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO material_attributes (material_id, attribute_name, attribute_value) VALUES (?, ?, ?)';
    db.query(sql, [materialId, attributeName, attributeValue], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, materialId, attributeName, attributeValue });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM material_attributes WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM material_attributes', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateAttribute = (id, attributeName, attributeValue) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE material_attributes SET attribute_name = ?, attribute_value = ? WHERE id = ?';
    db.query(sql, [attributeName, attributeValue, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteAttribute = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM material_attributes WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createAttribute,
  findById,
  findAll,
  updateAttribute,
  deleteAttribute
};
