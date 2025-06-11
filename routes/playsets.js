const express = require('express');
const Playsets = require('../models/playsetsModel');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const router = express.Router();

/**
 * @openapi
 * /playsets:
 *   get:
 *     summary: Listar playsets con costo calculado
 *     tags:
 *       - Playsets
 *     responses:
 *       200:
 *         description: Lista de playsets
 *   post:
 *     summary: Crear playset
 *     tags:
 *       - Playsets
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
 *         description: Playset creado
 *
 * /playsets/{id}:
 *   get:
 *     summary: Obtener playset por ID
 *     tags:
 *       - Playsets
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playset encontrado
 *       404:
 *         description: Playset no encontrado
 *   put:
 *     summary: Actualizar playset
 *     tags:
 *       - Playsets
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
 *         description: Playset actualizado
 *       404:
 *         description: Playset no encontrado
 *   delete:
 *     summary: Eliminar playset
 *     tags:
 *       - Playsets
 *     responses:
 *       200:
 *         description: Playset eliminado
 *       404:
 *         description: Playset no encontrado
 *
 * /playsets/{id}/cost:
 *   get:
 *     summary: Calcular costo total de un playset
 *     tags:
 *       - Playsets
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Costo del playset
 *       404:
 *         description: Playset no encontrado
 */
router.get('/playsets', async (req, res) => {
  try {
    const playsets = await Playsets.findAll();
    const detailed = await Promise.all(
      playsets.map(async (p) => {
        const costInfo = await PlaysetAccessories.calculatePlaysetCost(p.id);
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          accessories: costInfo ? costInfo.accessories : [],
          total_cost: costInfo ? costInfo.total_cost : 0
        };
      })
    );
    res.json(detailed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Obtiene un playset por ID.
 * @route GET /playsets/:id
 */
router.get('/playsets/:id', async (req, res) => {
  try {
    const playset = await Playsets.findById(req.params.id);
    if (!playset) return res.status(404).json({ message: 'Playset no encontrado' });
    res.json(playset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Calcula el costo de un playset específico.
 * @route GET /playsets/:id/cost
 */
router.get('/playsets/:id/cost', async (req, res) => {
  try {
    const result = await PlaysetAccessories.calculatePlaysetCost(req.params.id);
    if (!result) return res.status(404).json({ message: 'Playset no encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Crea un playset.
 * @route POST /playsets
 */
router.post('/playsets', async (req, res) => {
  try {
    const { name, description } = req.body;
    const playset = await Playsets.createPlayset(name, description);
    res.status(201).json(playset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Actualiza un playset existente.
 * @route PUT /playsets/:id
 */
router.put('/playsets/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const playset = await Playsets.findById(req.params.id);
    if (!playset) return res.status(404).json({ message: 'Playset no encontrado' });
    await Playsets.updatePlayset(req.params.id, name, description);
    res.json({ message: 'Playset actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Elimina un playset.
 * @route DELETE /playsets/:id
 */
router.delete('/playsets/:id', async (req, res) => {
  try {
    const playset = await Playsets.findById(req.params.id);
    if (!playset) return res.status(404).json({ message: 'Playset no encontrado' });
    await Playsets.deletePlayset(req.params.id);
    res.json({ message: 'Playset eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
