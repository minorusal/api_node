const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OwnerCompanies = require('../models/ownerCompaniesModel');

/**
 * Ruta de la carpeta donde se guardarán los archivos
 */
const uploadDirectory = './uploads';
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
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
 * @openapi
 * /owner-companies/{id}/logo:
 *   post:
 *     summary: Subir logo de la empresa
 *     tags:
 *       - OwnerCompanies
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
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
 *       200:
 *         description: Logo actualizado
 */
router.post('/owner-companies/:id/logo', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
  }
  try {
    const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;
    await OwnerCompanies.updateLogoPath(req.params.id, fileUrl);
    res.json({ message: 'Logo actualizado', logoPath: fileUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
