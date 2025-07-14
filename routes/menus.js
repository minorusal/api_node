const express = require('express');
const Menus = require('../models/menusModel');
const router = express.Router();
const catchAsync = require('../Modules/catchAsync');

/**
 * @openapi
 * /menus/tree:
 *   get:
 *     summary: Obtener el árbol de menús anidado
 *     tags:
 *       - Menus
 *     responses:
 *       200:
 *         description: Árbol de menús
 *
 * /menus:
 *   get:
 *     summary: Listar todos los menús (sin anidar)
 *     tags:
 *       - Menus
 *     responses:
 *       200:
 *         description: Lista plana de menús
 *   post:
 *     summary: Crear un nuevo menú
 *     tags:
 *       - Menus
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Menu'
 *     responses:
 *       201:
 *         description: Menú creado
 *
 * /menus/{id}:
 *   get:
 *     summary: Obtener un menú por ID
 *     tags:
 *       - Menus
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menú encontrado
 *       404:
 *         description: Menú no encontrado
 *   put:
 *     summary: Actualizar un menú
 *     tags:
 *       - Menus
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Menu'
 *     responses:
 *       200:
 *         description: Menú actualizado
 *       404:
 *         description: Menú no encontrado
 *   delete:
 *     summary: Eliminar un menú
 *     tags:
 *       - Menus
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Menú eliminado
 *       404:
 *         description: Menú no encontrado
 */

// Ruta para obtener el árbol de menús
router.get('/tree', catchAsync(async (req, res) => {
    const tree = await Menus.getMenuTree();
    res.json(tree);
}));

// Ruta para obtener todos los menús en una lista plana
router.get('/', catchAsync(async (req, res) => {
    const menus = await Menus.getAllMenus();
    res.json(menus);
}));

// Ruta para obtener un menú por ID
router.get('/:id', catchAsync(async (req, res) => {
    const menu = await Menus.getMenuById(req.params.id);
    if (!menu) {
        return res.status(404).json({ message: 'Menú no encontrado' });
    }
    res.json(menu);
}));

// Ruta para crear un nuevo menú
router.post('/', catchAsync(async (req, res) => {
    const newMenu = await Menus.createMenu(req.body);
    res.status(201).json(newMenu);
}));

// Ruta para actualizar un menú
router.put('/:id', catchAsync(async (req, res) => {
    const result = await Menus.updateMenu(req.params.id, req.body);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Menú no encontrado' });
    }
    res.json({ message: 'Menú actualizado' });
}));

// Ruta para eliminar un menú
router.delete('/:id', catchAsync(async (req, res) => {
    const result = await Menus.deleteMenu(req.params.id);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Menú no encontrado' });
    }
    res.status(200).json({ message: 'Menú eliminado' });
}));

module.exports = router;
