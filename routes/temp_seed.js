const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

const seedMaterialTypes = async () => {
    const defaultTypes = [
        { name: 'Por Área', description: 'Materiales cuyo costo se calcula por metro cuadrado.' },
        { name: 'Por Unidad', description: 'Materiales cuyo costo se calcula por pieza o unidad.' },
        { name: 'Por Litro', description: 'Materiales líquidos cuyo costo se calcula por litro.' },
        { name: 'Por Metro Lineal', description: 'Materiales cuyo costo se calcula por metro lineal.' }
    ];
    const results = [];
    for (const type of defaultTypes) {
        const [existing] = await db.query('SELECT * FROM material_types WHERE name = ?', [type.name]);
        if (existing.length === 0) {
            const sql = 'INSERT INTO material_types (name, description) VALUES (?, ?)';
            const [result] = await db.query(sql, [type.name, type.description]);
            results.push({ id: result.insertId, ...type });
        } else {
            results.push({ id: existing[0].id, ...type, status: 'already existed' });
        }
    }
    return results;
};

const seedDefaultCompany = async () => {
    const companyName = 'Jipi';
    const [existing] = await db.query('SELECT * FROM owner_companies WHERE name = ?', [companyName]);
    if (existing.length === 0) {
        const sql = 'INSERT INTO owner_companies (name, profit_percentage) VALUES (?, ?)';
        const [result] = await db.query(sql, [companyName, 30]); // Default 30% profit
        return { id: result.insertId, name: companyName, status: 'created' };
    }
    return { ...existing[0], status: 'already existed' };
};

const seedRootUser = async (companyId) => {
    const username = 'root';
    const [existing] = await db.query('SELECT * FROM users WHERE username = ? AND owner_company_id = ?', [username, companyId]);
    if (existing.length === 0) {
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, password, owner_company_id) VALUES (?, ?, ?)';
        const [result] = await db.query(sql, [username, hashedPassword, companyId]);
        return { id: result.insertId, username, status: 'created' };
    }
    return { id: existing[0].id, username, status: 'already existed' };
};

const seedMenus = async (companyId) => {
    const defaultMenus = [
        // Top-level
        { name: 'Dashboard', path: '/dashboard', parent_id: null, owner_id: companyId },
        { name: 'Catálogos', path: '/catalogs', parent_id: null, owner_id: companyId },
        { name: 'Proyectos', path: '/projects', parent_id: null, owner_id: companyId },
        
        // Children of Catálogos
        { name: 'Materiales', path: '/catalogs/materials', parent_name: 'Catálogos', owner_id: companyId },
        { name: 'Accesorios', path: '/catalogs/accessories', parent_name: 'Catálogos', owner_id: companyId },
        { name: 'Playsets', path: '/catalogs/playsets', parent_name: 'Catálogos', owner_id: companyId },
    ];
    const results = [];
    const createdMenus = {};

    // Create top-level menus first
    for (const menu of defaultMenus.filter(m => !m.parent_name)) {
        const [existing] = await db.query('SELECT * FROM menus WHERE name = ? AND owner_id = ? AND parent_id IS NULL', [menu.name, companyId]);
        if (existing.length === 0) {
            const sql = 'INSERT INTO menus (name, path, parent_id, owner_id) VALUES (?, ?, ?, ?)';
            const [result] = await db.query(sql, [menu.name, menu.path, menu.parent_id, menu.owner_id]);
            createdMenus[menu.name] = { id: result.insertId, ...menu };
            results.push(createdMenus[menu.name]);
        } else {
            createdMenus[menu.name] = { ...existing[0], status: 'already existed' };
            results.push(createdMenus[menu.name]);
        }
    }

    // Create child menus
    for (const menu of defaultMenus.filter(m => m.parent_name)) {
        const parent = createdMenus[menu.parent_name];
        if (parent) {
            const [existing] = await db.query('SELECT * FROM menus WHERE name = ? AND owner_id = ? AND parent_id = ?', [menu.name, companyId, parent.id]);
            if (existing.length === 0) {
                 const sql = 'INSERT INTO menus (name, path, parent_id, owner_id) VALUES (?, ?, ?, ?)';
                const [result] = await db.query(sql, [menu.name, menu.path, parent.id, menu.owner_id]);
                results.push({ id: result.insertId, ...menu });
            } else {
                 results.push({ ...existing[0], status: 'already existed' });
            }
        }
    }
    return results;
};


router.get('/seed-database', async (req, res) => {
    try {
        const companyResult = await seedDefaultCompany();
        const companyId = companyResult.id;

        const userResult = await seedRootUser(companyId);
        const materialTypesResult = await seedMaterialTypes();
        const menusResult = await seedMenus(companyId);
        
        res.status(200).json({ 
            message: 'Database seeding complete.',
            company: companyResult,
            user: userResult,
            material_types: materialTypesResult,
            menus: menusResult
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to seed database.', error: error.message });
    }
});

module.exports = router; 