const db = require('../db');

/**
 * Obtiene todos los tipos de material.
 * @returns {Promise<object[]>} Listado de tipos de material.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM material_types', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

module.exports = { findAll };
