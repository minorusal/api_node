const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readJSONFile } = require('../Modules/filesInformation');
const { log } = require('../Modules/logger');

/**
 * @openapi
 * /files/upload:
 *   post:
 *     summary: Subir archivo de imagen
 *     tags:
 *       - Files
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Archivo subido
 *
 * /files/read-json:
 *   get:
 *     summary: Leer archivo JSON de la carpeta uploads
 *     tags:
 *       - Files
 *     responses:
 *       200:
 *         description: Contenido del archivo JSON
 */

// Ruta de la carpeta donde se guardaran los archivos
const uploadDirectory = './uploads';

// Validar si la carpeta 'uploads' existe, y si no, crearlo
if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory);
}

// Configuracion de multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Configuracion de multer para aceptar solo archivos de imagen
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb('Error: Solo se permiten imágenes (jpeg, jpg, png)');
        }
    }
});

/**
 * Sube un archivo al servidor.
 * @route POST /upload
 */
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;
    res.status(201).json({ message: 'Archivo subido exitosamente', fileUrl: fileUrl });
});


/**
 * Lee el archivo JSON subido y devuelve su contenido.
 * @route GET /read-json
 */
router.get('/read-json', async (req, res) => {
    try {
        log('Si se consume');
        const jsonData = await readJSONFile('./uploads/data.json');
        log(jsonData);
        res.json(jsonData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
