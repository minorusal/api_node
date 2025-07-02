const db = require('../db');

/**
 * Relaciona un material con un accesorio.
 * @param {number} accessoryId - ID del accesorio.
 * @param {number} materialId - ID del material.
 * @param {number} quantity - Cantidad de material.
 * @param {number} width - Ancho de la pieza en metros.
 * @param {number} length - Largo de la pieza en metros.
 * @returns {Promise<object>} Registro creado con su ID.
 * @throws {Error} Si ocurre un error en la inserción.
 */
const linkMaterial = (
  accessoryId,
  materialId,
  cost,
  profitPercentage,
  price,
  quantity,
  width,
  length,
  investment,
  description,
  ownerId = 1
) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO accessory_materials (accessory_id, material_id, costo, porcentaje_ganancia, precio, quantity, width_m, length_m, investment, descripcion_material, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(
      sql,
      [
        accessoryId,
        materialId,
        cost,
        profitPercentage,
        price,
        quantity,
        width,
        length,
        investment,
        description,
        ownerId
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          accessoryId,
          materialId,
          cost,
          profit_percentage: profitPercentage,
          price,
          quantity,
          width,
          length,
          investment,
          description,
          owner_id: ownerId
        });
      }
    );
  });
};

/**
 * Inserta varios materiales para un accesorio de una sola vez.
 * @param {number} accessoryId - ID del accesorio.
 * @param {object[]} materials - Arreglo de materiales a vincular.
 * @param {number} materials[].material_id - ID del material.
 * @param {number} [materials[].quantity] - Cantidad del material.
 * @param {number} [materials[].width] - Ancho utilizado en metros.
 * @param {number} [materials[].length] - Largo utilizado en metros.
 * @param {number} [ownerId=1] - ID del propietario.
 * @returns {Promise<object[]>} Registros creados con sus IDs.
 */
const linkMaterialsBatch = (accessoryId, materials, ownerId = 1) => {
  return new Promise((resolve, reject) => {
    if (!materials.length) return resolve([]);
    const values = materials.map((m) => [
      accessoryId,
      m.material_id,
      m.cost,
      m.profit_percentage,
      m.price,
      m.quantity,
      m.width,
      m.length,
      m.investment,
      m.description,
      ownerId
    ]);
    const sql =
      'INSERT INTO accessory_materials (accessory_id, material_id, costo, porcentaje_ganancia, precio, quantity, width_m, length_m, investment, descripcion_material, owner_id) VALUES ?';
    db.query(sql, [values], (err, result) => {
      if (err) return reject(err);
      const inserted = materials.map((m, idx) => ({
        id: result.insertId + idx,
        accessoryId,
        materialId: m.material_id,
        cost: m.cost,
        profit_percentage: m.profit_percentage,
        price: m.price,
        quantity: m.quantity,
        width: m.width,
        length: m.length,
        investment: m.investment,
        description: m.description,
        owner_id: ownerId
      }));
      resolve(inserted);
    });
  });
};

/**
 * Calcula el costo de utilizar una porción de material.
 * @param {number} materialId - ID del material.
 * @param {number} width - Ancho de la pieza en metros.
 * @param {number} length - Largo de la pieza en metros.
 * @param {number} [quantity=1] - Cantidad de piezas.
 * @returns {Promise<number>} Costo total calculado.
 * @throws {Error} Si el material no existe o falla la consulta.
 */
const calculateCost = (materialId, width, length, quantity = 1) => {
  return new Promise((resolve, reject) => {
    const sql =
      'SELECT width_m, length_m, price FROM raw_materials WHERE id = ?';
    db.query(sql, [materialId], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 0) return reject(new Error('Material not found'));
      const material = rows[0];
      const fullArea = material.width_m * material.length_m;
      const pieceArea = width * length;
      const unitCost = (material.price / fullArea) * pieceArea;
      resolve(unitCost * quantity);
    });
  });
};

/**
 * Obtiene un registro de vínculo por su ID.
 * @param {number} id - Identificador del vínculo.
 * @returns {Promise<object>} Registro encontrado o undefined.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessory_materials WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

/**
 * Lista todos los vínculos entre accesorios y materiales.
 * @returns {Promise<object[]>} Arreglo de registros de vínculos.
 * @throws {Error} Si la consulta falla.
 */
const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessory_materials', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

/**
 * Devuelve los accesorios con el detalle de materiales y costos asociados.
 * @returns {Promise<object[]>} Lista detallada de accesorios y costos.
 * @throws {Error} Si la consulta a la base de datos falla.
 */
const findAccessoriesWithMaterialsCost = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.id AS accessory_id, a.name AS accessory_name,
             am.costo, am.quantity, am.width_m AS piece_width, am.length_m AS piece_length,
             rm.id AS material_id, rm.name AS material_name,
             rm.price, rm.width_m AS material_width, rm.length_m AS material_length
      FROM accessories a
      JOIN accessory_materials am ON a.id = am.accessory_id
      JOIN raw_materials rm ON rm.id = am.material_id`;
    db.query(sql, (err, rows) => {
      if (err) return reject(err);
      const detailed = rows.map((row) => {
        let cost;
        if (row.costo !== null && row.costo !== undefined) {
          cost = row.costo;
        } else {
          cost = row.price * row.quantity;
          if (row.piece_width && row.piece_length) {
            const fullArea = row.material_width * row.material_length;
            const pieceArea = row.piece_width * row.piece_length;
            const unitCost = (row.price / fullArea) * pieceArea;
            cost = unitCost * row.quantity;
          }
        }
        return {
          accessory_id: row.accessory_id,
          accessory_name: row.accessory_name,
          material_id: row.material_id,
          material_name: row.material_name,
          quantity: row.quantity,
          width_m: row.piece_width,
          length_m: row.piece_length,
          cost
        };
      });
      resolve(detailed);
    });
  });
};

/**
 * Obtiene los costos de materiales para un accesorio específico.
 * @param {number} accessoryId - ID del accesorio.
 * @returns {Promise<object[]>} Detalle de materiales y costos.
 * @throws {Error} Si ocurre un error en la consulta.
 */
const findMaterialsCostByAccessory = (accessoryId) => {
  return new Promise((resolve, reject) => {
  const sql = `
      SELECT a.id AS accessory_id, a.name AS accessory_name,
             am.costo, am.quantity, am.width_m AS piece_width, am.length_m AS piece_length,
             rm.id AS material_id, rm.name AS material_name,
             rm.price, rm.width_m AS material_width, rm.length_m AS material_length
      FROM accessories a
      JOIN accessory_materials am ON a.id = am.accessory_id
      JOIN raw_materials rm ON rm.id = am.material_id
      WHERE a.id = ?`;
    db.query(sql, [accessoryId], (err, rows) => {
      if (err) return reject(err);
      const detailed = rows.map((row) => {
        let cost;
        if (row.costo !== null && row.costo !== undefined) {
          cost = row.costo;
        } else {
          cost = row.price * row.quantity;
          if (row.piece_width && row.piece_length) {
            const fullArea = row.material_width * row.material_length;
            const pieceArea = row.piece_width * row.piece_length;
            const unitCost = (row.price / fullArea) * pieceArea;
            cost = unitCost * row.quantity;
          }
        }
        return {
          accessory_id: row.accessory_id,
          accessory_name: row.accessory_name,
          material_id: row.material_id,
          material_name: row.material_name,
          quantity: row.quantity,
          width_m: row.piece_width,
          length_m: row.piece_length,
          cost
        };
      });
      resolve(detailed);
    });
  });
};

/**
 * Obtiene la lista de materiales asociados a un accesorio.
 * @param {number} accessoryId - ID del accesorio.
 * @returns {Promise<object[]>} Materiales vinculados al accesorio.
 */
const findMaterialsByAccessory = (accessoryId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.id AS accessory_id, a.name AS accessory_name,
             am.id AS link_id, am.quantity, am.width_m, am.length_m,
             am.costo, am.porcentaje_ganancia, am.precio,
             am.investment, am.descripcion_material,
             rm.id AS material_id, rm.name AS material_name, rm.description,
             rm.thickness_mm, rm.width_m AS material_width, rm.length_m AS material_length,
             rm.price, rm.material_type_id,
             mt.description AS material_type_description
      FROM accessories a
      JOIN accessory_materials am ON a.id = am.accessory_id
      JOIN raw_materials rm ON rm.id = am.material_id
      LEFT JOIN material_types mt ON rm.material_type_id = mt.id
      WHERE a.id = ?`;
    db.query(sql, [accessoryId], (err, rows) => {
      if (err) return reject(err);
      const mapped = rows.map(r => ({
        ...r,
        porcentaje_ganancia: r.porcentaje_ganancia ?? 0
      }));
      resolve(mapped);
    });
  });
};

/**
 * Actualiza la cantidad de un vínculo existente.
 * @param {number} id - ID del vínculo.
 * @param {number} quantity - Nueva cantidad.
 * @returns {Promise<object>} Resultado de la actualización.
 * @throws {Error} Si la consulta falla.
 */
const updateLink = (id, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE accessory_materials SET quantity = ? WHERE id = ?';
    db.query(sql, [quantity, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Actualiza todos los datos de un vínculo existente.
 * @param {number} id - ID del vínculo.
 * @param {number} accessoryId - Nuevo ID del accesorio.
 * @param {number} materialId - Nuevo ID del material.
 * @param {number} cost - Costo del material.
 * @param {number} profitPercentage - Porcentaje de ganancia.
 * @param {number} price - Precio del material.
 * @param {number} quantity - Cantidad utilizada.
 * @param {number} width - Ancho utilizado en metros.
 * @param {number} length - Largo utilizado en metros.
 * @returns {Promise<object>} Resultado de la actualización.
 */
const updateLinkData = (
  id,
  accessoryId,
  materialId,
  cost,
  profitPercentage,
  price,
  quantity,
  width,
  length,
  investment,
  description
) => {
  return new Promise((resolve, reject) => {
    const sql =
      'UPDATE accessory_materials SET accessory_id = ?, material_id = ?, costo = ?, porcentaje_ganancia = ?, precio = ?, quantity = ?, width_m = ?, length_m = ?, investment = ?, descripcion_material = ? WHERE id = ?';
    db.query(
      sql,
      [
        accessoryId,
        materialId,
        cost,
        profitPercentage,
        price,
        quantity,
        width,
        length,
        investment,
        description,
        id
      ],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

/**
 * Elimina un vínculo entre accesorio y material.
 * @param {number} id - Identificador del vínculo.
 * @returns {Promise<object>} Resultado de la operación.
 * @throws {Error} Si la consulta falla.
 */
const deleteLink = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM accessory_materials WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

/**
 * Elimina todas las relaciones de materiales para un accesorio.
 * @param {number} accessoryId - Identificador del accesorio.
 * @returns {Promise<object>} Resultado de la operación.
 */
const deleteByAccessory = (accessoryId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM accessory_materials WHERE accessory_id = ?',
      [accessoryId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

module.exports = {
  linkMaterial,
  linkMaterialsBatch,
  findById,
  findAll,
  findAccessoriesWithMaterialsCost,
  findMaterialsCostByAccessory,
  findMaterialsByAccessory,
  updateLink,
  updateLinkData,
  deleteByAccessory,
  deleteLink,
  calculateCost
};
