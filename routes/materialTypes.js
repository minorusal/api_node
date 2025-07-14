const express = require('express');
const MaterialTypes = require('../models/materialTypesModel');
const router = express.Router();
const catchAsync = require('../Modules/catchAsync');

/**
 * @openapi
 * /material-types:
 *   get:
 *     summary: Listar tipos de material
 *     tags:
 *       - MaterialTypes
 *     responses:
 *       200:
 *         description: Lista de tipos de material
 *   post:
 *     summary: Crear un nuevo tipo de material
 *     tags:
 *       - MaterialTypes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *             required: [name]
 *     responses:
 *       201: { description: 'Tipo de material creado' }
 *
 * /material-types/{id}:
 *   get:
 *     summary: Obtener un tipo de material por ID
 *     tags:
 *       - MaterialTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de material encontrado
 *       404:
 *         description: Tipo de material no encontrado
 *   put:
 *     summary: Actualizar un tipo de material
 *     tags:
 *       - MaterialTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *             required: [name]
 *     responses:
 *       200: { description: 'Tipo de material actualizado' }
 *       404: { description: 'Tipo de material no encontrado' }
 *   delete:
 *     summary: Eliminar un tipo de material
 *     tags:
 *       - MaterialTypes
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tipo de material eliminado
 *       404:
 *         description: Tipo de material no encontrado
 */

router.get('/', catchAsync(async (req, res) => {
    const types = await MaterialTypes.getAllMaterialTypes();
    res.json(types);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const type = await MaterialTypes.getMaterialTypeById(req.params.id);
    if (!type) {
        return res.status(404).json({ message: 'Tipo de material no encontrado' });
    }
    res.json(type);
}));

router.post('/', async (req, res) => {
    try {
        const newType = await MaterialTypes.createMaterialType(req.body);
        res.status(201).json(newType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedType = await MaterialTypes.updateMaterialType(req.params.id, req.body);
        if (!updatedType) {
            return res.status(404).json({ message: 'Tipo de material no encontrado' });
        }
        res.json(updatedType);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const type = await MaterialTypes.getMaterialTypeById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Tipo de material no encontrado' });
        }
        await MaterialTypes.deleteMaterialType(req.params.id);
        res.status(200).json({ message: 'Tipo de material eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
