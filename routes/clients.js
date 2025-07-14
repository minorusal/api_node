const express = require('express');
const Clients = require('../models/clientsModel');
const router = express.Router();

/**
 * @openapi
 * /clients:
 *   get:
 *     summary: Listar clientes
 *     tags:
 *       - Clients
 *     responses:
 *       200:
 *         description: Lista de clientes
 *   post:
 *     summary: Crear cliente
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact_name:
 *                 type: string
 *               company_name:
 *                 type: string
 *               address:
 *                 type: string
 *               requires_invoice:
 *                 type: boolean
 *               billing_info:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cliente creado
 *
 * /clients/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags:
 *       - Clients
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *       404:
 *         description: Cliente no encontrado
 *   put:
 *     summary: Actualizar cliente
 *     tags:
 *       - Clients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact_name:
 *                 type: string
 *               company_name:
 *                 type: string
 *               address:
 *                 type: string
 *               requires_invoice:
 *                 type: boolean
 *               billing_info:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 *   delete:
 *     summary: Eliminar cliente
 *     tags:
 *       - Clients
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const clients = await Clients.findAll(ownerCompanyId);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const client = await Clients.findById(req.params.id, ownerCompanyId);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado o no pertenece a esta compañía' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const client = await Clients.createClient(req.body, ownerCompanyId);
    res.status(201).json(client);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const result = await Clients.updateClient(req.params.id, req.body, ownerCompanyId);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado o no pertenece a esta compañía' });
    }
    res.json({ message: 'Cliente actualizado' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const ownerCompanyId = req.user.owner_company_id;
    const result = await Clients.deleteClient(req.params.id, ownerCompanyId);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cliente no encontrado o no pertenece a esta compañía' });
    }
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
