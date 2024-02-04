const express = require('express');
const User = require('../models/usersModel');
const router = express.Router();

// Ruta para obtener todos los usuarios
router.get('/users', async (req, res) => {
    const usuarios = await User.find();
    res.json(usuarios);
});

// Ruta para obtener un usuario por su ID
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    const usuario = await User.findById(id);
    if (!usuario) {
        return res.status(404).json({ message: 'El usuario no existe' });
    }
    const updatedUsuario = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedUsuario);
});

// Ruta para crear un nuevo usuario
router.post('/users', async (req, res) => {
    const usuario = new User(req.body);
    await usuario.save();
    res.json(usuario);
});

// Ruta para actualizar un usuario por su ID
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const usuario = await User.findById(id);
    if (!usuario) {
        return res.status(404).json({ message: 'El usuario no existe' });
    }
    const updatedUsuario = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedUsuario);
});

// Ruta para eliminar un usuario por su ID
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'El usuario no existe' });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: 'Usuario eliminado correctamente' });
});

module.exports = router;
