const db = require('../db');

/**
 * Crea un nuevo accesorio.
 * @param {string} name - Nombre del accesorio.
 * @param {string} description - Descripción del accesorio.
 * @returns {Promise<object>} Accesorio creado con su ID.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
const createAccessory = (name, description, ownerId = 1) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO accessories (name, description, owner_id) VALUES (?, ?, ?)';
    db.query(sql, [name, description, ownerId], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, description, owner_id: ownerId });
    });
  });
};

/**
 * Obtiene un accesorio por su identificador.
 * @param {number} id - ID del accesorio.
 * @returns {Promise<object>} Accesorio encontrado o undefined.
 * @throws {Error} Si ocurre un fallo en la consulta.
 */
const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessories WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Lista todos los accesorios disponibles.
 * @returns {Promise<object[]>} Arreglo de accesorios.
 * @throws {Error} Si ocurre un error al realizar la consulta.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessories', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Lista accesorios de un propietario calculando costo y precio.
 * @param {number} ownerId - ID del propietario.
 * @returns {Promise<object[]>} Arreglo de accesorios con costo y precio.
 */
const findByOwnerWithCosts = async (ownerId = 1) => {
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

  const accessories = await query(
    'SELECT * FROM accessories WHERE owner_id = ?',
    [ownerId]
  );

  const ownerRows = await query(
    'SELECT profit_percentage FROM owner_companies WHERE id = ?',
    [ownerId]
  );
  const margin = ownerRows.length
    ? +(ownerRows[0].profit_percentage / 100)
    : 0;
  const factor = 1 + margin;

  for (const acc of accessories) {
    const mats = await query(
      `SELECT am.quantity, am.width_m, am.length_m, rm.price, rm.width_m AS mat_width, rm.length_m AS mat_length
       FROM accessory_materials am
       JOIN raw_materials rm ON rm.id = am.material_id
       WHERE am.accessory_id = ?`,
      [acc.id]
    );

    let cost = 0;
    for (const m of mats) {
      let c = (m.price || 0) * (m.quantity || 0);
      if (m.width_m && m.length_m) {
        const fullArea = m.mat_width * m.mat_length;
        const pieceArea = m.width_m * m.length_m;
        const unitCost = (m.price / fullArea) * pieceArea;
        c = unitCost * (m.quantity || 0);
      }
      cost += c;
    }
    acc.cost = +cost.toFixed(2);
    acc.price = +(cost * factor).toFixed(2);
  }

  return accessories;
};

/**
 * Actualiza un accesorio existente.
 * @param {number} id - ID del accesorio a actualizar.
 * @param {string} name - Nuevo nombre del accesorio.
 * @param {string} description - Nueva descripción del accesorio.
 * @returns {Promise<object>} Resultado de la actualización.
 * @throws {Error} Si la consulta falla.
 */
const updateAccessory = (id, name, description) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE accessories SET name = ?, description = ? WHERE id = ?';
    db.query(sql, [name, description, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Elimina un accesorio por su ID.
 * @param {number} id - Identificador del accesorio.
 * @returns {Promise<object>} Resultado de la operación.
 * @throws {Error} Si la consulta falla.
 */
const deleteAccessory = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM accessories WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createAccessory,
  findById,
  findAll,
  findByOwnerWithCosts,
  updateAccessory,
  deleteAccessory
};
