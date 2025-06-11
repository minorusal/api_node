const db = require('../db');

const createAccessory = (name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO accessories (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, description });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessories WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessories', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateAccessory = (id, name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE accessories SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [name, description, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteAccessory = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM accessories WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createAccessory,
  findById,
  findAll,
  updateAccessory,
  deleteAccessory
};
