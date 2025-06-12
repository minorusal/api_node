const express = require('express');
const Remissions = require('../models/remissionsModel');
const router = express.Router();

/**
 * @openapi
 * /remissions/by-owner/{owner_id}:
 *   get:
 *     summary: Obtener remisiones por owner
 *     tags:
 *       - Remissions
 *     parameters:
 *       - in: path
 *         name: owner_id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de remisiones
 */
router.get('/remissions/by-owner/:owner_id', async (req, res) => {
  try {
    const remissions = await Remissions.findByOwnerId(req.params.owner_id);
    res.json(remissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
