const express = require('express');
const Accessories = require('../models/accessoriesModel');
const router = express.Router();

router.get('/accessories', async (req, res) => {
  try {
    const accessories = await Accessories.findAll();
    res.json(accessories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/accessories/:id', async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: 'Accesorio no encontrado' });
    res.json(accessory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/accessories', async (req, res) => {
  try {
    const { name, description } = req.body;
    const accessory = await Accessories.createAccessory(name, description);
    res.status(201).json(accessory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
