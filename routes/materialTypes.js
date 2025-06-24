const express = require('express');
const MaterialTypes = require('../models/materialTypesModel');
const router = express.Router();

/**
 * @openapi
 * /material-types:
 *   get:
 *     summary: Listar tipos de material
 *     tags:
 *       - MaterialTypes
 *     responses:
 *       200:
 *         description: Lista de tipos de material
 */
router.get('/material-types', async (req, res) => {
  try {
    const types = await MaterialTypes.findAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
