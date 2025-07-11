const express = require('express');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const AccessoryComponents = require('../models/accessoryComponentsModel');
const OwnerCompanies = require('../models/ownerCompaniesModel');
const router = express.Router();
const AccessoryPricing = require("../models/accessoryPricingModel");
const { ensureColumn } = require('../Modules/dbUtils');

const buildAccessoryPricing = async (accessoryId, ownerId = 1) => {
  const owner = await OwnerCompanies.findById(ownerId);
  const markup = owner ? +owner.profit_percentage : 0;
  const factor = 1 + markup / 100;

  const mats = await AccessoryMaterials.findMaterialsByAccessory(accessoryId);
  const materials = [];
  let totalMaterialsCost = 0;
  let totalMaterialsPrice = 0;
  for (const m of mats) {
    let cost;
    if (m.costo !== null && m.costo !== undefined) {
      cost = m.costo;
    } else {
      cost = await AccessoryMaterials.calculateCost(
        m.material_id,
        m.width_m || 0,
        m.length_m || 0,
        m.quantity != null ? m.quantity : 1
      );
    }
    cost = +cost.toFixed(2);
    const price = +(cost * factor).toFixed(2);
    totalMaterialsCost += cost;
    totalMaterialsPrice += price;
    materials.push({
      accessory_id: accessoryId,
      material_id: m.material_id,
      width: m.width_m,
      length: m.length_m,
      unit: m.unit,
      quantity: m.quantity,
      cost,
      price
    });
  }

  const comps = await AccessoryComponents.findByParentDetailed(accessoryId, ownerId);
  const accessories = [];
  let totalAccessoriesCost = 0;
  let totalAccessoriesPrice = 0;
  for (const c of comps) {
    const qty = c.quantity != null ? c.quantity : 1;
    const unitCost = c.cost;
    const cost = +(unitCost * qty).toFixed(2);
    const price = +(cost * factor).toFixed(2);
    totalAccessoriesCost += cost;
    totalAccessoriesPrice += price;
    accessories.push({
      accessory_id: c.child_accessory_id,
      price,
      cost,
      quantity: qty
    });
  }

  const totalCost = +(totalMaterialsCost + totalAccessoriesCost).toFixed(2);
  totalMaterialsPrice = +totalMaterialsPrice.toFixed(2);
  totalAccessoriesPrice = +totalAccessoriesPrice.toFixed(2);
  const totalPrice = +(totalMaterialsPrice + totalAccessoriesPrice).toFixed(2);

  await AccessoryPricing.upsertPricing(
    accessoryId,
    ownerId,
    markup,
    totalMaterialsPrice,
    totalAccessoriesPrice,
    totalPrice
  );

  return {
    accessory_id: accessoryId,
    markup_percentage: markup,
    materials,
    accessories,
    total_materials_cost: +totalMaterialsCost.toFixed(2),
    total_accessories_cost: +totalAccessoriesCost.toFixed(2),
    total_cost: totalCost,
    total_materials_price: totalMaterialsPrice,
    total_accessories_price: totalAccessoriesPrice,
    total_price: totalPrice
  };
};

// cost and price already include the quantity so leave them unchanged
const applyQuantityTotals = item => {
  return item;
};

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
    await Promise.all([
      ensureColumn('accessory_materials', 'investment', 'DECIMAL(10,2)'),
      ensureColumn('accessory_materials', 'descripcion_material', 'VARCHAR(255)')
    ]);
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

      const totals = materials.map(m => applyQuantityTotals({ ...m }));
      const inserted = await AccessoryMaterials.linkMaterialsBatch(
        accessory_id,
        totals,
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
      length,
      investment,
      description
    } = req.body;
    const totals = applyQuantityTotals({ cost, price, quantity });
    const link = await AccessoryMaterials.linkMaterial(
      accessoryId,
      materialId,
      totals.cost,
      profit_percentage,
      totals.price,
      quantity,
      width,
      length,
      investment,
      description,
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
    await Promise.all([
      ensureColumn('accessory_materials', 'investment', 'DECIMAL(10,2)'),
      ensureColumn('accessory_materials', 'descripcion_material', 'VARCHAR(255)')
    ]);
    if (Array.isArray(req.body.materials)) {
      const accessoryId = Number(req.params.id);
      const materials = req.body.materials;
      if (isNaN(accessoryId) || !materials.length)
        return res.status(400).json({ message: 'Datos incompletos' });

      const bodyDefaults = {
        cost: req.body.cost,
        price: req.body.price,
        profit_percentage:
          req.body.profit_percentage ??
          (req.body.profit_margin != null ? req.body.profit_margin * 100 : undefined)
      };

      if (
        bodyDefaults.price === undefined &&
        bodyDefaults.cost !== undefined &&
        bodyDefaults.profit_percentage !== undefined
      ) {
        const margin = bodyDefaults.profit_percentage / 100;
        bodyDefaults.price = +(bodyDefaults.cost * (1 + margin)).toFixed(2);
      }

      for (const m of materials) {
        if (typeof m.material_id !== 'number')
          return res.status(400).json({ message: 'material_id requerido' });
        const numericCheck = {
          cost: m.cost ?? bodyDefaults.cost,
          profit_percentage: m.profit_percentage ?? bodyDefaults.profit_percentage,
          price: m.price ?? bodyDefaults.price,
          quantity: m.quantity,
          width: m.width,
          length: m.length
        };
        for (const [k, v] of Object.entries(numericCheck)) {
          if (v !== undefined && v !== null && typeof v !== 'number')
            return res.status(400).json({ message: `${k} invalido` });
        }
      }

      const mapped = materials.map(m => {
        const item = {
          ...m,
          cost: m.cost ?? bodyDefaults.cost,
          profit_percentage: m.profit_percentage ?? bodyDefaults.profit_percentage,
          price: m.price ?? bodyDefaults.price
        };

        if (
          item.price === undefined &&
          item.cost !== undefined &&
          item.profit_percentage !== undefined
        ) {
          const margin = item.profit_percentage / 100;
          item.price = +(item.cost * (1 + margin)).toFixed(2);
        }

        return applyQuantityTotals(item);
      });

      await AccessoryMaterials.deleteByAccessory(accessoryId);
      await AccessoryMaterials.linkMaterialsBatch(accessoryId, mapped, 1);

      const ownerId = parseInt(req.query.owner_id || '1', 10);
      const pricing = await buildAccessoryPricing(accessoryId, ownerId);
      return res.json(pricing);
    }

    const {
      accessoryId = req.body.accessory_id,
      materialId = req.body.material_id,
      cost,
      profit_percentage: bodyProfitPercentage,
      profit_margin,
      price: bodyPrice,
      quantity,
      width,
      length,
      investment,
      description
    } = req.body;

    let profit_percentage =
      bodyProfitPercentage ?? (profit_margin != null ? profit_margin * 100 : undefined);
    let price = bodyPrice;
    if (price === undefined && cost !== undefined && profit_percentage !== undefined) {
      const margin = profit_percentage / 100;
      price = +(cost * (1 + margin)).toFixed(2);
    }

    if (typeof accessoryId !== 'number' || typeof materialId !== 'number')
      return res.status(400).json({ message: 'Datos incompletos' });

    const numericFields = { cost, profit_percentage, price, quantity, width, length, investment };
    for (const [key, value] of Object.entries(numericFields)) {
      if (value !== undefined && value !== null && typeof value !== 'number')
        return res.status(400).json({ message: `${key} invalido` });
    }

    const link = await AccessoryMaterials.findById(req.params.id);
    if (!link) return res.status(404).json({ message: 'Vinculo no encontrado' });
    const totals = applyQuantityTotals({ cost, price, quantity });
    await AccessoryMaterials.updateLinkData(
      req.params.id,
      accessoryId,
      materialId,
      totals.cost,
      profit_percentage,
      totals.price,
      quantity,
      width,
      length,
      investment,
      description
    );

    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const pricing = await buildAccessoryPricing(accessoryId, ownerId);
    res.json(pricing);
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
    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const owner = await OwnerCompanies.findById(ownerId);
    const markup = owner ? +owner.profit_percentage : 0;
    const factor = 1 + markup / 100;
    const { accessory_id, accessory_name } = rows[0];
    const materials = await Promise.all(
      rows.map(async row => {
        let cost;
        if (row.costo !== null && row.costo !== undefined) {
          cost = row.costo;
        } else {
          cost = await AccessoryMaterials.calculateCost(
            row.material_id,
            row.width_m || 0,
            row.length_m || 0,
            row.quantity != null ? row.quantity : 1
          );
        }
        cost = +cost.toFixed(2);
        const quantity =
          row.quantity && row.quantity !== 0
            ? row.quantity
            : row.width_m && row.length_m
            ? +(row.width_m * row.length_m).toFixed(2)
            : row.quantity;
        const price = +(cost * factor).toFixed(2);
        return {
          link_id: row.link_id,
          material_id: row.material_id,
          material_name: row.material_name,
          material_type_id: row.material_type_id,
          material_type_description: row.material_type_description,
          description: row.description,
          thickness_mm: row.thickness_mm,
          width_m: row.material_width,
          length_m: row.material_length,
          price: row.material_price,
          material_price: row.material_price,
          quantity,
          width_m_used: row.width_m,
          length_m_used: row.length_m,
          investment: row.investment,
          descripcion_material: row.descripcion_material,
          cost,
          profit_percentage: markup,
          price_override: price,
          unit: row.unit
        };
      })
    );
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
      cost: row.cost,
      unit: row.unit
    }));
    const total_cost = materials.reduce((sum, m) => sum + m.cost, 0);
    res.json({ accessory_id, accessory_name, total_cost, materials });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
module.exports.buildAccessoryPricing = buildAccessoryPricing;
