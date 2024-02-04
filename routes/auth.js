const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel');
const router = express.Router();
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

// Ruta de registro de usuarios
router.post('/register', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        next(error);
    }
});

// Ruta de login de usuarios
router.post('/login', async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        try {
            if (err || !user) {
                return res.status(401).json({ message: info.message });
            }
            req.login(user, { session: false }, async (error) => {
                if (error) {
                    return next(error);
                }
                const token = jwt.sign({ sub: user._id }, jwtSecret);
                res.cookie('jwt', token, { httpOnly: true });
                return res.status(200).json({ message: 'Autenticación exitosa', token });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

// Ruta para el logout de usuarios
router.post('/logout', (req, res) => {
    if (!req.cookies.jwt) {
        return res.status(401).json({ message: 'No hay sesión activa' });
    }
    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logout exitoso' });
});

module.exports = router;
