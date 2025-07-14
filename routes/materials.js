const express = require('express');
const Materials = require('../models/materialsModel');
const catchAsync = require('../Modules/catchAsync');
const router = express.Router();

/**
 * @openapi
 * /materials:
 *   get:
 *     summary: Listar materiales paginados
 *     tags: [Materials]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: 'Lista de materiales' }
 */
router.get('/', catchAsync(async (req, res) => {
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
}));

/**
 * @openapi
 * /materials/{id}:
 *   get:
 *     summary: Obtener un material por ID
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 'Detalles del material' }
 *       404: { description: 'Material no encontrado' }
 */
router.get('/:id', catchAsync(async (req, res) => {
    const material = await Materials.getMaterialById(req.params.id);
    if (!material) {
        return res.status(404).json({ message: 'Material no encontrado' });
    }
    res.json(material);
}));

/**
 * @openapi
 * /materials:
 *   post:
 *     summary: Crear un nuevo material
 *     tags: [Materials]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               material_type_id: { type: integer }
 *               owner_id: { type: integer, default: 1 }
 *               purchase_price: { type: number }
 *               attributes: { type: object }
 *             required: [name, material_type_id, purchase_price, attributes]
 *     responses:
 *       201: { description: 'Material creado' }
 */
router.post('/', catchAsync(async (req, res) => {
    const materialData = {
        name: req.body.name,
        description: req.body.description,
        material_type_id: req.body.material_type_id,
        owner_id: req.body.owner_id || 1, // Default a 1 si no se provee
        purchase_price: req.body.purchase_price,
        attributes: req.body.attributes
    };
    const newMaterial = await Materials.createMaterial(materialData);
    res.status(201).json(newMaterial);
}));

/**
 * @openapi
 * /materials/{id}:
 *   put:
 *     summary: Actualizar un material existente
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               material_type_id: { type: integer }
 *               purchase_price: { type: number }
 *               attributes: { type: object }
 *             required: [name, material_type_id, purchase_price, attributes]
 *     responses:
 *       200: { description: 'Material actualizado' }
 *       404: { description: 'Material no encontrado' }
 */
router.put('/:id', catchAsync(async (req, res) => {
    const material = await Materials.getMaterialById(req.params.id);
    if (!material) {
        return res.status(404).json({ message: 'Material no encontrado' });
    }
    const updatedMaterial = await Materials.updateMaterial(req.params.id, req.body);
    res.json(updatedMaterial);
}));

/**
 * @openapi
 * /materials/{id}:
 *   delete:
 *     summary: Eliminar un material
 *     tags: [Materials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: 'Material eliminado' }
 *       404: { description: 'Material no encontrado' }
 */
router.delete('/:id', catchAsync(async (req, res) => {
    const material = await Materials.getMaterialById(req.params.id);
    if (!material) {
        return res.status(404).json({ message: 'Material no encontrado' });
    }
    await Materials.deleteMaterial(req.params.id);
    res.status(200).json({ message: 'Material eliminado correctamente' });
}));

module.exports = router;
