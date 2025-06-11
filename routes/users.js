const express = require('express');
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const router = express.Router();

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
router.get('/users', async (req, res) => {
    try {
        const usuarios = await User.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para obtener un usuario por su ID
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para crear un nuevo usuario
router.post('/users', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.createUser(username, hashedPassword);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para actualizar un usuario por su ID
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        const usuario = await User.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }
        await User.updateUser(id, username);
        res.json({ message: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ruta para eliminar un usuario por su ID
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await User.findById(id);
        if (!usuario) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }
        await User.deleteUser(id);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
