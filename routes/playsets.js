const express = require('express');
const Playsets = require('../models/playsetsModel');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const router = express.Router();

/**
 * @openapi
 * /playsets:
 *   get:
 *     summary: Listar playsets con costo calculado 
 *     tags:
 *       - Playsets
 *     responses:
 *       200:
 *         description: Lista de playsets
 *   post:
 *     summary: Crear playset
 *     tags:
 *       - Playsets
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
 *       201:
 *         description: Playset creado
 *
 * /playsets/{id}:
 *   get:
 *     summary: Obtener playset por ID
 *     tags:
 *       - Playsets
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playset encontrado
 *       404:
 *         description: Playset no encontrado
 *   put:
 *     summary: Actualizar playset
 *     tags:
 *       - Playsets
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
 *         description: Playset actualizado
 *       404:
 *         description: Playset no encontrado
 *   delete:
 *     summary: Eliminar playset
 *     tags:
 *       - Playsets
 *     responses:
 *       200:
 *         description: Playset eliminado
 *       404:
 *         description: Playset no encontrado
 *
 * /playsets/{id}/cost:
 *   get:
 *     summary: Calcular costo total de un playset
 *     tags:
 *       - Playsets
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Costo del playset
 *       404:
 *         description: Playset no encontrado
 */
router.get('/', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const playsets = await Playsets.getAllPlaysets(ownerCompanyId);
    // Nota: La lógica de cálculo de costos puede necesitar ser revisada
    // para asegurar el aislamiento de datos si los accesorios/materiales
    // también son específicos de la compañía.
    const detailed = await Promise.all(
      playsets.map(async (p) => {
        const costInfo = await PlaysetAccessories.calculatePlaysetCost(p.id, ownerCompanyId);
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          accessories: costInfo ? costInfo.accessories : [],
          total_cost: costInfo ? costInfo.total_cost : 0
        };
      })
    );
    res.json(detailed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const playset = await Playsets.getPlaysetById(req.params.id, ownerCompanyId);
    if (!playset) return res.status(404).json({ message: 'Playset no encontrado o no pertenece a esta compañía' });
    res.json(playset);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const playset = await Playsets.createPlayset(req.body, ownerCompanyId);
    res.status(201).json(playset);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const result = await Playsets.updatePlayset(req.params.id, req.body, ownerCompanyId);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Playset no encontrado o no pertenece a esta compañía' });
    }
    res.json({ message: 'Playset actualizado' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const result = await Playsets.deletePlayset(req.params.id, ownerCompanyId);
     if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Playset no encontrado o no pertenece a esta compañía' });
    }
    res.json({ message: 'Playset eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/cost', async (req, res) => {
    try {
      const ownerCompanyId = req.user.owner_company_id;
      // Primero, verificar que el playset pertenece a la compañía
      const playset = await Playsets.getPlaysetById(req.params.id, ownerCompanyId);
      if (!playset) {
        return res.status(404).json({ message: 'Playset no encontrado o no pertenece a esta compañía' });
      }
      
      // Ahora calcular el costo
      const result = await PlaysetAccessories.calculatePlaysetCost(req.params.id, ownerCompanyId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

module.exports = router;
