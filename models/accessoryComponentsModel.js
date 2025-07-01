const db = require('../db');

const createComponentLink = (parentId, childId, quantity, ownerId = 1) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO accessory_components (parent_accessory_id, child_accessory_id, quantity, owner_id)
                 VALUES (?, ?, ?, ?)`;
    db.query(sql, [parentId, childId, quantity, ownerId], (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        parent_accessory_id: parentId,
        child_accessory_id: childId,
        quantity,
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
  findAll,
  findByParent,
  deleteLink
};
