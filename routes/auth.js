const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/usersModel');
const OwnerCompany = require('../models/ownerCompaniesModel');
const router = express.Router();
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario para una compañía
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               companyIdentifier:
 *                 type: string
 *                 description: "Nombre de la compañía a la que pertenecerá el usuario"
 *     responses:
 *       201:
 *         description: Usuario creado
 *       404:
 *         description: La compañía no existe
 *
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               companyIdentifier:
 *                 type: string
 *                 description: "Nombre de la compañía a la que se desea acceder"
 *     responses:
 *       200:
 *         description: Autenticación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                 ownerCompany:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 *
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Token JWT con el prefijo Bearer
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       401:
 *         description: No hay sesión activa
 */

// Ruta de registro de usuarios
router.post('/register', async (req, res, next) => {
    try {
        const { username, password, companyIdentifier } = req.body;

        const company = await OwnerCompany.findByName(companyIdentifier);
        if (!company) {
            return res.status(404).json({ message: 'La compañía especificada no existe.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.createUser(username, hashedPassword, company.id);
        res.status(201).json({ message: 'Usuario creado exitosamente para la compañía ' + company.name });
    } catch (error) {
        // Manejar error de usuario duplicado (mismo email en la misma compañia)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Este nombre de usuario ya existe en esta compañía.' });
        }
        next(error);
    }
});

/**
 * Inicio de sesión de usuarios.
 * @route POST /login
 */
router.post('/login', async (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        try {
            // Primero, manejar errores del sistema (ej. fallo de DB)
            if (err) {
                return next(err);
            }
            // Luego, manejar fallos de autenticación (usuario/pass incorrecto)
            if (!user) {
                // Si 'info' existe, usamos su mensaje, si no, uno genérico.
                return res.status(401).json({ message: info ? info.message : 'Credenciales inválidas.' });
            }
            // Si todo va bien, procedemos con el login
            req.login(user, { session: false }, async (error) => {
                if (error) return next(error);
                
                const payload = {
                    sub: user.id,
                    owner_company_id: user.owner_company_id
                };
                const token = jwt.sign(payload, jwtSecret);
                
                let ownerCompany = null;
                if (user.owner_company_id) {
                    ownerCompany = await OwnerCompany.getOwnerCompanyById(user.owner_company_id);
                }
                
                // eslint-disable-next-line no-unused-vars
                const { password, ...userData } = user;
                
                return res.status(200).json({
                    message: 'Autenticación exitosa',
                    token,
                    user: userData,
                    ownerCompany
                });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});

/**
 * Cierre de sesión.
 * @route POST /logout
 */
router.post('/logout', (req, res) => {
    const cookieToken = req.cookies.jwt;
    const headerToken = req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    if (!cookieToken && !headerToken) {
        return res.status(401).json({ message: 'No hay sesión activa' });
    }

    if (cookieToken && headerToken && cookieToken !== headerToken) {
        return res.status(401).json({ message: 'Tokens JWT no coinciden' });
    }

    res.clearCookie('jwt');
    res.status(200).json({ message: 'Logout exitoso' });
});

module.exports = router;
