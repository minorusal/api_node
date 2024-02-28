const express = require('express');
const router = express.Router();
const operaciones = require('../Modules/operacionesModule');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Ruta para obtener la informacion que se obtiene de la api publica
router.post('/suma-numeros', async (req, res) => {
    const { numA, numB } = req.body;
    if (!numA || !numB) {
        return res.status(400).json({ error: 'Se requieren dos números' });
    }
    const result = await operaciones.sumaDosNumeros(numA, numB);

    const sqlInsert = 'INSERT INTO demo_table (numA, numB, resultado) VALUES (?, ?, ?)';
    const queryValues = [numA, numB, result];

    // Ejecutar la consulta de inserción en la base de datos
    db.query(sqlInsert, queryValues, async (error, insertResult) => {
        if (error) {
            console.error('Error al insertar en la tabla:', error);
            return res.status(500).json({ error: 'Error al insertar en la tabla' });
        }

        // Consultar la información recién insertada en la tabla
        const sqlSelect = 'SELECT * FROM demo_table';
        db.query(sqlSelect, (selectError, selectResults) => {
            if (selectError) {
                console.error('Error al obtener información de la tabla:', selectError);
                return res.status(500).json({ error: 'Error al obtener información de la tabla' });
            }
            
            // Devolver el resultado de la suma y la información de la tabla en la respuesta
            res.json({ result, tableData: selectResults });
        });
    });
});


router.post('/validacion-token-jwt', async (req, res) => {
    const { sessionToken, refreshToken } = req.body;
    if (!sessionToken || !refreshToken) {
        return res.status(400).json({ error: 'Se requieren dos números' });
    }
    const resultST = await operaciones.validaToken(sessionToken);
    const resultRT = await operaciones.validaToken(refreshToken);

    res.json({ resultST, resultRT });
});



module.exports = router;
