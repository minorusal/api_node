const { expect } = require('chai');
const materialsRouter = require('../routes/materials');
const accessoriesRouter = require('../routes/accessories');
const playsetsRouter = require('../routes/playsets');
const materialAttributesRouter = require('../routes/materialAttributes');
const accessoryMaterialsRouter = require('../routes/accessoryMaterials');
const accessoryComponentsRouter = require('../routes/accessoryComponents');
const playsetAccessoriesRouter = require('../routes/playsetAccessories');
const clientsRouter = require('../routes/clients');
const projectsRouter = require('../routes/projects');
const installationCostsRouter = require('../routes/installationCosts');
const ownerCompaniesRouter = require('../routes/ownerCompanies');
const remissionStyleRouter = require('../routes/remissionStyle');
const materialTypesRouter = require('../routes/materialTypes');

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

  it('playsets router registers cost route', () => {
    const hasRoute = playsetsRouter.stack.some(
      layer => layer.route && layer.route.path === '/playsets/:id/cost' && layer.route.methods.get
    );
    expect(hasRoute).to.be.true;
  });

  it('material attributes router has routes configured', () => {
    expect(materialAttributesRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('accessory materials router has routes configured', () => {
    expect(accessoryMaterialsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('accessory components router has routes configured', () => {
    expect(accessoryComponentsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('accessory components router registers replace route', () => {
    const hasRoute = accessoryComponentsRouter.stack.some(
      layer =>
        layer.route &&
        layer.route.path === '/accessories/:id/components' &&
        layer.route.methods.put
    );
    expect(hasRoute).to.be.true;
  });

  it('playset accessories router has routes configured', () => {
    expect(playsetAccessoriesRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('clients router has routes configured', () => {
    expect(clientsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('projects router has routes configured', () => {
    expect(projectsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('projects router registers pdf route', () => {
    const hasRoute = projectsRouter.stack.some(
      layer => layer.route && layer.route.path === '/projects/:id/pdf' && layer.route.methods.get
    );
    expect(hasRoute).to.be.true;
  });

  it('installation costs router has routes configured', () => {
    expect(installationCostsRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('owner companies router has routes configured', () => {
    expect(ownerCompaniesRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('remission style router has routes configured', () => {
    expect(remissionStyleRouter.stack).to.be.an('array').that.is.not.empty;
  });

  it('material types router has routes configured', () => {
    expect(materialTypesRouter.stack).to.be.an('array').that.is.not.empty;
  });
});
