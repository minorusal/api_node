const express = require('express');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const router = express.Router();

// Create link between playset and accessory
router.post('/playset-accessories', async (req, res) => {
  try {
    const { playsetId, accessoryId, quantity } = req.body;
    const link = await PlaysetAccessories.linkAccessory(playsetId, accessoryId, quantity);
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List all links
router.get('/playset-accessories', async (req, res) => {
  try {
    const links = await PlaysetAccessories.findAll();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update quantity for a link
router.put('/playset-accessories/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const link = await PlaysetAccessories.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Vinculo no encontrado' });
    await PlaysetAccessories.updateLink(req.params.id, quantity);
    res.json({ message: 'Vinculo actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete link
router.delete('/playset-accessories/:id', async (req, res) => {
  try {
    const link = await PlaysetAccessories.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Vinculo no encontrado' });
    await PlaysetAccessories.deleteLink(req.params.id);
    res.json({ message: 'Vinculo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
