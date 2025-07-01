const express = require('express');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const router = express.Router();

/**
 * @openapi
 * /accessory-materials:
 *   get:
 *     summary: Listar enlaces accesorio-material
 *     tags:
 *       - AccessoryMaterials
 *     responses:
 *       200:
 *         description: Lista de enlaces
 *   post:
 *     summary: Vincular material a accesorio
 *     tags:
 *       - AccessoryMaterials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessory_id:
 *                 type: integer
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     material_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *                     width:
 *                       type: number
 *                     length:
 *                       type: number
 *                     cost:
 *                       type: number
 *                     price:
 *                       type: number
 *                     profit_percentage:
 *                       type: number
 *     responses:
 *       201:
 *         description: Vinculo creado
 *
 * /accessory-materials/{id}:
 *   put:
 *     summary: Actualizar vinculo o reemplazar materiales
 *     tags:
 *       - AccessoryMaterials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessoryId:
 *                 type: integer
 *               materialId:
 *                 type: integer
 *               cost:
 *                 type: number
 *               profit_percentage:
 *                 type: number
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               width:
 *                 type: number
 *               length:
 *                 type: number
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     material_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *                     width:
 *                       type: number
 *                     length:
 *                       type: number
 *                     cost:
 *                       type: number
 *                     price:
 *                       type: number
 *                     profit_percentage:
 *                       type: number
 *     responses:
 *       200:
 *         description: Vinculo actualizado
 *       404:
 *         description: Vinculo no encontrado
 *
 * /accessories/{id}/materials-cost:
 *   get:
 *     summary: Obtener costo de materiales de un accesorio
 *     tags:
 *       - AccessoryMaterials
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Costos calculados
 *       404:
 *         description: Accesorio no encontrado
 */
/**
 * /accessories/{id}/materials:
 *   get:
 *     summary: Listar materiales de un accesorio
 *     tags:
 *       - AccessoryMaterials
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de materiales
 *       404:
 *         description: Accesorio no encontrado
 */
router.post('/accessory-materials', async (req, res) => {
  try {
    if (Array.isArray(req.body.materials)) {
      const { accessory_id, materials } = req.body;
      if (!accessory_id || !materials.length)
        return res.status(400).json({ message: 'Datos incompletos' });

      for (const m of materials) {
        if (typeof m.material_id !== 'number')
          return res.status(400).json({ message: 'material_id requerido' });
        if (m.cost && typeof m.cost !== 'number')
          return res.status(400).json({ message: 'cost invalido' });
        if (m.price && typeof m.price !== 'number')
          return res.status(400).json({ message: 'price invalido' });
        if (m.profit_percentage && typeof m.profit_percentage !== 'number')
          return res.status(400).json({ message: 'profit_percentage invalido' });
      }

      const inserted = await AccessoryMaterials.linkMaterialsBatch(
        accessory_id,
        materials,
        1
      );

      const withCost = [];
      for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];
        const c = await AccessoryMaterials.calculateCost(
          mat.material_id,
          mat.width || 0,
          mat.length || 0,
          mat.quantity || 1
        );
        withCost.push({ ...inserted[i], cost: c });
      }
      return res.status(201).json(withCost);
    }

    const {
      accessoryId,
      materialId,
      cost,
      profit_percentage,
      price,
      quantity,
      width,
      length
    } = req.body;
    const link = await AccessoryMaterials.linkMaterial(
      accessoryId,
      materialId,
      cost,
      profit_percentage,
      price,
      quantity,
      width,
      length,
      1
    );
    const calculatedCost = await AccessoryMaterials.calculateCost(
      materialId,
      width,
      length,
      quantity
    );
    res.status(201).json({ ...link, cost: calculatedCost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Lista todas las relaciones accesorio-material.
 * @route GET /accessory-materials
 */
router.get('/accessory-materials', async (req, res) => {
  try {
    const links = await AccessoryMaterials.findAll();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Actualiza un vínculo accesorio-material.
 * @route PUT /accessory-materials/:id
 */
router.put('/accessory-materials/:id', async (req, res) => {
  try {
    if (Array.isArray(req.body.materials)) {
      const accessoryId = Number(req.params.id);
      const materials = req.body.materials;
      if (isNaN(accessoryId) || !materials.length)
        return res.status(400).json({ message: 'Datos incompletos' });

      for (const m of materials) {
        if (typeof m.material_id !== 'number')
          return res.status(400).json({ message: 'material_id requerido' });
        const numericCheck = {
          cost: m.cost,
          profit_percentage: m.profit_percentage,
          price: m.price,
          quantity: m.quantity,
          width: m.width,
          length: m.length
        };
        for (const [k, v] of Object.entries(numericCheck)) {
          if (v !== undefined && v !== null && typeof v !== 'number')
            return res.status(400).json({ message: `${k} invalido` });
        }
      }

      await AccessoryMaterials.deleteByAccessory(accessoryId);
      const inserted = await AccessoryMaterials.linkMaterialsBatch(accessoryId, materials, 1);
      const withCost = [];
      for (let i = 0; i < materials.length; i++) {
        const mat = materials[i];
        const c = await AccessoryMaterials.calculateCost(
          mat.material_id,
          mat.width || 0,
          mat.length || 0,
          mat.quantity || 1
        );
        withCost.push({ ...inserted[i], cost: c });
      }
      return res.json(withCost);
    }

    const {
      accessoryId = req.body.accessory_id,
      materialId = req.body.material_id,
      cost,
      profit_percentage,
      price,
      quantity,
      width,
      length
    } = req.body;

    if (typeof accessoryId !== 'number' || typeof materialId !== 'number')
      return res.status(400).json({ message: 'Datos incompletos' });

    const numericFields = { cost, profit_percentage, price, quantity, width, length };
    for (const [key, value] of Object.entries(numericFields)) {
      if (value !== undefined && value !== null && typeof value !== 'number')
        return res.status(400).json({ message: `${key} invalido` });
    }

    const link = await AccessoryMaterials.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Vinculo no encontrado' });
    await AccessoryMaterials.updateLinkData(
      req.params.id,
      accessoryId,
      materialId,
      cost,
      profit_percentage,
      price,
      quantity,
      width,
      length
    );
    res.json({ message: 'Vinculo actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Obtiene los materiales vinculados a un accesorio.
 * @route GET /accessories/:id/materials
 */
router.get('/accessories/:id/materials', async (req, res) => {
  try {
    const rows = await AccessoryMaterials.findMaterialsByAccessory(req.params.id);
    if (rows.length === 0)
      return res.status(404).json({ message: 'Accesorio no encontrado' });
    const { accessory_id, accessory_name } = rows[0];
    const materials = rows.map((row) => ({
      link_id: row.link_id,
      material_id: row.material_id,
      material_name: row.material_name,
      material_type_id: row.material_type_id,
      material_type_description: row.material_type_description,
      description: row.description,
      thickness_mm: row.thickness_mm,
      width_m: row.material_width,
      length_m: row.material_length,
      price: row.price,
      quantity: row.quantity,
      width_m_used: row.width_m,
      length_m_used: row.length_m,
      cost: row.costo,
      profit_percentage: row.porcentaje_ganancia,
      price_override: row.precio
    }));
    res.json({ accessory_id, accessory_name, materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Obtiene el costo de materiales para un accesorio.
 * @route GET /accessories/:id/materials-cost
 */
router.get('/accessories/:id/materials-cost', async (req, res) => {
  try {
    const rows = await AccessoryMaterials.findMaterialsCostByAccessory(
      req.params.id
    );
    if (rows.length === 0)
      return res.status(404).json({ message: 'Accesorio no encontrado' });
    const { accessory_id, accessory_name } = rows[0];
    const materials = rows.map((row) => ({
      material_id: row.material_id,
      material_name: row.material_name,
      quantity: row.quantity,
      width_m: row.width_m,
      length_m: row.length_m,
      cost: row.cost
    }));
    const total_cost = materials.reduce((sum, m) => sum + m.cost, 0);
    res.json({ accessory_id, accessory_name, total_cost, materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
