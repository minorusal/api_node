const express = require('express');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const router = express.Router();

/**
 * Crea el vínculo entre un playset y un accesorio.
 * @route POST /playset-accessories
 */
router.post('/playset-accessories', async (req, res) => {
  try {
    const { playsetId, accessoryId, quantity } = req.body;
    const link = await PlaysetAccessories.linkAccessory(playsetId, accessoryId, quantity);
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Lista todos los vínculos existentes.
 * @route GET /playset-accessories
 */
router.get('/playset-accessories', async (req, res) => {
  try {
    const links = await PlaysetAccessories.findAll();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Actualiza la cantidad de un vínculo.
 * @route PUT /playset-accessories/:id
 */
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

/**
 * Elimina un vínculo.
 * @route DELETE /playset-accessories/:id
 */
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
