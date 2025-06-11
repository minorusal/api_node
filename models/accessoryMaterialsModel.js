const db = require('../db');

const linkMaterial = (accessoryId, materialId, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO accessory_materials (accessory_id, material_id, quantity) VALUES (?, ?, ?)';
    db.query(sql, [accessoryId, materialId, quantity], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, accessoryId, materialId, quantity });
    });
  });
};

const calculateCost = (materialId, width, length, quantity = 1) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT width_m, length_m, price FROM raw_materials WHERE id = ?';
    db.query(sql, [materialId], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 0) return reject(new Error('Material not found'));
      const material = rows[0];
      const fullArea = material.width_m * material.length_m;
      const pieceArea = width * length;
      const unitCost = (material.price / fullArea) * pieceArea;
      resolve(unitCost * quantity);
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessory_materials WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessory_materials', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateLink = (id, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE accessory_materials SET quantity = ? WHERE id = ?';
    db.query(sql, [quantity, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteLink = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM accessory_materials WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  linkMaterial,
  findById,
  findAll,
  updateLink,
  deleteLink,
  calculateCost
};
