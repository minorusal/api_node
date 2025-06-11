const db = require('../db');

/**
 * Crea un nuevo usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña en texto plano o hash.
 * @returns {Promise<object>} Usuario creado con su ID.
 * @throws {Error} Si la inserción falla.
 */
const createUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, username });
    });
  });
};

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} username - Nombre de usuario.
 * @returns {Promise<object>} Usuario encontrado o undefined.
 * @throws {Error} Si la consulta falla.
 */
const findByUsername = (username) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Busca un usuario por su ID.
 * @param {number} id - Identificador del usuario.
 * @returns {Promise<object>} Usuario encontrado o undefined.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM users WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Obtiene todos los usuarios registrados.
 * @returns {Promise<object[]>} Lista de usuarios.
 * @throws {Error} Si la consulta falla.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT id, username FROM users', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Actualiza el nombre de usuario de un registro existente.
 * @param {number} id - ID del usuario.
 * @param {string} username - Nuevo nombre de usuario.
 * @returns {Promise<object>} Resultado de la actualización.
 * @throws {Error} Si la consulta falla.
 */
const updateUser = (id, username) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE users SET username = ? WHERE id = ?';
    db.query(sql, [username, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Elimina un usuario por su ID.
 * @param {number} id - Identificador del usuario.
 * @returns {Promise<object>} Resultado de la eliminación.
 * @throws {Error} Si la consulta falla.
 */
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
