const db = require('../db');

/**
 * Crea un nuevo usuario.
 * @param {string} username - Nombre de usuario.
 * @param {string} password - Contraseña con hash.
 * @param {number} owner_company_id - ID de la empresa propietaria.
 * @returns {Promise<object>} Usuario creado con su ID.
 */
const createUser = async (username, password, owner_company_id) => {
  const sql = 'INSERT INTO users (username, password, owner_company_id) VALUES (?, ?, ?)';
  const [result] = await db.query(sql, [username, password, owner_company_id]);
  return { id: result.insertId, username };
};

/**
 * Busca un usuario por su nombre de usuario y el ID de la compañía.
 * @param {string} username - Nombre de usuario.
 * @param {number} ownerCompanyId - ID de la empresa propietaria.
 * @returns {Promise<object>} Usuario encontrado o undefined.
 */
const findByUsernameAndCompany = async (username, ownerCompanyId) => {
  const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND owner_company_id = ?', [username, ownerCompanyId]);
  return rows[0];
};

/**
 * Busca un usuario por su ID.
 * @param {number} id - Identificador del usuario.
 * @returns {Promise<object>} Usuario encontrado o undefined.
 */
const findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0];
};

/**
 * Obtiene todos los usuarios registrados.
 * @returns {Promise<object[]>} Lista de usuarios.
 */
const findAll = async () => {
  const [rows] = await db.query('SELECT id, username FROM users');
  return rows;
};

/**
 * Actualiza el nombre de usuario de un registro existente.
 * @param {number} id - ID del usuario.
 * @param {string} username - Nuevo nombre de usuario.
 * @returns {Promise<object>} Resultado de la actualización.
 */
const updateUser = async (id, username) => {
  const sql = 'UPDATE users SET username = ? WHERE id = ?';
  const [result] = await db.query(sql, [username, id]);
  return result;
};

/**
 * Elimina un usuario por su ID.
 * @param {number} id - Identificador del usuario.
 * @returns {Promise<object>} Resultado de la eliminación.
 */
const deleteUser = async (id) => {
  const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
  return result;
};

module.exports = {
  createUser,
  findByUsernameAndCompany,
  findById,
  findAll,
  updateUser,
  deleteUser
};
