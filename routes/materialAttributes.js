const express = require('express');
const MaterialAttributes = require('../models/materialAttributesModel');
const router = express.Router();

router.post('/material-attributes', async (req, res) => {
  try {
    const { materialId, attributeName, attributeValue } = req.body;
    const attribute = await MaterialAttributes.createAttribute(materialId, attributeName, attributeValue);
    res.status(201).json(attribute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/material-attributes', async (req, res) => {
  try {
    const attrs = await MaterialAttributes.findAll();
    res.json(attrs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
