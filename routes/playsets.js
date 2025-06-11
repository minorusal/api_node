const express = require('express');
const Playsets = require('../models/playsetsModel');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const router = express.Router();

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

router.get('/playsets/:id', async (req, res) => {
  try {
    const playset = await Playsets.findById(req.params.id);
    if (!playset) return res.status(404).json({ message: 'Playset no encontrado' });
    res.json(playset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/playsets/:id/cost', async (req, res) => {
  try {
    const result = await PlaysetAccessories.calculatePlaysetCost(req.params.id);
    if (!result) return res.status(404).json({ message: 'Playset no encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/playsets', async (req, res) => {
  try {
    const { name, description } = req.body;
    const playset = await Playsets.createPlayset(name, description);
    res.status(201).json(playset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
