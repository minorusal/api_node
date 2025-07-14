class UserRepository {
  async findByUsername(username) {
    throw new Error('Not implemented');
  }

  async findById(id) {
    throw new Error('Not implemented');
  }

  async createUser(username, password) {
    throw new Error('Not implemented');
  }
}

module.exports = UserRepository;
