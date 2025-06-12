const express = require('express');
const { getStyle, saveStyle } = require('../Modules/styleConfig');
const router = express.Router();

/**
 * @openapi
 * /remission-style:
 *   get:
 *     summary: Obtener estilos de remisión
 *     tags:
 *       - RemissionStyle
 *   put:
 *     summary: Actualizar estilos de remisión
 *     tags:
 *       - RemissionStyle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               headerBackgroundColor:
 *                 type: string
 *               headerTextColor:
 *                 type: string
 */

// Obtener estilos actuales
router.get('/remission-style', (req, res) => {
  res.json(getStyle());
});

// Actualizar estilos de remisión
router.put('/remission-style', (req, res) => {
  const { headerBackgroundColor, headerTextColor } = req.body;
  if (!headerBackgroundColor && !headerTextColor) {
    return res.status(400).json({ message: 'Se requiere al menos un campo' });
  }
  const style = saveStyle({ headerBackgroundColor, headerTextColor });
  res.json(style);
});

module.exports = router;
