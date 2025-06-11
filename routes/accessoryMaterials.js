const express = require('express');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const router = express.Router();

router.post('/accessory-materials', async (req, res) => {
  try {
    const { accessoryId, materialId, quantity } = req.body;
    const link = await AccessoryMaterials.linkMaterial(accessoryId, materialId, quantity);
    res.status(201).json(link);
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

module.exports = router;
