const { expect } = require('chai');
const materials = require('../models/materialsModel');
const accessories = require('../models/accessoriesModel');
const playsets = require('../models/playsetsModel');
const playsetAccessories = require('../models/playsetAccessoriesModel');
const accessoryComponents = require('../models/accessoryComponentsModel');
const clients = require('../models/clientsModel');
const projects = require('../models/projectsModel');
const installationCosts = require('../models/installationCostsModel');
const ownerCompanies = require('../models/ownerCompaniesModel');
const menus = require('../models/menusModel');
const materialTypes = require('../models/materialTypesModel');
const accessoryPricing = require('../models/accessoryPricingModel');

describe('Model exports', () => {
  it('materials model exposes CRUD functions', () => {
    expect(materials.createMaterial).to.be.a('function');
    expect(materials.findById).to.be.a('function');
    expect(materials.findAll).to.be.a('function');
    expect(materials.findPaginated).to.be.a('function');
  });

  it('accessories model exposes CRUD functions', () => {
    expect(accessories.createAccessory).to.be.a('function');
    expect(accessories.findById).to.be.a('function');
    expect(accessories.findAll).to.be.a('function');
    expect(accessories.findByOwnerWithCostsPaginated).to.be.a('function');
    expect(accessories.countByOwner).to.be.a('function');
  });

  it('accessory components model exposes basic functions', () => {
    expect(accessoryComponents.createComponentLink).to.be.a('function');
    expect(accessoryComponents.createComponentLinksBatch).to.be.a('function');
    expect(accessoryComponents.findAll).to.be.a('function');
    expect(accessoryComponents.findByParentDetailed).to.be.a('function');
    expect(accessoryComponents.deleteByParent).to.be.a('function');
    expect(accessoryComponents.deleteLink).to.be.a('function');
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

  it('menus model exposes CRUD functions', () => {
    expect(menus.createMenu).to.be.a('function');
    expect(menus.getMenuTree).to.be.a('function');
  });

  it('materialTypes model exposes findAll function', () => {
    expect(materialTypes.findAll).to.be.a('function');
  });

  it('accessoryPricing model exposes upsert and find functions', () => {
    expect(accessoryPricing.upsertPricing).to.be.a('function');
    expect(accessoryPricing.findByAccessory).to.be.a('function');
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
      2,
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
      material_type_id: 2,
      owner_id: 1
    });
  });

  it('findPaginated builds search query when term provided', async () => {
    let capturedSql = '';
    let capturedParams = [];
    db.query = (sql, params, callback) => {
      capturedSql = sql;
      capturedParams = params;
      callback(null, []);
    };

    await materials.findPaginated(1, 5, 'wood');

    expect(capturedSql).to.contain('LIKE');
    expect(capturedParams[0]).to.equal('%wood%');
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

  it('calculatePlaysetCost sums accessory and component costs', async () => {
    const playsetAccessoriesModel = require('../models/playsetAccessoriesModel');
    const originalCalc = accessoryMaterials.calculateCost;
    accessoryMaterials.calculateCost = async () => 4;

    db.query = (sql, params, callback) => {
      if (sql.includes('FROM playsets')) return callback(null, [{ id: 1, name: 'Set' }]);
      if (sql.includes('playset_accessories')) return callback(null, [{ accessory_id: 2, quantity: 1, name: 'Acc' }]);
      if (sql.includes('accessory_components')) return callback(null, [{ child_accessory_id: 3, quantity: 2 }]);
      if (sql.includes('accessory_materials')) return callback(null, [{ material_id: 3, quantity: 1, width_m: 1, length_m: 1 }]);
      callback(null, []);
    };

    const result = await playsetAccessoriesModel.calculatePlaysetCost(1);

    expect(result.total_cost).to.equal(12);
    expect(result.accessories).to.have.lengthOf(1);

    accessoryMaterials.calculateCost = originalCalc;
  });

  it('findAccessoryIdsByMaterial returns ids list', async () => {
    db.query = (sql, params, callback) => {
      callback(null, [
        { accessory_id: 2 },
        { accessory_id: 3 }
      ]);
    };

    const ids = await accessoryMaterials.findAccessoryIdsByMaterial(1);
    expect(ids).to.deep.equal([2, 3]);
  });

  it('updateCostsByMaterial recalculates link totals', async () => {
    const calls = [];
    db.query = (sql, params, callback) => {
      if (sql.startsWith('SELECT id, width_m')) {
        return callback(null, [
          { id: 10, width_m: 1, length_m: 1, quantity: 2, porcentaje_ganancia: 50 }
        ]);
      }
      if (sql.includes('FROM raw_materials')) {
        return callback(null, [
          { width_m: 2, length_m: 3, price: 10 }
        ]);
      }
      if (sql.startsWith('UPDATE accessory_materials')) {
        calls.push(params);
        return callback(null, {});
      }
      callback(null, []);
    };

    await accessoryMaterials.updateCostsByMaterial(1);

    const expectedCost = (10 / (2 * 3)) * (1 * 1) * 2;
    const expectedPrice = +(expectedCost * 1.5).toFixed(2);

    expect(calls).to.have.lengthOf(1);
    expect(calls[0][0]).to.be.closeTo(expectedCost, 0.001);
    expect(calls[0][1]).to.be.closeTo(expectedPrice, 0.001);
    expect(calls[0][2]).to.equal(10);
  });
});

