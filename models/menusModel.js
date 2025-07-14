const db = require('../db');

const getAllMenus = async () => {
    const [rows] = await db.query('SELECT * FROM menus');
    return rows;
};

const getMenuById = async (id) => {
    const [rows] = await db.query('SELECT * FROM menus WHERE id = ?', [id]);
    return rows[0];
};

const createMenu = async (menu) => {
    const { name, path, parent_id } = menu;
    const sql = 'INSERT INTO menus (name, path, parent_id) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [name, path, parent_id]);
    return { id: result.insertId, ...menu };
};

const updateMenu = async (id, menu) => {
    const { name, path, parent_id } = menu;
    const sql = 'UPDATE menus SET name = ?, path = ?, parent_id = ? WHERE id = ?';
    const [result] = await db.query(sql, [name, path, parent_id, id]);
    return result;
};

const deleteMenu = async (id) => {
    const [result] = await db.query('DELETE FROM menus WHERE id = ?', [id]);
    return result;
};

const getMenuTree = async () => {
    const [rows] = await db.query('SELECT id, name, path, parent_id FROM menus ORDER BY parent_id, id');
    const map = {};
    const tree = [];

    rows.forEach((row) => {
        map[row.id] = { ...row, children: [] };
    });

    rows.forEach((row) => {
        if (row.parent_id && map[row.parent_id]) {
            map[row.parent_id].children.push(map[row.id]);
        } else {
            tree.push(map[row.id]);
        }
    });

    return tree;
};

module.exports = {
    getAllMenus,
    getMenuById,
    createMenu,
    updateMenu,
    deleteMenu,
    getMenuTree
};
