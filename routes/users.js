const express = require('express');
const User = require('../models/usersModel');
const bcrypt = require('bcryptjs');
const router = express.Router();

/**
 * Obtiene todos los usuarios.
 * @route GET /users
 */
router.get('/users', async (req, res) => {
    try {
        const usuarios = await User.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Obtiene un usuario por su ID.
 * @route GET /users/:id
 */
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

/**
 * Crea un usuario nuevo.
 * @route POST /users
 */
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

/**
 * Actualiza un usuario existente.
 * @route PUT /users/:id
 */
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

/**
 * Elimina un usuario por su ID.
 * @route DELETE /users/:id
 */
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
