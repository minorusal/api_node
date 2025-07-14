const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const router = express.Router();
const catchAsync = require('../Modules/catchAsync');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

    return res.status(422).json({
        errors: extractedErrors,
    });
};

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     summary: Crear un usuario
 *     tags:
 *       - Users
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
 *     responses:
 *       201:
 *         description: Usuario creado
 *
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no existe
 *   put:
 *     summary: Actualizar un usuario
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no existe
 *   delete:
 *     summary: Eliminar un usuario
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no existe
 */

// Ruta para obtener todos los usuarios
router.get('/', catchAsync(async (req, res) => {
    const usuarios = await User.findAll();
    res.json(usuarios);
}));

/**
 * Obtiene un usuario por su ID.
 * @route GET /users/:id
 */
router.get('/:id', [
    param('id').isInt().withMessage('El ID debe ser un número entero')
], validate, catchAsync(async (req, res) => {
    const { id } = req.params;
    const usuario = await User.findById(id);
    if (!usuario) {
        return res.status(404).json({ message: 'El usuario no existe' });
    }
    res.json(usuario);
}));

/**
 * Crea un usuario nuevo.
 * @route POST /users
 */
router.post('/', [
    body('username').isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], validate, catchAsync(async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser(username, hashedPassword);
    res.status(201).json(newUser);
}));

/**
 * Actualiza un usuario existente.
 * @route PUT /users/:id
 */
router.put('/:id', [
    param('id').isInt().withMessage('El ID debe ser un número entero'),
    body('username').isEmail().withMessage('Debe ser un correo electrónico válido')
], validate, catchAsync(async (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    const result = await User.updateUser(id, username);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'El usuario no existe' });
    }
    res.json({ message: 'Usuario actualizado' });
}));

/**
 * Elimina un usuario por su ID.
 * @route DELETE /users/:id
 */
router.delete('/:id', [
    param('id').isInt().withMessage('El ID debe ser un número entero')
], validate, catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await User.deleteUser(id);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'El usuario no existe' });
    }
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
}));

module.exports = router;
