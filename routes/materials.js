const express = require('express');
const Materials = require('../models/materialsModel');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const { buildAccessoryPricing } = require('./accessoryMaterials');
const router = express.Router();

/**
 * @openapi
 * /materials:
 *   get:
 *     summary: Listar materiales
 *     tags:
 *       - Materials
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: Número de página (por defecto 1)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Cantidad de elementos por página (por defecto 10)
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Texto a buscar en cualquier campo
 *         example: madera
 *     responses:
 *       200:
 *         description: Lista de materiales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 docs:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalDocs:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *   post:
 *     summary: Crear material
 *     tags:
 *       - Materials
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
 *               thickness_mm:
 *                 type: number
 *               width_m:
 *                 type: number
 *               length_m:
 *                 type: number
 *               price:
 *                 type: number
 *               material_type_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Material creado
 *
 * /materials/{id}:
 *   get:
 *     summary: Obtener material por ID
 *     tags:
 *       - Materials
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Material encontrado
 *       404:
 *         description: Material no encontrado
 *   put:
 *     summary: Actualizar material
 *     tags:
 *       - Materials
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
 *               thickness_mm:
 *                 type: number
 *               width_m:
 *                 type: number
 *               length_m:
 *                 type: number
 *               price:
 *                 type: number
 *               material_type_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Material actualizado
 *       404:
 *         description: Material no encontrado
 *   delete:
 *     summary: Eliminar material
 *     tags:
 *       - Materials
 *     responses:
 *       200:
 *         description: Material eliminado
 *       404:
 *         description: Material no encontrado
 */
router.get('/materials', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const search = req.query.search || '';
    const [materials, totalDocs] = await Promise.all([
      Materials.findPaginated(page, limit, search),
      Materials.countAll(search)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    res.json({
      docs: materials,
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
      price,
      material_type_id
    } = req.body;
    const material = await Materials.createMaterial(
      name,
      description,
      thickness_mm,
      width_m,
      length_m,
      price,
      material_type_id,
      1
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
      price,
      material_type_id
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
      price,
      material_type_id
    );
    await AccessoryMaterials.updateCostsByMaterial(req.params.id);
    const accessoryIds = await AccessoryMaterials.findAccessoryIdsByMaterial(
      req.params.id
    );
    for (const accId of accessoryIds) {
      await buildAccessoryPricing(accId, material.owner_id || 1);
    }
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
