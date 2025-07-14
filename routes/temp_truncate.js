const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/truncate-transactional-data', async (req, res) => {
    // Lista de tablas transaccionales. Se excluyen catálogos como
    // users, owner_companies, material_types, y menus.
    const tables = [
        'accessory_components',
        'accessory_materials',
        'accessory_pricing',
        'accessories',
        'materials',
        'clients',
        'projects',
        'remissions',
        'playsets',
        'playset_accessories',
        'installation_costs',
        'material_attributes' // Asumiendo que esta es transaccional
    ];

    const allTables = (await db.query('SHOW TABLES;'))[0].map(row => Object.values(row)[0]);
    const tablesToTruncate = tables.filter(t => allTables.includes(t));


    try {
        await db.query('SET FOREIGN_KEY_CHECKS = 0;');

        for (const table of tablesToTruncate) {
            await db.query(`TRUNCATE TABLE ${table};`);
        }

        await db.query('SET FOREIGN_KEY_CHECKS = 1;');

        res.status(200).json({ 
            message: `Successfully truncated transactional tables: ${tablesToTruncate.join(', ')}`,
            truncated: tablesToTruncate,
            skipped: tables.filter(t => !allTables.includes(t))
        });
    } catch (error) {
        await db.query('SET FOREIGN_KEY_CHECKS = 1;');
        res.status(500).json({ message: 'Failed to truncate tables.', error: error.message });
    }
});

module.exports = router; 