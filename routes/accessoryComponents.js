const express = require('express');
const AccessoryComponents = require('../models/accessoryComponentsModel');
const router = express.Router();

// Create component link
router.post('/accessory-components', async (req, res) => {
  try {
    const { parent_accessory_id, child_accessory_id, quantity } = req.body;
    const link = await AccessoryComponents.createComponentLink(
      parent_accessory_id,
      child_accessory_id,
      quantity,
      1
    );
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all links
router.get('/accessory-components', async (req, res) => {
  try {
    const links = await AccessoryComponents.findAll();
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List components of a parent accessory
router.get('/accessories/:id/components', async (req, res) => {
  try {
    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const rows = await AccessoryComponents.findByParentDetailed(
      req.params.id,
      ownerId
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete link
router.delete('/accessory-components/:id', async (req, res) => {
  try {
    const result = await AccessoryComponents.deleteLink(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Vinculo no encontrado' });
    res.json({ message: 'Vinculo eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
