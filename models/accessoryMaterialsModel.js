const db = require('../db');

const linkMaterial = (accessoryId, materialId, quantity, width, length) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO accessory_materials (accessory_id, material_id, quantity, width_m, length_m) VALUES (?, ?, ?, ?, ?)';
    db.query(
      sql,
      [accessoryId, materialId, quantity, width, length],
      (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId, accessoryId, materialId, quantity, width, length });
      }
    );
  });
};

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

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessory_materials WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessory_materials', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const findAccessoriesWithMaterialsCost = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT a.id AS accessory_id, a.name AS accessory_name,
             am.quantity, am.width_m AS piece_width, am.length_m AS piece_length,
             rm.id AS material_id, rm.name AS material_name,
             rm.price, rm.width_m AS material_width, rm.length_m AS material_length
      FROM accessories a
      JOIN accessory_materials am ON a.id = am.accessory_id
      JOIN raw_materials rm ON rm.id = am.material_id`;
    db.query(sql, (err, rows) => {
      if (err) return reject(err);
      const detailed = rows.map((row) => {
        let cost = row.price * row.quantity;
        if (row.piece_width && row.piece_length) {
          const fullArea = row.material_width * row.material_length;
          const pieceArea = row.piece_width * row.piece_length;
          const unitCost = (row.price / fullArea) * pieceArea;
          cost = unitCost * row.quantity;
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

const updateLink = (id, quantity) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE accessory_materials SET quantity = ? WHERE id = ?';
    db.query(sql, [quantity, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteLink = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM accessory_materials WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  linkMaterial,
  findById,
  findAll,
  findAccessoriesWithMaterialsCost,
  updateLink,
  deleteLink,
  calculateCost
};
