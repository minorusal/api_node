const db = require('../db');

/**
 * Crea un nuevo playset.
 * @param {string} name - Nombre del playset.
 * @param {string} description - Descripción del playset.
 * @returns {Promise<object>} Playset creado con su ID.
 * @throws {Error} Si la inserción falla.
 */
const createPlayset = (name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO playsets (name, description) VALUES (?, ?)';
    db.query(sql, [name, description], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, description });
    });
  });
};

/**
 * Busca un playset por su ID.
 * @param {number} id - Identificador del playset.
 * @returns {Promise<object>} Playset encontrado o undefined.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playsets WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Lista todos los playsets registrados.
 * @returns {Promise<object[]>} Arreglo de playsets.
 * @throws {Error} Si la consulta falla.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playsets', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Actualiza la información de un playset.
 * @param {number} id - ID del playset.
 * @param {string} name - Nombre del playset.
 * @param {string} description - Descripción del playset.
 * @returns {Promise<object>} Resultado de la actualización.
 * @throws {Error} Si ocurre un error al actualizar.
 */
const updatePlayset = (id, name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE playsets SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [name, description, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Elimina un playset por su ID.
 * @param {number} id - Identificador del playset.
 * @returns {Promise<object>} Resultado de la operación.
 * @throws {Error} Si la consulta falla.
 */
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
