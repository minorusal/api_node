const express = require('express');
const AuthService = require('../../application/services/authService');
const MysqlUserRepository = require('../repositories/mysqlUserRepository');

const router = express.Router();
const authService = new AuthService(new MysqlUserRepository());

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, user } = await authService.login(username, password);
    res.cookie('jwt', token, { httpOnly: true });
    res.json({ message: 'Autenticación exitosa', token, user: { id: user.id, username: user.username } });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
});

router.post('/logout', (req, res) => {
  const cookieToken = req.cookies.jwt;
  if (!cookieToken) {
    return res.status(401).json({ message: 'No hay sesión activa' });
  }
  res.clearCookie('jwt');
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
