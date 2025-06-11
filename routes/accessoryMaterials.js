const express = require('express');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const router = express.Router();

/**
 * Crea la relación entre un accesorio y un material.
 * @route POST /accessory-materials
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

/**
 * Lista todas las relaciones accesorio-material.
 * @route GET /accessory-materials
 */
router.get('/accessory-materials', async (req, res) => {
  try {
    const links = await AccessoryMaterials.findAll();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Obtiene el costo de materiales para un accesorio.
 * @route GET /accessories/:id/materials-cost
 */
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
