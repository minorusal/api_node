const { expect } = require('chai');
const operaciones = require('../Modules/operacionesModule');

describe('sumaDosNumeros', () => {
  it('should return the sum of two numbers', async () => {
    const result = await operaciones.sumaDosNumeros(2, 3);
    expect(result).to.equal(5);
  });
});
