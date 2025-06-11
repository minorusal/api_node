const db = require('../db');

const createPlayset = (name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO playsets (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, description });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playsets WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playsets', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updatePlayset = (id, name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE playsets SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [name, description, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deletePlayset = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM playsets WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createPlayset,
  findById,
  findAll,
  updatePlayset,
  deletePlayset
};
