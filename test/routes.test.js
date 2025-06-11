const { expect } = require('chai');
const materialsRouter = require('../routes/materials');
const accessoriesRouter = require('../routes/accessories');
const playsetsRouter = require('../routes/playsets');
const playsetAccessoriesRouter = require('../routes/playsetAccessories');
const materialAttributesRouter = require('../routes/materialAttributes');
const accessoryMaterialsRouter = require('../routes/accessoryMaterials');

describe('Route definitions', () => {
  it('materials router has routes configured', () => {
    expect(materialsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('accessories router has routes configured', () => {
    expect(accessoriesRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('playsets router has routes configured', () => {
    expect(playsetsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('material attributes router has routes configured', () => {
    expect(materialAttributesRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('accessory materials router has routes configured', () => {
    expect(accessoryMaterialsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('playset accessories router has routes configured', () => {
    expect(playsetAccessoriesRouter.stack).to.be.an('array').that.is.not.empty;
  });
});
