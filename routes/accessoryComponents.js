const express = require('express');
const AccessoryComponents = require('../models/accessoryComponentsModel');
const router = express.Router();
const { buildAccessoryPricing } = require('./accessoryMaterials');
const { ensureColumn } = require('../Modules/dbUtils');

// Create component link
router.post('/accessory-components', async (req, res) => {
  try {
    await Promise.all([
      ensureColumn('accessory_components', 'cost', 'DECIMAL(10,2)'),
      ensureColumn('accessory_components', 'price', 'DECIMAL(10,2)')
    ]);
    const { parent_accessory_id, child_accessory_id, quantity, name, cost, price } = req.body;
    const link = await AccessoryComponents.createComponentLink(
      parent_accessory_id,
      child_accessory_id,
      quantity,
      name,
      cost,
      price,
      1
    );
    res.status(201).json(link);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all links
router.get('/accessory-components', async (req, res) => {
  try {
    const links = await AccessoryComponents.findAll();
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List components of a parent accessory
router.get('/accessories/:id/components', async (req, res) => {
  try {
    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const rows = await AccessoryComponents.findByParentDetailed(
      req.params.id,
      ownerId
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Replace components of a parent accessory
router.put('/accessories/:id/components', async (req, res) => {
  try {
    const parentId = Number(req.params.id);
    const components = req.body.components;
    if (isNaN(parentId) || !Array.isArray(components))
      return res.status(400).json({ message: 'Datos incompletos' });

    for (const c of components) {
      if (typeof c.accessory_id !== 'number')
        return res.status(400).json({ message: 'accessory_id requerido' });
      if (c.quantity !== undefined && c.quantity !== null && typeof c.quantity !== 'number')
        return res.status(400).json({ message: 'quantity invalido' });
    }

    await Promise.all([
      ensureColumn('accessory_components', 'cost', 'DECIMAL(10,2)'),
      ensureColumn('accessory_components', 'price', 'DECIMAL(10,2)')
    ]);

    const mapped = components.map(c => ({
      accessory_id: c.accessory_id,
      quantity: c.quantity,
      name: c.name,
      cost: c.cost,
      price: c.price
    }));

    await AccessoryComponents.deleteByParent(parentId);
    await AccessoryComponents.createComponentLinksBatch(parentId, mapped, 1);

    const ownerId = parseInt(req.query.owner_id || '1', 10);
    const pricing = await buildAccessoryPricing(parentId, ownerId);
    res.json(pricing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete link
router.delete('/accessory-components/:id', async (req, res) => {
  try {
    const result = await AccessoryComponents.deleteLink(req.params.id);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Vinculo no encontrado' });
    res.json({ message: 'Vinculo eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
