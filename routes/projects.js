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
    const client = await Clients.findById(project.client_id);

    const costInfo = await PlaysetAccessories.calculatePlaysetCost(project.playset_id);
    if (!costInfo) {
      return res.json({
        ...project,
        client,
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
      client,
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
    const client = await Clients.findById(project.client_id);

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

    doc.fontSize(16).text('Nota de Remision', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`ID: ${project.id}`);
    if (project.contact_email) {
      doc.text(`Correo de contacto: ${project.contact_email}`);
    }
    if (client) {
      doc.text(`Cliente: ${client.contact_name} - ${client.company_name}`);
      doc.text(`Direccion: ${client.address}`);
    } else {
      doc.text(`Client ID: ${project.client_id}`);
    }
    if (costInfo) {
      doc.text(`Playset: ${costInfo.playset_name}`);
      doc.text(`Descripcion Playset: ${costInfo.playset_description}`);
    }
    doc.text(`Precio de Venta Total: ${project.sale_price}`);
    doc.text(`Margen de Ganancia: ${profit_margin}`);
    doc.moveDown();

    // Table header
    const startX = 50;
    let y = doc.y;
    doc.text('Accesorio', startX, y);
    doc.text('Cant', startX + 100, y);
    doc.text('Costo U.', startX + 140, y);
    doc.text('Precio U.', startX + 220, y);
    doc.text('Subt. Costo', startX + 300, y);
    doc.text('Subt. Venta', startX + 400, y);
    y += 20;

    accessories.forEach(acc => {
      const unitCost = acc.quantity ? (acc.investment_cost / acc.quantity) : 0;
      const unitPrice = acc.quantity ? (acc.cost_with_margin / acc.quantity) : 0;
      doc.text(acc.accessory_name, startX, y);
      doc.text(acc.quantity, startX + 100, y);
      doc.text(unitCost.toFixed(2), startX + 140, y);
      doc.text(unitPrice.toFixed(2), startX + 220, y);
      doc.text(acc.investment_cost.toFixed(2), startX + 300, y);
      doc.text(acc.cost_with_margin.toFixed(2), startX + 400, y);
      y += 20;
    });

    doc.moveDown();
    doc.text(`Costo de inversion total: ${total_investment_cost.toFixed(2)}`);
    doc.text(`Costo de venta total: ${total_cost_with_margin.toFixed(2)}`);
    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { playset_id, profit_margin = 0, contact_email, client } = req.body;
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
    const project = await Projects.createProject(
      clientRecord.id,
      playset_id,
      salePrice,
      contact_email
    );
    res.status(201).json({ ...project, cost: costInfo.total_cost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
