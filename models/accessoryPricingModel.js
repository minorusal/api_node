const db = require('../db');

/**
 * Inserta o actualiza la informacion de precios de un accesorio.
 * @param {number} accessoryId - ID del accesorio.
 * @param {number} ownerId - ID del propietario.
 * @param {number} markup - Porcentaje de ganancia.
 * @param {number} totalMaterials - Total de materiales.
 * @param {number} totalAccessories - Total de accesorios.
 * @param {number} total - Total general.
 * @returns {Promise<object>} Resultado de la consulta.
 */
const upsertPricing = (
  accessoryId,
  ownerId,
  markup,
  totalMaterials,
  totalAccessories,
  total
) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO accessory_pricing
      (accessory_id, owner_id, markup_percentage, total_materials_price, total_accessories_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        markup_percentage = VALUES(markup_percentage),
        total_materials_price = VALUES(total_materials_price),
        total_accessories_price = VALUES(total_accessories_price),
        total_price = VALUES(total_price),
        updated_at = CURRENT_TIMESTAMP`;
    const params = [
      accessoryId,
      ownerId,
      markup,
      totalMaterials,
      totalAccessories,
      total
    ];
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Obtiene los datos de precios de un accesorio.
 * @param {number} accessoryId - ID del accesorio.
 * @param {number} ownerId - ID del propietario.
 * @returns {Promise<object|undefined>} Registro encontrado o undefined.
 */
const findByAccessory = (accessoryId, ownerId = 1) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT * FROM accessory_pricing WHERE accessory_id = ? AND owner_id = ?';
    db.query(sql, [accessoryId, ownerId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

module.exports = { upsertPricing, findByAccessory };
