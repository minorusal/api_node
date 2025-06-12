const express = require('express');
const Menus = require('../models/menusModel');
const router = express.Router();

/**
 * @openapi
 * /menus:
 *   get:
 *     summary: Obtener árbol de menús
 *     tags:
 *       - Menus
 *     parameters:
 *       - in: query
 *         name: owner_id
 *         schema:
 *           type: integer
 *         required: false
 *         description: ID del owner para filtrar
 *     responses:
 *       200:
 *         description: Árbol de menús
 *   post:
 *     summary: Crear menú o submenú
 *     tags:
 *       - Menus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               path:
 *                 type: string
 *                 nullable: true
 *               parent_id:
 *                 type: integer
 *                 nullable: true
 *               owner_id:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Menú creado
 */
router.get('/menus', async (req, res) => {
  try {
    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const menus = await Menus.getMenuTree(ownerId);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/menus', async (req, res) => {
  try {
    const { name, path = null, parent_id = null, owner_id = 1 } = req.body;
    const menu = await Menus.createMenu(name, path, parent_id, owner_id);
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
