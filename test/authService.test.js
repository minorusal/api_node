const { expect } = require('chai');
const AuthService = require('../src/application/services/authService');

class MockRepo {
  constructor() {
    this.users = new Map();
    this.nextId = 1;
  }
  async createUser(username, password) {
    const user = { id: this.nextId++, username, password };
    this.users.set(username, user);
    return user;
  }
  async findByUsername(username) {
    const user = this.users.get(username);
    return user ? { ...user } : null;
  }
  async findById(id) {
    for (const user of this.users.values()) {
      if (user.id === id) return { ...user };
    }
    return null;
  }
}

describe('AuthService', () => {
  it('logs in with valid credentials', async () => {
    const repo = new MockRepo();
    const service = new AuthService(repo);
    const created = await service.register('test', 'pass');
    const result = await service.login('test', 'pass');
    expect(result.token).to.be.a('string');
    expect(result.user.id).to.equal(created.id);
  });

  it('fails login with invalid credentials', async () => {
    const repo = new MockRepo();
    const service = new AuthService(repo);
    await service.register('test', 'pass');
    try {
      await service.login('test', 'wrong');
    } catch (err) {
      expect(err.message).to.equal('Credenciales inválidas');
      return;
    }
    throw new Error('Expected error');
  });
});
