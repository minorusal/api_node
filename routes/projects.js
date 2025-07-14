const express = require('express');
const Clients = require('../models/clientsModel');
const Projects = require('../models/projectsModel');
const Playsets = require('../models/playsetsModel');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const InstallationCosts = require('../models/installationCostsModel');
const Mustache = require('mustache');
// const pdf = require('html-pdf'); // Comentado para evitar error de módulo no encontrado
const Remissions = require('../models/remissionsModel');
const fs = require('fs');
const path = require('path');
const OwnerCompanies = require('../models/ownerCompaniesModel');
const numeroALetras = require('../Modules/numeroALetras');
const { getStyle } = require('../Modules/styleConfig');
const router = express.Router();

/**
 * @openapi
 * /projects:
 *   get:
 *     summary: Listar proyectos
 *     tags:
 *       - Projects
 *     responses:
 *       200:
 *         description: Lista de proyectos
 *   post:
 *     summary: Crear proyecto
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playset_id:
 *                 type: integer
 *               contact_email:
 *                 type: string
 *               client:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   contact_name:
 *                     type: string
 *                   company_name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   requires_invoice:
 *                     type: boolean
 *                   billing_info:
 *                     type: string
 *     responses:
 *       201:
 *         description: Proyecto creado
 */
// GET all projects for the user's company
router.get('/', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const projects = await Projects.findAll(ownerCompanyId);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     summary: Obtener proyecto por ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proyecto encontrado
 *       404:
 *         description: Proyecto no encontrado
 */
// GET a single project by ID, ensuring it belongs to the user's company
router.get('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const project = await Projects.findById(req.params.id, ownerCompanyId);
    if (!project) {
        return res.status(404).json({ message: 'Proyecto no encontrado o no pertenece a esta compañía' });
    }
    
    // Aquí iría la lógica detallada para calcular costos, etc.,
    // asegurándose de que cada sub-consulta también respete el ownerCompanyId.
    // Por simplicidad en este refactor, devolvemos el proyecto.
    // La lógica de cálculo de costos debería moverse a un servicio/módulo separado.
    const client = await Clients.findById(project.client_id, ownerCompanyId);
    project.client = client;

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @openapi
 * /projects/{id}/pdf:
 *   get:
 *     summary: Descargar proyecto en PDF
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF con informacion del proyecto
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Proyecto no encontrado
 */
// La lógica de generación de remisiones (/projects/:id/remission) también necesita
// ser refactorizada para asegurar el aislamiento de datos.
// Se omite en este paso para centrarse en el CRUD.

/**
 * @openapi
 * /projects:
 *   post:
 *     summary: Crear proyecto
 *     tags:
 *       - Projects
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playset_id:
 *                 type: integer
 *               contact_email:
 *                 type: string
 *               client:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   contact_name:
 *                     type: string
 *                   company_name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   requires_invoice:
 *                     type: boolean
 *                   billing_info:
 *                     type: string
 *     responses:
 *       201:
 *         description: Proyecto creado
 */
// CREATE a new project
router.post('/', async (req, res) => {
    try {
        const ownerCompanyId = req.user.owner_company_id;
        const { client_id, playset_id, ...projectData } = req.body;

        // Verify that the client belongs to the same company
        const client = await Clients.findById(client_id, ownerCompanyId);
        if (!client) {
            return res.status(400).json({ message: "El cliente especificado no existe o no pertenece a su compañía." });
        }

        // Verify that the playset belongs to the same company
        const playset = await Playsets.getPlaysetById(playset_id, ownerCompanyId);
        if (!playset) {
            return res.status(400).json({ message: "El playset especificado no existe o no pertenece a su compañía." });
        }
        
        const newProject = await Projects.createProject({ client_id, playset_id, ...projectData }, ownerCompanyId);
        res.status(201).json(newProject);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @openapi
 * /projects/{id}:
 *   put:
 *     summary: Actualizar proyecto por ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_id:
 *                 type: integer
 *               playset_id:
 *                 type: integer
 *               sale_price:
 *                 type: number
 *               contact_email:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proyecto actualizado
 *       404:
 *         description: Proyecto no encontrado
 */
// UPDATE a project
router.put('/:id', async (req, res) => {
    try {
        const ownerCompanyId = req.user.owner_company_id;
        const projectId = req.params.id;
        const { client_id, playset_id, ...projectData } = req.body;

        // Verify that the client belongs to the same company (if provided)
        if(client_id) {
            const client = await Clients.findById(client_id, ownerCompanyId);
            if (!client) {
                return res.status(400).json({ message: "El cliente especificado no existe o no pertenece a su compañía." });
            }
        }

        // Verify that the playset belongs to the same company (if provided)
        if(playset_id) {
            const playset = await Playsets.getPlaysetById(playset_id, ownerCompanyId);
            if (!playset) {
                return res.status(400).json({ message: "El playset especificado no existe o no pertenece a su compañía." });
            }
        }

        const result = await Projects.updateProject(projectId, { client_id, playset_id, ...projectData }, ownerCompanyId);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Proyecto no encontrado o no pertenece a esta compañía' });
        }
        res.json({ message: 'Proyecto actualizado' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     summary: Eliminar proyecto por ID
 *     tags:
 *       - Projects
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Proyecto eliminado
 *       404:
 *         description: Proyecto no encontrado
 */
// DELETE a project
router.delete('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const result = await Projects.deleteProject(req.params.id, ownerCompanyId);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Proyecto no encontrado o no pertenece a esta compañía' });
    }
    res.json({ message: 'Proyecto eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
