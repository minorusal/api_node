const express = require('express');
const Clients = require('../models/clientsModel');
const Projects = require('../models/projectsModel');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const PDFDocument = require('pdfkit');
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
 *               profit_margin:
 *                 type: number
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
router.get('/projects', async (req, res) => {
  try {
    const projects = await Projects.findAll();
    const detailed = await Promise.all(
      projects.map(async (p) => {
        const costInfo = await PlaysetAccessories.calculatePlaysetCost(p.playset_id);
        if (!costInfo) {
          return {
            ...p,
            playset_name: undefined,
            playset_description: undefined,
            accessories: [],
            total_investment_cost: 0,
            total_cost_with_margin: 0
          };
        }

        const profit_margin = p.sale_price && costInfo.total_cost > 0
          ? +(p.sale_price / costInfo.total_cost - 1).toFixed(2)
          : 0;
        const marginFactor = 1 + profit_margin;
        const accessories = costInfo.accessories.map((a) => {
          const costWithMargin = +(a.cost * marginFactor).toFixed(2);
          return {
            accessory_id: a.accessory_id,
            accessory_name: a.accessory_name,
            quantity: a.quantity,
            materials: a.materials,
            investment_cost: a.cost,
            cost_with_margin: costWithMargin
          };
        });
        const total_investment_cost = accessories.reduce((sum, acc) => sum + acc.investment_cost, 0);
        const total_cost_with_margin = accessories.reduce((sum, acc) => sum + acc.cost_with_margin, 0);
        return {
          ...p,
          playset_name: costInfo.playset_name,
          playset_description: costInfo.playset_description,
          accessories,
          profit_margin,
          total_investment_cost,
          total_cost_with_margin
        };
      })
    );
    res.json(detailed);
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
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

    const costInfo = await PlaysetAccessories.calculatePlaysetCost(project.playset_id);
    if (!costInfo) {
      return res.json({
        ...project,
        playset_name: undefined,
        playset_description: undefined,
        accessories: [],
        profit_margin: 0,
        total_investment_cost: 0,
        total_cost_with_margin: 0
      });
    }

    const profit_margin = project.sale_price && costInfo.total_cost > 0
      ? +(project.sale_price / costInfo.total_cost - 1).toFixed(2)
      : 0;
    const marginFactor = 1 + profit_margin;
    const accessories = costInfo.accessories.map((a) => {
      const costWithMargin = +(a.cost * marginFactor).toFixed(2);
      return {
        accessory_id: a.accessory_id,
        accessory_name: a.accessory_name,
        quantity: a.quantity,
        materials: a.materials,
        investment_cost: a.cost,
        cost_with_margin: costWithMargin
      };
    });
    const total_investment_cost = accessories.reduce((sum, acc) => sum + acc.investment_cost, 0);
    const total_cost_with_margin = accessories.reduce((sum, acc) => sum + acc.cost_with_margin, 0);
    res.json({
      ...project,
      playset_name: costInfo.playset_name,
      playset_description: costInfo.playset_description,
      accessories,
      profit_margin,
      total_investment_cost,
      total_cost_with_margin
    });
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
router.get('/projects/:id/pdf', async (req, res) => {
  try {
    const project = await Projects.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });

    const costInfo = await PlaysetAccessories.calculatePlaysetCost(project.playset_id);
    const profit_margin = project.sale_price && costInfo && costInfo.total_cost > 0
      ? +(project.sale_price / costInfo.total_cost - 1).toFixed(2)
      : 0;
    const marginFactor = 1 + profit_margin;
    const accessories = (costInfo ? costInfo.accessories : []).map((a) => {
      const costWithMargin = +(a.cost * marginFactor).toFixed(2);
      return {
        accessory_id: a.accessory_id,
        accessory_name: a.accessory_name,
        quantity: a.quantity,
        materials: a.materials,
        investment_cost: a.cost,
        cost_with_margin: costWithMargin
      };
    });
    const total_investment_cost = accessories.reduce((sum, acc) => sum + acc.investment_cost, 0);
    const total_cost_with_margin = accessories.reduce((sum, acc) => sum + acc.cost_with_margin, 0);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=project_${project.id}.pdf`);
    doc.pipe(res);
    doc.fontSize(16).text('Project Details', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`ID: ${project.id}`);
    doc.text(`Client ID: ${project.client_id}`);
    if (costInfo) {
      doc.text(`Playset: ${costInfo.playset_name}`);
      doc.text(`Playset Description: ${costInfo.playset_description}`);
    }
    doc.text(`Sale Price: ${project.sale_price}`);
    doc.text(`Profit Margin: ${profit_margin}`);
    doc.text(`Total Investment Cost: ${total_investment_cost}`);
    doc.text(`Total Cost with Margin: ${total_cost_with_margin}`);
    doc.moveDown();
    doc.text('Accessories:');
    accessories.forEach(acc => {
      doc.text(`- ${acc.accessory_name} x${acc.quantity} cost ${acc.cost_with_margin}`);
    });
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { playset_id, profit_margin = 0, client } = req.body;
    if (!client) return res.status(400).json({ message: 'Cliente requerido' });

    let clientRecord;
    if (client.id) {
      clientRecord = await Clients.findById(client.id);
      if (!clientRecord) return res.status(404).json({ message: 'Cliente no encontrado' });
    } else {
      const { contact_name, company_name, address, requires_invoice, billing_info } = client;
      clientRecord = await Clients.createClient(contact_name, company_name, address, requires_invoice, billing_info);
    }

    const costInfo = await PlaysetAccessories.calculatePlaysetCost(playset_id);
    if (!costInfo) return res.status(404).json({ message: 'Playset no encontrado' });
    const salePrice = +(costInfo.total_cost * (1 + profit_margin)).toFixed(2);
    const project = await Projects.createProject(clientRecord.id, playset_id, salePrice);
    res.status(201).json({ ...project, cost: costInfo.total_cost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
