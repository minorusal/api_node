const express = require('express');
const router = express.Router();
const getApis = require('../Modules/apisInformation');

// Ruta para obtener la informacion que se obtiene de la api publica
router.get('/get-api', async (req, res) => {
    try {
        const data = await getApis.consumeApi();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
