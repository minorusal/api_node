const { expect } = require('chai');
const materialsRouter = require('../routes/materials');
const accessoriesRouter = require('../routes/accessories');
const playsetsRouter = require('../routes/playsets');

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
});
