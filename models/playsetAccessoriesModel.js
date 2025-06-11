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

const linkAccessory = (playsetId, accessoryId, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO playset_accessories (playset_id, accessory_id, quantity) VALUES (?, ?, ?)';
    db.query(sql, [playsetId, accessoryId, quantity], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, playsetId, accessoryId, quantity });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playset_accessories WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM playset_accessories', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const calculatePlaysetCost = async (playsetId) => {
  const playsetRows = await query('SELECT id, name FROM playsets WHERE id = ?', [playsetId]);
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
    total_cost,
    accessories
  };
};

const updateLink = (id, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE playset_accessories SET quantity = ? WHERE id = ?';
    db.query(sql, [quantity, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

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
