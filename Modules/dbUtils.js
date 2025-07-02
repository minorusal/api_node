const db = require('../db');

/**
 * Checks if a column exists in a given table.
 * @param {string} table - Table name.
 * @param {string} column - Column name.
 * @returns {Promise<boolean>} True if column exists.
 */
const columnExists = (table, column) => {
  return new Promise((resolve, reject) => {
    const sql = 'SHOW COLUMNS FROM ?? LIKE ?';
    db.query(sql, [table, column], (err, rows) => {
      if (err) return reject(err);
      resolve(rows.length > 0);
    });
  });
};

/**
 * Ensures that a column exists in the table, adding it if missing.
 * @param {string} table - Table name.
 * @param {string} column - Column name.
 * @param {string} definition - Column definition used in ALTER TABLE.
 * @returns {Promise<void>}
 */
const ensureColumn = async (table, column, definition) => {
  const exists = await columnExists(table, column);
  if (!exists) {
    await new Promise((resolve, reject) => {
      const sql = `ALTER TABLE ?? ADD COLUMN ?? ${definition}`;
      db.query(sql, [table, column], err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};

module.exports = { columnExists, ensureColumn };
