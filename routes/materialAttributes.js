const express = require('express');
const MaterialAttributes = require('../models/materialAttributesModel');
const router = express.Router();

/**
 * @openapi
 * /material-attributes:
 *   get:
 *     summary: Listar atributos de materiales
 *     tags:
 *       - MaterialAttributes
 *     responses:
 *       200:
 *         description: Lista de atributos
 *   post:
 *     summary: Crear atributo
 *     tags:
 *       - MaterialAttributes
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               materialId:
 *                 type: integer
 *               attributeName:
 *                 type: string
 *               attributeValue:
 *                 type: string
 *     responses:
 *       201:
 *         description: Atributo creado
 */

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
