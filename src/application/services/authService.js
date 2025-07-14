const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async register(username, password) {
    const hashed = await bcrypt.hash(password, 10);
    return this.userRepository.createUser(username, hashed);
  }

  async login(username, password) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error('Credenciales inválidas');
    }
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET);
    return { token, user };
  }
}

module.exports = AuthService;
