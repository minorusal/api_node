const { expect } = require('chai');
const materials = require('../models/materialsModel');
const accessories = require('../models/accessoriesModel');
const playsets = require('../models/playsetsModel');

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
      20
    );

    expect(result).to.deep.equal({
      id: 1,
      name: 'Wood',
      description: 'Pine wood',
      thickness_mm: 5,
      width_m: 2,
      length_m: 3,
      price: 20
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

  it('calculateSegment returns used length based on material width', async () => {
    db.query = (sql, params, callback) => {
      callback(null, [{ width_m: 2 }]);
    };

    const segment = await accessoryMaterials.calculateSegment(1, 1, 1.5, 2);

    // pieceArea = 1 * 1.5 = 1.5
    // segmentLength = (1.5 / 2) * 2 = 1.5
    expect(segment).to.be.closeTo(1.5, 0.0001);
  });
});

