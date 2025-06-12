const express = require('express');
const InstallationCosts = require('../models/installationCostsModel');
const Remissions = require('../models/remissionsModel');
const { generateRemission } = require('../Modules/remissionGenerator');
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
router.post('/installation-costs', async (req, res) => {
  try {
    const {
      project_id,
      workers,
      days,
      meal_per_person,
      hotel_per_day,
      labor_cost,
      personal_transport,
      local_transport,
      extra_expenses
    } = req.body;
    const existing = await InstallationCosts.findByProjectId(project_id);
    if (existing) {
      return res.status(400).json({ message: 'El proyecto ya tiene costos registrados' });
    }
    const record = await InstallationCosts.createInstallationCosts(
      project_id,
      workers,
      days,
      meal_per_person,
      hotel_per_day,
      labor_cost,
      personal_transport,
      local_transport,
      extra_expenses,
      1
    );

    const remissions = await Remissions.findByProjectId(project_id);
    if (remissions.length) {
      try {
        await generateRemission(project_id);
      } catch (err) {
        console.error('Error generating remission:', err);
      }
    }

    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/installation-costs', async (req, res) => {
  try {
    const { project_id } = req.query;
    if (!project_id) {
      return res.status(400).json({ message: 'project_id requerido' });
    }
    const record = await InstallationCosts.findByProjectId(project_id);
    if (!record) return res.status(404).json({ message: 'No encontrado' });
    res.json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /installation-costs/{project_id}:
 *   put:
 *     summary: Actualizar costos de instalación
 *     tags:
 *       - InstallationCosts
 *     parameters:
 *       - in: path
 *         name: project_id
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 */
router.put('/installation-costs/:project_id', async (req, res) => {
  try {
    const { project_id } = req.params;
    const existing = await InstallationCosts.findByProjectId(project_id);
    if (!existing) {
      return res.status(404).json({ message: 'No encontrado' });
    }
    const {
      workers,
      days,
      meal_per_person,
      hotel_per_day,
      labor_cost,
      personal_transport,
      local_transport,
      extra_expenses
    } = req.body;
    await InstallationCosts.updateInstallationCosts(
      project_id,
      workers,
      days,
      meal_per_person,
      hotel_per_day,
      labor_cost,
      personal_transport,
      local_transport,
      extra_expenses
    );

    const remissions = await Remissions.findByProjectId(project_id);
    if (remissions.length) {
      try {
        await generateRemission(project_id);
      } catch (err) {
        console.error('Error generating remission:', err);
      }
    }

    res.json({ message: 'Actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
