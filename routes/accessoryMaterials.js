const express = require('express');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const router = express.Router();

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

router.get('/accessories/materials-cost', async (req, res) => {
  try {
    const rows = await AccessoryMaterials.findAccessoriesWithMaterialsCost();
    const grouped = {};
    rows.forEach((row) => {
      if (!grouped[row.accessory_id]) {
        grouped[row.accessory_id] = {
          accessory_id: row.accessory_id,
          accessory_name: row.accessory_name,
          materials: []
        };
      }
      grouped[row.accessory_id].materials.push({
        material_id: row.material_id,
        material_name: row.material_name,
        quantity: row.quantity,
        width_m: row.width_m,
        length_m: row.length_m,
        cost: row.cost
      });
    });
    res.json(Object.values(grouped));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
