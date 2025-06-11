const express = require('express');
const Materials = require('../models/materialsModel');
const router = express.Router();

/**
 * Lista todos los materiales.
 * @route GET /materials
 */
router.get('/materials', async (req, res) => {
  try {
    const materials = await Materials.findAll();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Obtiene un material por ID.
 * @route GET /materials/:id
 */
router.get('/materials/:id', async (req, res) => {
  try {
    const material = await Materials.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material no encontrado' });
    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Crea un nuevo material.
 * @route POST /materials
 */
router.post('/materials', async (req, res) => {
  try {
    const {
      name,
      description,
      thickness_mm,
      width_m,
      length_m,
      price
    } = req.body;
    const material = await Materials.createMaterial(
      name,
      description,
      thickness_mm,
      width_m,
      length_m,
      price
    );
    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Actualiza un material existente.
 * @route PUT /materials/:id
 */
router.put('/materials/:id', async (req, res) => {
  try {
    const {
      name,
      description,
      thickness_mm,
      width_m,
      length_m,
      price
    } = req.body;
    const material = await Materials.findById(req.params.id);
    if (!material)
      return res.status(404).json({ message: 'Material no encontrado' });
    await Materials.updateMaterial(
      req.params.id,
      name,
      description,
      thickness_mm,
      width_m,
      length_m,
      price
    );
    res.json({ message: 'Material actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Elimina un material.
 * @route DELETE /materials/:id
 */
router.delete('/materials/:id', async (req, res) => {
  try {
    const material = await Materials.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material no encontrado' });
    await Materials.deleteMaterial(req.params.id);
    res.json({ message: 'Material eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
