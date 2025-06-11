const db = require('../db');

/**
 * Crea un atributo para un material.
 * @param {number} materialId - ID del material asociado.
 * @param {string} attributeName - Nombre del atributo.
 * @param {string} attributeValue - Valor del atributo.
 * @returns {Promise<object>} Atributo creado con su ID.
 * @throws {Error} Si ocurre un error al insertar el registro.
 */
const createAttribute = (materialId, attributeName, attributeValue) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO material_attributes (material_id, attribute_name, attribute_value) VALUES (?, ?, ?)';
    db.query(sql, [materialId, attributeName, attributeValue], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, materialId, attributeName, attributeValue });
    });
  });
};

/**
 * Obtiene un atributo de material por su ID.
 * @param {number} id - Identificador del atributo.
 * @returns {Promise<object>} Atributo encontrado o undefined.
 * @throws {Error} Si la consulta falla.
 */
const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM material_attributes WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Lista todos los atributos de materiales.
 * @returns {Promise<object[]>} Arreglo de atributos.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM material_attributes', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Actualiza un atributo de material.
 * @param {number} id - ID del atributo a actualizar.
 * @param {string} attributeName - Nombre del atributo.
 * @param {string} attributeValue - Valor del atributo.
 * @returns {Promise<object>} Resultado de la actualización.
 * @throws {Error} Si la consulta falla.
 */
const updateAttribute = (id, attributeName, attributeValue) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE material_attributes SET attribute_name = ?, attribute_value = ? WHERE id = ?';
    db.query(sql, [attributeName, attributeValue, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Elimina un atributo de material.
 * @param {number} id - Identificador del atributo.
 * @returns {Promise<object>} Resultado de la eliminación.
 * @throws {Error} Si la consulta falla.
 */
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
