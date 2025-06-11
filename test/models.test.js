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
