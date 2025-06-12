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
router.get('/clients', async (req, res) => {
  try {
    const clients = await Clients.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/clients/:id', async (req, res) => {
  try {
    const client = await Clients.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/clients', async (req, res) => {
  try {
    const { contact_name, company_name, address, requires_invoice, billing_info } = req.body;
    const client = await Clients.createClient(contact_name, company_name, address, requires_invoice, billing_info, 1);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/clients/:id', async (req, res) => {
  try {
    const { contact_name, company_name, address, requires_invoice, billing_info } = req.body;
    const client = await Clients.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });
    await Clients.updateClient(req.params.id, contact_name, company_name, address, requires_invoice, billing_info);
    res.json({ message: 'Cliente actualizado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/clients/:id', async (req, res) => {
  try {
    const client = await Clients.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });
    await Clients.deleteClient(req.params.id);
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
