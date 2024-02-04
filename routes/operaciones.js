const express = require('express');
const router = express.Router();
const operaciones = require('../Modules/operacionesModule');

// Ruta para obtener la informacion que se obtiene de la api publica
router.post('/suma-numeros', async (req, res) => {
    const { numA, numB } = req.body;
    if (!numA || !numB) {
        return res.status(400).json({ error: 'Se requieren dos números' });
    }
    const result = await operaciones.sumaDosNumeros(numA, numB);
    res.json({ result });
});

module.exports = router;
