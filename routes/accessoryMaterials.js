const express = require('express');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const router = express.Router();

/**
 * @openapi
 * /accessory-materials:
 *   get:
 *     summary: Listar enlaces accesorio-material
 *     tags:
 *       - AccessoryMaterials
 *     responses:
 *       200:
 *         description: Lista de enlaces
 *   post:
 *     summary: Vincular material a accesorio
 *     tags:
 *       - AccessoryMaterials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessoryId:
 *                 type: integer
 *               materialId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               width:
 *                 type: number
 *               length:
 *                 type: number
 *     responses:
 *       201:
 *         description: Vinculo creado
 *
 * /accessories/{id}/materials-cost:
 *   get:
 *     summary: Obtener costo de materiales de un accesorio
 *     tags:
 *       - AccessoryMaterials
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Costos calculados
 *       404:
 *         description: Accesorio no encontrado
 */

router.post('/accessory-materials', async (req, res) => {
  try {
    const { accessoryId, materialId, quantity, width, length } = req.body;
    const link = await AccessoryMaterials.linkMaterial(
      accessoryId,
      materialId,
      quantity,
      width,
      length
    );
    const cost = await AccessoryMaterials.calculateCost(
      materialId,
      width,
      length,
      quantity
    );
    res.status(201).json({ ...link, cost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accessory-materials', async (req, res) => {
  try {
    const links = await AccessoryMaterials.findAll();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accessories/:id/materials-cost', async (req, res) => {
  try {
    const rows = await AccessoryMaterials.findMaterialsCostByAccessory(
      req.params.id
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Accesorio no encontrado' });
    const { accessory_id, accessory_name } = rows[0];
    const materials = rows.map((row) => ({
      material_id: row.material_id,
      material_name: row.material_name,
      quantity: row.quantity,
      width_m: row.width_m,
      length_m: row.length_m,
      cost: row.cost
    }));
    const total_cost = materials.reduce((sum, m) => sum + m.cost, 0);
    res.json({ accessory_id, accessory_name, total_cost, materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
