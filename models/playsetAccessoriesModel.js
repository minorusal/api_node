const db = require('../db');

const linkAccessory = (playsetId, accessoryId, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO playset_accessories (playset_id, accessory_id, quantity) VALUES (?, ?, ?)';
    db.query(sql, [playsetId, accessoryId, quantity], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, playsetId, accessoryId, quantity });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playset_accessories WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playset_accessories', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateLink = (id, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE playset_accessories SET quantity = ? WHERE id = ?';
    db.query(sql, [quantity, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteLink = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM playset_accessories WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  linkAccessory,
  findById,
  findAll,
  updateLink,
  deleteLink
};
