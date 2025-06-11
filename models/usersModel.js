const db = require('../db');

const createUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, username });
    });
  });
};

const findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, username FROM users', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateUser = (id, username) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET username = ? WHERE id = ?';
    db.query(sql, [username, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteUser = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createUser,
  findByUsername,
  findById,
  findAll,
  updateUser,
  deleteUser
};
