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

const calculateAccessoryCost = async (accessoryId, visited = new Set()) => {
  if (visited.has(accessoryId)) return 0;
  visited.add(accessoryId);

  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

  const mats = await query(
    `SELECT am.costo, am.quantity, am.width_m, am.length_m,
            rm.price AS material_price, rm.width_m AS mat_width, rm.length_m AS mat_length
     FROM accessory_materials am
     JOIN raw_materials rm ON rm.id = am.material_id
     WHERE am.accessory_id = ?`,
    [accessoryId]
  );

  let cost = 0;
  for (const m of mats) {
    let c;
    if (m.costo !== null && m.costo !== undefined) {
      c = m.costo;
    } else {
      c = (m.material_price || 0) * (m.quantity || 0);
      if (m.width_m && m.length_m) {
        const fullArea = m.mat_width * m.mat_length;
        const pieceArea = m.width_m * m.length_m;
        const unitCost = (m.material_price / fullArea) * pieceArea;
        c = unitCost * (m.quantity || 0);
      }
    }
    cost += c;
  }

  const children = await query(
    'SELECT child_accessory_id, quantity FROM accessory_components WHERE parent_accessory_id = ?',
    [accessoryId]
  );

  for (const child of children) {
    const childCost = await calculateAccessoryCost(child.child_accessory_id, visited);
    cost += childCost * (child.quantity || 0);
  }

  return +cost.toFixed(2);
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
  const profitPercentage = ownerRows.length
    ? +ownerRows[0].profit_percentage
    : 0;
  const margin = profitPercentage / 100;
  const factor = 1 + margin;

  for (const acc of accessories) {
    const cost = await calculateAccessoryCost(acc.id);
    acc.cost = cost;
    acc.price = +(cost * factor).toFixed(2);
    acc.profit_margin = margin;
    acc.profit_percentage = profitPercentage;
  }

  return accessories;
};

/**
 * Obtiene accesorios de un propietario con costos usando paginación.
 * @param {number} ownerId - ID del propietario.
 * @param {number} page - Número de página.
 * @param {number} limit - Cantidad de registros por página.
 * @returns {Promise<object[]>} Arreglo de accesorios con costo y precio.
 */
const buildSearchQuery = search => {
  if (!search) return { clause: '', params: [] };
  const pattern = `%${search}%`;
  const clause = 'AND (name LIKE ? OR description LIKE ?)';
  return { clause, params: [pattern, pattern] };
};

const findByOwnerWithCostsPaginated = async (
  ownerId = 1,
  page = 1,
  limit = 10,
  search = ''
) => {
  const offset = (page - 1) * limit;
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

  const { clause, params } = buildSearchQuery(search);

  const accessories = await query(
    `SELECT * FROM accessories WHERE owner_id = ? ${clause} LIMIT ? OFFSET ?`,
    [ownerId, ...params, parseInt(limit, 10), offset]
  );

  const ownerRows = await query(
    'SELECT profit_percentage FROM owner_companies WHERE id = ?',
    [ownerId]
  );
  const profitPercentage = ownerRows.length
    ? +ownerRows[0].profit_percentage
    : 0;
  const margin = profitPercentage / 100;
  const factor = 1 + margin;

  for (const acc of accessories) {
    const cost = await calculateAccessoryCost(acc.id);
    acc.cost = cost;
    acc.price = +(cost * factor).toFixed(2);
    acc.profit_margin = margin;
    acc.profit_percentage = profitPercentage;
  }

  return accessories;
};

/**
 * Cuenta los accesorios de un propietario.
 * @param {number} ownerId - ID del propietario.
 * @returns {Promise<number>} Cantidad de accesorios.
 */
const countByOwner = (ownerId = 1, search = '') => {
  return new Promise((resolve, reject) => {
    const { clause, params } = buildSearchQuery(search);
    db.query(
      `SELECT COUNT(*) AS count FROM accessories WHERE owner_id = ? ${clause}`,
      [ownerId, ...params],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows[0].count);
      }
    );
  });
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
  findByOwnerWithCostsPaginated,
  countByOwner,
  updateAccessory,
  deleteAccessory,
  calculateAccessoryCost
};
