const db = require('../db');

/**
 * Crea un nuevo material.
 * @param {string} name - Nombre del material.
 * @param {string} description - Descripción del material.
 * @param {number} thickness - Espesor en milímetros.
 * @param {number} width - Ancho en metros.
 * @param {number} length - Largo en metros.
 * @param {number} price - Precio del material.
 * @returns {Promise<object>} Material creado con su ID.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const createMaterial = (
  name,
  description,
  thickness,
  width,
  length,
  price,
  materialTypeId,
  ownerId = 1
) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO raw_materials (name, description, thickness_mm, width_m, length_m, price, material_type_id, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(
      sql,
      [name, description, thickness, width, length, price, materialTypeId, ownerId],
      (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          name,
          description,
          thickness_mm: thickness,
          width_m: width,
          length_m: length,
          price,
          material_type_id: materialTypeId,
          owner_id: ownerId
        });
      }
    );
  });
};

/**
 * Busca un material por su ID.
 * @param {number} id - Identificador del material.
 * @returns {Promise<object>} Material encontrado o undefined.
 * @throws {Error} Si la consulta falla.
 */
const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM raw_materials WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Obtiene todos los materiales registrados.
 * @returns {Promise<object[]>} Listado de materiales.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM raw_materials', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Obtiene materiales con paginación.
 * @param {number} page - Número de página.
 * @param {number} limit - Cantidad de registros por página.
 * @returns {Promise<object[]>} Listado de materiales paginado.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
const buildSearchQuery = (search) => {
  if (!search) return { clause: '', params: [] };
  const pattern = `%${search}%`;
  const clause =
    'WHERE CONCAT_WS(" ", id, name, description, thickness_mm, width_m, length_m, price, created_at, updated_at, owner_id) LIKE ?';
  return { clause, params: [pattern] };
};

const findPaginated = (page = 1, limit = 10, search = '') => {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    const { clause, params } = buildSearchQuery(search);
    const sql = `SELECT * FROM raw_materials ${clause} LIMIT ? OFFSET ?`;
    db.query(sql, [...params, parseInt(limit, 10), offset], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Cuenta el total de materiales registrados.
 * @returns {Promise<number>} Cantidad de materiales.
 * @throws {Error} Si ocurre un error al consultar la base de datos.
 */
const countAll = (search = '') => {
  return new Promise((resolve, reject) => {
    const { clause, params } = buildSearchQuery(search);
    const sql = `SELECT COUNT(*) AS count FROM raw_materials ${clause}`;
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0].count);
    });
  });
};

/**
 * Actualiza los datos de un material.
 * @param {number} id - ID del material.
 * @param {string} name - Nombre del material.
 * @param {string} description - Descripción del material.
 * @param {number} thickness - Espesor en milímetros.
 * @param {number} width - Ancho en metros.
 * @param {number} length - Largo en metros.
 * @param {number} price - Precio del material.
 * @returns {Promise<object>} Resultado de la actualización.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const updateMaterial = (
  id,
  name,
  description,
  thickness,
  width,
  length,
  price,
  materialTypeId
) => {
  return new Promise((resolve, reject) => {
    const sql =
      'UPDATE raw_materials SET name = ?, description = ?, thickness_mm = ?, width_m = ?, length_m = ?, price = ?, material_type_id = ? WHERE id = ?';
    db.query(
      sql,
      [name, description, thickness, width, length, price, materialTypeId, id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

/**
 * Elimina un material por su ID.
 * @param {number} id - Identificador del material.
 * @returns {Promise<object>} Resultado de la operación.
 * @throws {Error} Si la eliminación falla.
 */
const deleteMaterial = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM raw_materials WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createMaterial,
  findById,
  findAll,
  findPaginated,
  countAll,
  updateMaterial,
  deleteMaterial
};
