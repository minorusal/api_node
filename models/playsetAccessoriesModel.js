const db = require('../db');
const AccessoryMaterials = require('./accessoryMaterialsModel');

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Vincula un accesorio a un playset.
 * @param {number} playsetId - ID del playset.
 * @param {number} accessoryId - ID del accesorio.
 * @param {number} quantity - Cantidad del accesorio en el playset.
 * @returns {Promise<object>} Registro creado con su ID.
 * @throws {Error} Si la inserción falla.
 */
const linkAccessory = (playsetId, accessoryId, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO playset_accessories (playset_id, accessory_id, quantity) VALUES (?, ?, ?)';
    db.query(sql, [playsetId, accessoryId, quantity], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, playsetId, accessoryId, quantity });
    });
  });
};

/**
 * Obtiene un vínculo por su ID.
 * @param {number} id - Identificador del vínculo.
 * @returns {Promise<object>} Vínculo encontrado o undefined.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playset_accessories WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Lista todos los vínculos existentes entre playsets y accesorios.
 * @returns {Promise<object[]>} Arreglo de vínculos.
 * @throws {Error} Si la consulta falla.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playset_accessories', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Calcula el costo total de un playset a partir de sus accesorios.
 * @param {number} playsetId - ID del playset.
 * @returns {Promise<object|null>} Detalle de costos o null si no existe.
 * @throws {Error} Si ocurre un error en las consultas.
 */
const calculatePlaysetCost = async (playsetId) => {
  const playsetRows = await query(
    'SELECT id, name, description FROM playsets WHERE id = ?',
    [playsetId]
  );
  if (playsetRows.length === 0) return null;
  const accessoryRows = await query(
    `SELECT pa.accessory_id, pa.quantity, a.name
     FROM playset_accessories pa
     JOIN accessories a ON a.id = pa.accessory_id
     WHERE pa.playset_id = ?`,
    [playsetId]
  );

  const accessories = [];
  for (const row of accessoryRows) {
    const mats = await query(
      'SELECT material_id, quantity, width_m, length_m FROM accessory_materials WHERE accessory_id = ?',
      [row.accessory_id]
    );
    let unitCost = 0;
    for (const m of mats) {
      const c = await AccessoryMaterials.calculateCost(
        m.material_id,
        m.width_m,
        m.length_m,
        m.quantity
      );
      unitCost += c;
    }
    const cost = unitCost * row.quantity;
    accessories.push({
      accessory_id: row.accessory_id,
      accessory_name: row.name,
      quantity: row.quantity,
      cost
    });
  }

  const total_cost = accessories.reduce((sum, a) => sum + a.cost, 0);
  return {
    playset_id: playsetRows[0].id,
    playset_name: playsetRows[0].name,
    playset_description: playsetRows[0].description,
    total_cost,
    accessories
  };
};

/**
 * Actualiza la cantidad de un accesorio en un playset.
 * @param {number} id - ID del vínculo.
 * @param {number} quantity - Nueva cantidad del accesorio.
 * @returns {Promise<object>} Resultado de la actualización.
 * @throws {Error} Si la consulta falla.
 */
const updateLink = (id, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE playset_accessories SET quantity = ? WHERE id = ?';
    db.query(sql, [quantity, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Elimina un vínculo entre playset y accesorio.
 * @param {number} id - Identificador del vínculo.
 * @returns {Promise<object>} Resultado de la eliminación.
 * @throws {Error} Si ocurre un error en la base de datos.
 */
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
  deleteLink,
  calculatePlaysetCost
};
