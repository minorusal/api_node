const express = require('express');
const Accessories = require('../models/accessoriesModel');
const router = express.Router();

/**
 * @openapi
 * /accessories:
 *   get:
 *     summary: Listar accesorios
 *     tags:
 *       - Accessories
 *     responses:
 *       200:
 *         description: Lista de accesorios
 *   post:
 *     summary: Crear accesorio
 *     tags:
 *       - Accessories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Accesorio creado
 *
 * /accessories/{id}:
 *   get:
 *     summary: Obtener accesorio por ID
 *     tags:
 *       - Accessories
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Accesorio encontrado
 *       404:
 *         description: Accesorio no encontrado
 *   put:
 *     summary: Actualizar accesorio
 *     tags:
 *       - Accessories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Accesorio actualizado
 *       404:
 *         description: Accesorio no encontrado
 *   delete:
 *     summary: Eliminar accesorio
 *     tags:
 *       - Accessories
 *     responses:
 *       200:
 *         description: Accesorio eliminado
 *       404:
 *         description: Accesorio no encontrado
 */
router.get('/accessories', async (req, res) => {
  try {
    const accessories = await Accessories.findAll();
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Obtiene un accesorio por ID.
 * @route GET /accessories/:id
 */
router.get('/accessories/:id', async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: 'Accesorio no encontrado' });
    res.json(accessory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Crea un accesorio.
 * @route POST /accessories
 */
router.post('/accessories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const accessory = await Accessories.createAccessory(name, description, 1);
    res.status(201).json(accessory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Actualiza un accesorio existente.
 * @route PUT /accessories/:id
 */
router.put('/accessories/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: 'Accesorio no encontrado' });
    await Accessories.updateAccessory(req.params.id, name, description);
    res.json({ message: 'Accesorio actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Elimina un accesorio.
 * @route DELETE /accessories/:id
 */
router.delete('/accessories/:id', async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: 'Accesorio no encontrado' });
    await Accessories.deleteAccessory(req.params.id);
    res.json({ message: 'Accesorio eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
