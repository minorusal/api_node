const express = require('express');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const router = express.Router();

router.get('/playsets/:id/cost', async (req, res) => {
  try {
    const result = await PlaysetAccessories.calculatePlaysetCost(req.params.id);
    if (!result) return res.status(404).json({ message: 'Playset no encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
