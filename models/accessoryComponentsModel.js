const db = require('../db');
const Accessories = require('./accessoriesModel');

const createComponentLink = (
  parentId,
  childId,
  quantity,
  childName,
  cost,
  price,
  ownerId = 1
) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO accessory_components (parent_accessory_id, child_accessory_id, quantity, child_accessory_name, cost, price, owner_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.query(
      sql,
      [parentId, childId, quantity, childName, cost, price, ownerId],
      (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        parent_accessory_id: parentId,
        child_accessory_id: childId,
        quantity,
        child_name: childName,
        cost,
        price,
        owner_id: ownerId
      });
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM accessory_components', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const findByParent = (parentId) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM accessory_components WHERE parent_accessory_id = ?',
      [parentId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      }
    );
  });
};

const findByParentDetailed = async (parentId, ownerId = 1) => {
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });

  const rows = await query(
    `SELECT ac.id, ac.parent_accessory_id, ac.child_accessory_id, ac.quantity,
            ac.cost, ac.price,
            child.id AS child_id, child.name AS child_name,
            child.description AS child_description
       FROM accessory_components ac
       JOIN accessories child ON child.id = ac.child_accessory_id
      WHERE ac.parent_accessory_id = ?`,
    [parentId]
  );

  const ownerRows = await query(
    'SELECT profit_percentage FROM owner_companies WHERE id = ?',
    [ownerId]
  );
  const profitPercentage = ownerRows.length
    ? +ownerRows[0].profit_percentage
    : 0;
  const factor = 1 + profitPercentage / 100;

  for (const row of rows) {
    if (row.cost == null || row.price == null) {
      const calc = await Accessories.calculateAccessoryCost(row.child_accessory_id);
      row.cost = calc;
      row.price = +(calc * factor).toFixed(2);
    }
    row.child = {
      id: row.child_id,
      name: row.child_name,
      description: row.child_description
    };
    delete row.child_id;
    delete row.child_name;
    delete row.child_description;
  }

  return rows;
};

const createComponentLinksBatch = (parentId, components, ownerId = 1) => {
  return new Promise((resolve, reject) => {
    if (!components.length) return resolve([]);
    const values = components.map(c => [
      parentId,
      c.accessory_id,
      c.quantity,
      c.name,
      c.cost,
      c.price,
      ownerId
    ]);
    const sql =
      'INSERT INTO accessory_components (parent_accessory_id, child_accessory_id, quantity, child_accessory_name, cost, price, owner_id) VALUES ?';
    db.query(sql, [values], (err, result) => {
      if (err) return reject(err);
      const inserted = components.map((c, idx) => ({
        id: result.insertId + idx,
        parent_accessory_id: parentId,
        child_accessory_id: c.accessory_id,
        quantity: c.quantity,
        child_name: c.name,
        cost: c.cost,
        price: c.price,
        owner_id: ownerId
      }));
      resolve(inserted);
    });
  });
};

const deleteByParent = parentId => {
  return new Promise((resolve, reject) => {
    db.query(
      'DELETE FROM accessory_components WHERE parent_accessory_id = ?',
      [parentId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

const deleteLink = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM accessory_components WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createComponentLink,
  createComponentLinksBatch,
  findAll,
  findByParent,
  findByParentDetailed,
  deleteByParent,
  deleteLink
};
