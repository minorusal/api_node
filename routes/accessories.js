const express = require('express');
const Accessories = require('../models/accessoriesModel');
const OwnerCompanies = require('../models/ownerCompaniesModel');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const AccessoryComponents = require('../models/accessoryComponentsModel');
const { buildAccessoryPricing } = require('./accessoryMaterials');
const AccessoryPricing = require('../models/accessoryPricingModel');
const { ensureColumn } = require('../Modules/dbUtils');
const db = require('../db');
const router = express.Router();

// cost and price are stored as totals so avoid modifying them
const applyQuantityTotals = item => {
  return item;
};

/**
 * @openapi
 * /accessories:
 *   get:
 *     summary: Listar accesorios
 *     tags:
 *       - Accessories
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Número de página (por defecto 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Cantidad de elementos por página (por defecto 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Texto a buscar en nombre o descripción
 *     responses:
 *       200:
 *         description: Lista de accesorios
 *   post:
 *     summary: Crear accesorio y vincular materiales
 *     tags:
 *       - Accessories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               owner_id:
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
 *               accessories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     accessory_id:
 *                       type: integer
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Accesorio creado
 *
 * /accessories/{id}:
 *   get:
 *     summary: Obtener accesorio por ID
 *     tags:
 *       - Accessories
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Accesorio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 materials:
 *                   type: array
 *                   items:
 *                     type: object
 *                 accessories:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Accesorio no encontrado
 *   put:
 *     summary: Actualizar accesorio
 *     tags:
 *       - Accessories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Accesorio actualizado
 *       404:
 *         description: Accesorio no encontrado
 *   delete:
 *     summary: Eliminar accesorio
 *     tags:
 *       - Accessories
 *     responses:
 *       200:
 *         description: Accesorio eliminado
 *       404:
 *         description: Accesorio no encontrado
 */
router.get('/accessories', async (req, res) => {
  try {
    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';

    const [accessories, totalDocs] = await Promise.all([
      Accessories.findByOwnerWithCostsPaginated(ownerId, page, limit, search),
      Accessories.countByOwner(ownerId, search)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    res.json({
      docs: accessories,
      totalDocs,
      totalPages,
      page,
      limit,
      search
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Obtiene un accesorio por ID.
 * @route GET /accessories/:id
 */
router.get('/accessories/:id', async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory)
      return res.status(404).json({ message: 'Accesorio no encontrado' });
    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const rawMaterials = await AccessoryMaterials.findMaterialsByAccessory(
      accessory.id
    );
    const pricing = await AccessoryPricing.findByAccessory(accessory.id, ownerId);
    let markup = pricing ? +pricing.markup_percentage : undefined;
    if (markup === undefined) {
      const owner = await OwnerCompanies.findById(ownerId);
      markup = owner ? +owner.profit_percentage : 0;
    }
    const factor = 1 + markup / 100;

    const materials = [];
    let totalMaterialsCost = 0;
    let totalMaterialsPrice = 0;
    for (const m of rawMaterials) {
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
      const quantity =
        m.quantity && m.quantity !== 0
          ? m.quantity
          : m.width_m && m.length_m
          ? +(m.width_m * m.length_m).toFixed(2)
          : m.quantity;
      materials.push({
        ...m,
        quantity,
        cost,
        profit_percentage: markup,
        price
      });
    }

    const compRows = await AccessoryComponents.findByParentDetailed(
      accessory.id,
      ownerId
    );
    const accessories = [];
    let totalAccessoriesCost = 0;
    let totalAccessoriesPrice = 0;
    for (const c of compRows) {
      const qty = c.quantity != null ? c.quantity : 1;
      const unitCost = c.cost;
      const cost = +(unitCost * qty).toFixed(2);
      const price = +(cost * factor).toFixed(2);
      totalAccessoriesCost += cost;
      totalAccessoriesPrice += price;
      accessories.push({
        ...c,
        cost,
        price,
        quantity: qty
      });
    }

    const totalCost = +(totalMaterialsCost + totalAccessoriesCost).toFixed(2);
    totalMaterialsPrice = +totalMaterialsPrice.toFixed(2);
    totalAccessoriesPrice = +totalAccessoriesPrice.toFixed(2);
    const totalPrice = +(totalMaterialsPrice + totalAccessoriesPrice).toFixed(2);

    res.json({
      ...accessory,
      markup_percentage: markup,
      total_materials_cost: +totalMaterialsCost.toFixed(2),
      total_accessories_cost: +totalAccessoriesCost.toFixed(2),
      total_cost: totalCost,
      total_materials_price: totalMaterialsPrice,
      total_accessories_price: totalAccessoriesPrice,
      total_price: totalPrice,
      materials,
      accessories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Calcula el costo y precio de un accesorio.
 * @route GET /accessories/:id/cost
 */
router.get('/accessories/:id/cost', async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory)
      return res.status(404).json({ message: 'Accesorio no encontrado' });
    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const owner = await OwnerCompanies.findById(ownerId);
    const profitPercentage = owner ? +owner.profit_percentage : 0;
    const margin = profitPercentage / 100;
    const factor = 1 + margin;
    const cost = await Accessories.calculateAccessoryCost(accessory.id);
    const price = +(cost * factor).toFixed(2);
    res.json({
      accessory_id: accessory.id,
      accessory_name: accessory.name,
      cost,
      price,
      profit_margin: margin,
      profit_percentage: profitPercentage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Crea un accesorio.
 * @route POST /accessories
 */
router.post('/accessories', async (req, res) => {
  try {
    const {
      name,
      description,
      owner_id = 1,
      markup_percentage,
      total_materials_cost,
      total_accessories_cost,
      total_cost,
      materials,
      accessories
    } = req.body;

    await Promise.all([
      ensureColumn('accessory_materials', 'investment', 'DECIMAL(10,2)'),
      ensureColumn('accessory_materials', 'descripcion_material', 'VARCHAR(255)'),
      ensureColumn('accessory_components', 'child_accessory_name', 'VARCHAR(100)'),
      ensureColumn('accessory_components', 'cost', 'DECIMAL(10,2)'),
      ensureColumn('accessory_components', 'price', 'DECIMAL(10,2)'),
      ensureColumn('accessory_pricing', 'markup_percentage', 'DECIMAL(10,2) DEFAULT 0'),
      ensureColumn('accessory_pricing', 'total_materials_price', 'DECIMAL(10,2) DEFAULT 0'),
      ensureColumn('accessory_pricing', 'total_accessories_price', 'DECIMAL(10,2) DEFAULT 0'),
      ensureColumn('accessory_pricing', 'total_price', 'DECIMAL(10,2) DEFAULT 0')
    ]);

    const accessory = await Accessories.createAccessory(name, description, owner_id);

    if (Array.isArray(materials) && materials.length) {
      const mapped = materials.map(m =>
        applyQuantityTotals({
          material_id: m.material_id,
          cost: m.cost,
          profit_percentage: m.profit_percentage,
          price: m.price,
          quantity: m.quantity,
          width: m.width,
          length: m.length,
          investment: m.investment,
          description: m.description
        })
      );
      await AccessoryMaterials.linkMaterialsBatch(accessory.id, mapped, owner_id);
    }

    if (Array.isArray(accessories) && accessories.length) {
      const comps = accessories.map(a => ({
        accessory_id: a.accessory_id,
        quantity: a.quantity,
        name: a.name,
        cost: a.cost,
        price: a.price
      }));
      await AccessoryComponents.createComponentLinksBatch(accessory.id, comps, owner_id);
    }

    let pricing;
    if (
      markup_percentage !== undefined ||
      total_materials_cost !== undefined ||
      total_accessories_cost !== undefined ||
      total_cost !== undefined
    ) {
      await AccessoryPricing.upsertPricing(
        accessory.id,
        owner_id,
        markup_percentage ?? 0,
        total_materials_cost ?? 0,
        total_accessories_cost ?? 0,
        total_cost ?? 0
      );
      pricing = {
        accessory_id: accessory.id,
        markup_percentage: markup_percentage ?? 0,
        total_materials_price: total_materials_cost ?? 0,
        total_accessories_price: total_accessories_cost ?? 0,
        total_price: total_cost ?? 0
      };
    } else {
      pricing = await buildAccessoryPricing(accessory.id, owner_id);
    }
    res.status(201).json(pricing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * Actualiza un accesorio existente.
 * @route PUT /accessories/:id
 */
router.put('/accessories/:id', async (req, res) => {
  const id = Number(req.params.id);
  const {
    name,
    description,
    markup_percentage,
    materials,
    accessories,
    totals = {},
    owner_id = 1
  } = req.body;

  const begin = () =>
    new Promise((resolve, reject) => {
      db.beginTransaction(err => (err ? reject(err) : resolve()));
    });
  const commit = () =>
    new Promise((resolve, reject) => {
      db.commit(err => (err ? reject(err) : resolve()));
    });
  const rollback = () =>
    new Promise(resolve => {
      db.rollback(() => resolve());
    });

  try {
    await begin();

    const accessory = await Accessories.findById(id);
    if (!accessory) {
      await rollback();
      return res.status(404).json({ message: 'Accesorio no encontrado' });
    }

    await Accessories.updateAccessory(id, name, description);

    if (Array.isArray(materials)) {
      await AccessoryMaterials.deleteByAccessory(id);
      const mapped = materials.map(m =>
        applyQuantityTotals({
          material_id: m.material_id,
          cost: m.cost,
          profit_percentage: m.profit_percentage,
          price: m.price,
          quantity: m.quantity,
          width: m.width,
          length: m.length,
          investment: m.investment,
          description: m.description
        })
      );
      await AccessoryMaterials.linkMaterialsBatch(id, mapped, owner_id);
    }

    if (Array.isArray(accessories)) {
      await AccessoryComponents.deleteByParent(id);
      const comps = accessories.map(a => ({
        accessory_id: a.accessory_id,
        quantity: a.quantity,
        name: a.name,
        cost: a.cost,
        price: a.price
      }));
      await AccessoryComponents.createComponentLinksBatch(id, comps, owner_id);
    }

    if (
      markup_percentage !== undefined ||
      totals.total_materials_cost !== undefined ||
      totals.total_accessories_cost !== undefined ||
      totals.total_cost !== undefined
    ) {
      await AccessoryPricing.upsertPricing(
        id,
        owner_id,
        markup_percentage ?? 0,
        totals.total_materials_cost ?? 0,
        totals.total_accessories_cost ?? 0,
        totals.total_cost ?? 0
      );
    }

    await commit();
    res.json({ message: 'Accesorio actualizado' });
  } catch (error) {
    await rollback();
    res.status(500).json({ message: error.message });
  }
});

/**
 * Elimina un accesorio.
 * @route DELETE /accessories/:id
 */
router.delete('/accessories/:id', async (req, res) => {
  try {
    const accessory = await Accessories.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: 'Accesorio no encontrado' });
    await Accessories.deleteAccessory(req.params.id);
    res.json({ message: 'Accesorio eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
