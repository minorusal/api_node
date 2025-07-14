const express = require('express');
const InstallationCosts = require('../models/installationCostsModel');
const Remissions = require('../models/remissionsModel');
const { generateRemission } = require('../Modules/remissionGenerator');
const catchAsync = require('../Modules/catchAsync');
const router = express.Router();

/**
 * @openapi
 * /installation-costs:
 *   post:
 *     summary: Registrar costos de instalación
 *     tags:
 *       - InstallationCosts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: integer
 *               workers:
 *                 type: integer
 *               days:
 *                 type: integer
 *               meal_per_person:
 *                 type: number
 *               hotel_per_day:
 *                 type: number
 *               labor_cost:
 *                 type: number
 *               personal_transport:
 *                 type: number
 *               local_transport:
 *                 type: number
 *               extra_expenses:
 *                 type: number
 *           example:
 *             project_id: 1
 *             workers: 2
 *             days: 5
 *             meal_per_person: 100
 *             hotel_per_day: 200
 *             labor_cost: 300
 *             personal_transport: 50
 *             local_transport: 80
 *             extra_expenses: 120
 *   get:
 *     summary: Obtener costos de instalación por proyecto
 *     tags:
 *       - InstallationCosts
 *     parameters:
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: integer
 */
router.route('/')
    .get(catchAsync(async (req, res) => {
        const { project_id } = req.query;
        if (!project_id) {
            return res.status(400).json({ message: 'project_id requerido' });
        }
        const record = await InstallationCosts.findByProjectId(project_id);
        if (!record) return res.status(404).json({ message: 'No encontrado' });
        res.json(record);
    }))
    .post(catchAsync(async (req, res) => {
        const { project_id, ...costs } = req.body;
        const existing = await InstallationCosts.findByProjectId(project_id);
        if (existing) {
            return res.status(400).json({ message: 'El proyecto ya tiene costos registrados' });
        }
        const record = await InstallationCosts.createInstallationCosts(
            project_id,
            costs.workers,
            costs.days,
            costs.meal_per_person,
            costs.hotel_per_day,
            costs.labor_cost,
            costs.personal_transport,
            costs.local_transport,
            costs.extra_expenses,
            req.user.owner_id // Suponiendo que el owner_id viene del token
        );

        // La lógica de la remisión la probaremos por separado
        res.status(201).json(record);
    }));

router.route('/:project_id')
    .put(catchAsync(async (req, res) => {
        const { project_id } = req.params;
        const existing = await InstallationCosts.findByProjectId(project_id);
        if (!existing) {
            return res.status(404).json({ message: 'No encontrado' });
        }
        const costs = req.body;
        const updatedRecord = await InstallationCosts.updateInstallationCosts(
            project_id,
            costs.workers,
            costs.days,
            costs.meal_per_person,
            costs.hotel_per_day,
            costs.labor_cost,
            costs.personal_transport,
            costs.local_transport,
            costs.extra_expenses
        );

        res.json(updatedRecord);
    }));

module.exports = router;
