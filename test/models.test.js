const { expect } = require('chai');
const materials = require('../models/materialsModel');
const accessories = require('../models/accessoriesModel');
const playsets = require('../models/playsetsModel');
const playsetAccessories = require('../models/playsetAccessoriesModel');
const clients = require('../models/clientsModel');
const projects = require('../models/projectsModel');
const installationCosts = require('../models/installationCostsModel');
const ownerCompanies = require('../models/ownerCompaniesModel');

describe('Model exports', () => {
  it('materials model exposes CRUD functions', () => {
    expect(materials.createMaterial).to.be.a('function');
    expect(materials.findById).to.be.a('function');
    expect(materials.findAll).to.be.a('function');
  });

  it('accessories model exposes CRUD functions', () => {
    expect(accessories.createAccessory).to.be.a('function');
    expect(accessories.findById).to.be.a('function');
    expect(accessories.findAll).to.be.a('function');
  });

  it('playsets model exposes CRUD functions', () => {
    expect(playsets.createPlayset).to.be.a('function');
    expect(playsets.findById).to.be.a('function');
    expect(playsets.findAll).to.be.a('function');
  });

  it('playsetAccessories model exposes cost function', () => {
    expect(playsetAccessories.calculatePlaysetCost).to.be.a('function');
  });

  it('clients model exposes CRUD functions', () => {
    expect(clients.createClient).to.be.a('function');
    expect(clients.findById).to.be.a('function');
    expect(clients.findAll).to.be.a('function');
  });

  it('projects model exposes CRUD functions', () => {
    expect(projects.createProject).to.be.a('function');
    expect(projects.findById).to.be.a('function');
    expect(projects.findAll).to.be.a('function');
  });

  it('installationCosts model exposes basic functions', () => {
    expect(installationCosts.createInstallationCosts).to.be.a('function');
    expect(installationCosts.findByProjectId).to.be.a('function');
  });

  it('ownerCompanies model exposes update logo function', () => {
    expect(ownerCompanies.updateLogoPath).to.be.a('function');
  });
});

describe('Model logic', () => {
  const db = require('../db');
  const accessoryMaterials = require('../models/accessoryMaterialsModel');
  let originalQuery;

  beforeEach(() => {
    originalQuery = db.query;
  });

  afterEach(() => {
    db.query = originalQuery;
  });

  it('createMaterial returns created material with all fields', async () => {
    db.query = (sql, params, callback) => {
      callback(null, { insertId: 1 });
    };

    const result = await materials.createMaterial(
      'Wood',
      'Pine wood',
      5,
      2,
      3,
      20,
      1
    );

    expect(result).to.deep.equal({
      id: 1,
      name: 'Wood',
      description: 'Pine wood',
      thickness_mm: 5,
      width_m: 2,
      length_m: 3,
      price: 20,
      owner_id: 1
    });
  });

  it('calculateCost computes correct cost based on material dimensions', async () => {
    db.query = (sql, params, callback) => {
      callback(null, [{ width_m: 2, length_m: 3, price: 12 }]);
    };

    const cost = await accessoryMaterials.calculateCost(1, 1, 1.5, 2);

    // fullArea = 2 * 3 = 6
    // pieceArea = 1 * 1.5 = 1.5
    // unitCost = (12 / 6) * 1.5 = 3
    // total cost = 3 * 2 = 6
    expect(cost).to.be.closeTo(6, 0.0001);
  });

  it('calculatePlaysetCost sums accessory material costs', async () => {
    const playsetAccessoriesModel = require('../models/playsetAccessoriesModel');
    const originalCalc = accessoryMaterials.calculateCost;
    accessoryMaterials.calculateCost = async () => 4;

    db.query = (sql, params, callback) => {
      if (sql.includes('FROM playsets')) return callback(null, [{ id: 1, name: 'Set' }]);
      if (sql.includes('playset_accessories')) return callback(null, [{ accessory_id: 2, quantity: 1, name: 'Acc' }]);
      if (sql.includes('accessory_materials')) return callback(null, [{ material_id: 3, quantity: 1, width_m: 1, length_m: 1 }]);
      callback(null, []);
    };

    const result = await playsetAccessoriesModel.calculatePlaysetCost(1);

    expect(result.total_cost).to.equal(4);
    expect(result.accessories).to.have.lengthOf(1);

    accessoryMaterials.calculateCost = originalCalc;
  });
});

