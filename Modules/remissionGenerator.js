const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');
const Mustache = require('mustache');
const numeroALetras = require('./numeroALetras');

const Projects = require('../models/projectsModel');
const Clients = require('../models/clientsModel');
const OwnerCompanies = require('../models/ownerCompaniesModel');
const PlaysetAccessories = require('../models/playsetAccessoriesModel');
const InstallationCosts = require('../models/installationCostsModel');
const Remissions = require('../models/remissionsModel');
const { getStyle } = require('./styleConfig');

async function generateRemission(projectId) {
  const project = await Projects.findById(projectId);
  if (!project) throw new Error('Proyecto no encontrado');
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

  const install = await InstallationCosts.findByProjectId(project.id);
  const installItems = [];
  if (install) {
    const meals = (install.meal_per_person || 0) * (install.workers || 0) * (install.days || 0);
    const hotel = (install.hotel_per_day || 0) * (install.days || 0);
    installItems.push(
      { accessory_name: 'Comidas', quantity: 1, materials: [], investment_cost: meals, cost_with_margin: +(meals * marginFactor).toFixed(2) },
      { accessory_name: 'Hotel', quantity: 1, materials: [], investment_cost: hotel, cost_with_margin: +(hotel * marginFactor).toFixed(2) },
      { accessory_name: 'Mano de obra', quantity: 1, materials: [], investment_cost: install.labor_cost || 0, cost_with_margin: +((install.labor_cost || 0) * marginFactor).toFixed(2) },
      { accessory_name: 'Transporte personal', quantity: 1, materials: [], investment_cost: install.personal_transport || 0, cost_with_margin: +((install.personal_transport || 0) * marginFactor).toFixed(2) },
      { accessory_name: 'Transporte local', quantity: 1, materials: [], investment_cost: install.local_transport || 0, cost_with_margin: +((install.local_transport || 0) * marginFactor).toFixed(2) },
      { accessory_name: 'Gastos extras', quantity: 1, materials: [], investment_cost: install.extra_expenses || 0, cost_with_margin: +((install.extra_expenses || 0) * marginFactor).toFixed(2) }
    );
  }

  const allItems = accessories.concat(installItems);
  const total_investment_cost = allItems.reduce((sum, acc) => sum + acc.investment_cost, 0);
  const total_cost_with_margin = allItems.reduce((sum, acc) => sum + acc.cost_with_margin, 0);

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
    accessories: allItems,
    profit_margin,
    total_investment_cost,
    total_cost_with_margin
  });

  await Remissions.createRemission(project.id, snapshot, ownerFilePath, 'owner', 1);
  await Remissions.createRemission(project.id, snapshot, clientFilePath, 'client', 1);

  const issueDate = new Date();
  const formattedDate = issueDate.toISOString().slice(0, 10);
  const subtotal = total_cost_with_margin;
  const iva = +(subtotal * 0.16).toFixed(2);
  const total = +(subtotal + iva).toFixed(2);

  const conceptos = allItems.map(acc => ({
    cantidad: acc.quantity,
    descripcion: acc.accessory_name,
    costoInversion: acc.investment_cost.toFixed(2),
    costoVenta: acc.cost_with_margin.toFixed(2),
    porcentaje: owner ? owner.profit_percentage.toFixed(2) + '%' : '0%'
  }));

  const conceptosCliente = [
    {
      cantidad: 1,
      descripcion: costInfo ? costInfo.playset_name : '',
      costoVenta: total_cost_with_margin.toFixed(2)
    }
  ];

  const ownerTemplatePath = path.join(__dirname, '..', 'templates', 'remission.html');
  const ownerTemplate = fs.readFileSync(ownerTemplatePath, 'utf8');
  const clientTemplatePath = path.join(__dirname, '..', 'templates', 'remission_client.html');
  const clientTemplate = fs.readFileSync(clientTemplatePath, 'utf8');
  const { headerBackgroundColor, headerTextColor } = getStyle();

  const ownerHtml = Mustache.render(ownerTemplate, {
    folio: project.id,
    fechaEmision: formattedDate,
    lugarExpedicion: owner ? owner.address : 'N/A',
    logoSrc: owner && owner.logo_path ? owner.logo_path : '',
    emisor: { razonSocial: owner ? owner.name : '' },
    receptor: {
      nombreCliente: client ? client.company_name : 'Cliente no registrado',
      nombreContacto: client ? client.contact_name : '',
      domicilio: client ? client.address : ''
    },
    conceptos,
    totales: { subtotal: subtotal.toFixed(2), tasaIva: '16%', iva: iva.toFixed(2), total: total.toFixed(2), totalLetra: numeroALetras(total) },
    uuid: '',
    folioFiscal: '',
    selloSat: '',
    selloEmisor: '',
    cadenaOriginal: '',
    headerBackgroundColor,
    headerTextColor
  });

  const clientHtml = Mustache.render(clientTemplate, {
    folio: project.id,
    fechaEmision: formattedDate,
    lugarExpedicion: owner ? owner.address : 'N/A',
    logoSrc: owner && owner.logo_path ? owner.logo_path : '',
    emisor: { razonSocial: owner ? owner.name : '' },
    receptor: {
      nombreCliente: client ? client.company_name : 'Cliente no registrado',
      nombreContacto: client ? client.contact_name : '',
      domicilio: client ? client.address : ''
    },
    conceptos: conceptosCliente,
    totales: { subtotal: subtotal.toFixed(2), tasaIva: '16%', iva: iva.toFixed(2), total: total.toFixed(2), totalLetra: numeroALetras(total) },
    uuid: '',
    folioFiscal: '',
    selloSat: '',
    selloEmisor: '',
    cadenaOriginal: '',
    headerBackgroundColor,
    headerTextColor
  });

  await new Promise((resolve, reject) => {
    pdf.create(ownerHtml).toFile(ownerFilePath, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  await new Promise((resolve, reject) => {
    pdf.create(clientHtml).toFile(clientFilePath, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  return { ownerFilePath, clientFilePath };
}

module.exports = { generateRemission };
