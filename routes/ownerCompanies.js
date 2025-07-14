const express = require('express');
const router = express.Router();
const OwnerCompanies = require('../models/ownerCompaniesModel');
const catchAsync = require('../Modules/catchAsync');

// --- RUTAS CRUD ---

router.get('/', catchAsync(async (req, res) => {
    const companies = await OwnerCompanies.getAllOwnerCompanies();
    res.json(companies);
}));

router.get('/:id', catchAsync(async (req, res) => {
    const company = await OwnerCompanies.getOwnerCompanyById(req.params.id);
    if (company) {
        res.json(company);
    } else {
        res.status(404).json({ message: 'Compañía no encontrada' });
    }
}));

router.post('/', catchAsync(async (req, res) => {
    const newCompany = await OwnerCompanies.createOwnerCompany(req.body);
    res.status(201).json(newCompany);
}));

router.put('/:id', catchAsync(async (req, res) => {
    const result = await OwnerCompanies.updateOwnerCompany(req.params.id, req.body);
     if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Compañía no encontrada' });
    }
    const updatedCompany = await OwnerCompanies.getOwnerCompanyById(req.params.id);
    res.json(updatedCompany);
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const result = await OwnerCompanies.deleteOwnerCompany(req.params.id);
    if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Compañía no encontrada' });
    }
    res.json({ message: 'Compañía eliminada correctamente' });
}));

module.exports = router;
