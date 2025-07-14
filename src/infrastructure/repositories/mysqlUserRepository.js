const db = require('../database/db');
const User = require('../../domain/entities/user');
const UserRepository = require('../../domain/entities/userRepository');

class MysqlUserRepository extends UserRepository {
  async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
        if (err) return reject(err);
        if (!rows[0]) return resolve(null);
        resolve(new User(rows[0]));
      });
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
        if (err) return reject(err);
        if (!rows[0]) return resolve(null);
        resolve(new User(rows[0]));
      });
    });
  }

  async createUser(username, password) {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(sql, [username, password], (err, result) => {
        if (err) return reject(err);
        resolve(new User({ id: result.insertId, username, password }));
      });
    });
  }
}

module.exports = MysqlUserRepository;
