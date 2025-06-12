const db = require('../db');

/**
 * Crea un nuevo menú o submenú.
 * @param {string} name - Nombre a mostrar.
 * @param {string|null} path - Ruta del enlace o null si es contenedor.
 * @param {number|null} parentId - ID del menú padre o null para nivel raíz.
 * @returns {Promise<object>} Menú creado.
 */
const createMenu = (name, path = null, parentId = null, ownerId = 1) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO menus (name, path, parent_id, owner_id) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, path, parentId, ownerId], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, path, parent_id: parentId, owner_id: ownerId });
    });
  });
};

/**
 * Obtiene el árbol completo de menús con submenús.
 * @returns {Promise<object[]>} Árbol de menús.
 */
const getMenuTree = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT id, name, path, parent_id FROM menus ORDER BY id';
    db.query(sql, (err, rows) => {
      if (err) return reject(err);
      const map = {};
      rows.forEach((row) => {
        map[row.id] = { ...row, children: [] };
      });
      const tree = [];
      rows.forEach((row) => {
        if (row.parent_id) {
          if (map[row.parent_id]) {
            map[row.parent_id].children.push(map[row.id]);
          }
        } else {
          tree.push(map[row.id]);
        }
      });
      resolve(tree);
    });
  });
};

module.exports = { createMenu, getMenuTree };
