const express = require('express');
const Clients = require('../models/clientsModel');
const Projects = require('../models/projectsModel');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const Mustache = require('mustache');
const pdf = require('html-pdf');
const Remissions = require('../models/remissionsModel');
const fs = require('fs');
const path = require('path');
const OwnerCompanies = require('../models/ownerCompaniesModel');
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

        const owner = await OwnerCompanies.findById(p.owner_id);
        const profit_margin = owner ? +(owner.profit_percentage / 100) : 0;
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
          profit_percentage: owner ? +owner.profit_percentage : 0,
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
    const owner = await OwnerCompanies.findById(project.owner_id);

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

    const profit_margin = owner ? +(owner.profit_percentage / 100) : 0;
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
      profit_percentage: owner ? +owner.profit_percentage : 0,
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
    const owner = await OwnerCompanies.findById(project.owner_id);

    const costInfo = await PlaysetAccessories.calculatePlaysetCost(project.playset_id);
    const profit_margin = owner ? +(owner.profit_percentage / 100) : 0;
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

    const remissionDir = path.join(__dirname, '..', 'remissions');
    if (!fs.existsSync(remissionDir)) {
      fs.mkdirSync(remissionDir);
    }
    const timestamp = Date.now();
    const ownerFileName = `project_${project.id}_${timestamp}_owner.pdf`;
    const ownerFilePath = path.join(remissionDir, ownerFileName);
    const clientFileName = `project_${project.id}_${timestamp}_client.pdf`;
    const clientFilePath = path.join(remissionDir, clientFileName);

    const snapshot = JSON.stringify({
      project,
      client,
      accessories,
      profit_margin,
      total_investment_cost,
      total_cost_with_margin
    });
    try {
      await Remissions.createRemission(project.id, snapshot, ownerFilePath, 'owner', 1);
      await Remissions.createRemission(project.id, snapshot, clientFilePath, 'client', 1);
    } catch (err) {
      console.error('Error saving remission:', err);
    }

    const issueDate = new Date();
    const formattedDate = issueDate.toISOString().slice(0, 10);

    const subtotal = total_cost_with_margin;
    const iva = +(subtotal * 0.16).toFixed(2);
    const total = +(subtotal + iva).toFixed(2);

    const conceptos = accessories.map(acc => ({
      cantidad: acc.quantity,
      descripcion: acc.accessory_name,
      costoInversion: acc.investment_cost.toFixed(2),
      costoVenta: acc.cost_with_margin.toFixed(2),
      porcentaje: owner ? owner.profit_percentage.toFixed(2) + '%' : '0%'
    }));


    const ownerTemplatePath = path.join(__dirname, '..', 'templates', 'remission.html');
    const ownerTemplate = fs.readFileSync(ownerTemplatePath, 'utf8');
    const clientTemplatePath = path.join(__dirname, '..', 'templates', 'remission_client.html');
    const clientTemplate = fs.readFileSync(clientTemplatePath, 'utf8');

    const ownerHtml = Mustache.render(ownerTemplate, {
      folio: project.id,
      fechaEmision: formattedDate,
      lugarExpedicion: owner ? owner.address : 'N/A',
      logoSrc: '',
      emisor: { razonSocial: owner ? owner.name : '' },
      receptor: {
        nombreCliente: client ? client.company_name : 'Cliente no registrado',
        nombreContacto: client ? client.contact_name : '',
        domicilio: client ? client.address : ''
      },
      conceptos,
      totales: { subtotal: subtotal.toFixed(2), tasaIva: '16%', iva: iva.toFixed(2), total: total.toFixed(2), totalLetra: '' },
      uuid: '',
      folioFiscal: '',
      selloSat: '',
      selloEmisor: '',
      cadenaOriginal: ''
    });

    const clientHtml = Mustache.render(clientTemplate, {
      folio: project.id,
      fechaEmision: formattedDate,
      lugarExpedicion: owner ? owner.address : 'N/A',
      logoSrc: '',
      emisor: { razonSocial: owner ? owner.name : '' },
      receptor: {
        nombreCliente: client ? client.company_name : 'Cliente no registrado',
        nombreContacto: client ? client.contact_name : '',
        domicilio: client ? client.address : ''
      },
      conceptos,
      totales: { subtotal: subtotal.toFixed(2), tasaIva: '16%', iva: iva.toFixed(2), total: total.toFixed(2), totalLetra: '' },
      uuid: '',
      folioFiscal: '',
      selloSat: '',
      selloEmisor: '',
      cadenaOriginal: ''
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${ownerFileName}`);

    pdf.create(ownerHtml).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error creando PDF' });
      }
      const fileStreamOwner = fs.createWriteStream(ownerFilePath);
      stream.pipe(fileStreamOwner);
      stream.pipe(res);
    });

    pdf.create(clientHtml).toStream((err, stream) => {
      if (err) {
        console.error(err);
        return;
      }
      const fileStreamClient = fs.createWriteStream(clientFilePath);
      stream.pipe(fileStreamClient);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const { playset_id, contact_email, client } = req.body;
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
    const owner = await OwnerCompanies.findById(1);
    const margin = owner ? +(owner.profit_percentage / 100) : 0;
    const salePrice = +(costInfo.total_cost * (1 + margin)).toFixed(2);
    const project = await Projects.createProject(
      clientRecord.id,
      playset_id,
      salePrice,
      contact_email,
      1
    );
    res.status(201).json({ ...project, cost: costInfo.total_cost });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
