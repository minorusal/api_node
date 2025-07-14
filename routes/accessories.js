const express = require('express');
const Accessories = require('../models/accessoriesModel');
const AccessoryMaterials = require('../models/accessoryMaterialsModel');
const AccessoryComponents = require('../models/accessoryComponentsModel');

const router = express.Router();

// --- Rutas Principales ---

router.get('/', async (req, res) => {
    try {
        const ownerId = req.user.owner_company_id;
        
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);
        const search = req.query.search || '';

        const accessories = await Accessories.findByOwnerWithCostsPaginated(ownerId, page, limit, search);
        const totalDocs = await Accessories.countByOwner(ownerId, search);

        res.json({
            docs: accessories,
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            page,
            limit,
            search,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const ownerId = req.user.owner_company_id;

        const accessoryData = { ...req.body, owner_id: ownerId };
        
        // Corregido: Llamar a la función 'create' exportada
        const newAccessory = await Accessories.create(accessoryData);
        
        res.status(201).json(newAccessory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const ownerId = req.user.owner_company_id;
        
        // Esta función ahora calcula y devuelve todo
        const accessory = await Accessories.getAccessoryWithPrice(id, ownerId);

        if (!accessory) {
            return res.status(404).json({ message: 'Accesorio no encontrado o no pertenece a su compañía.' });
        }
        
        res.json(accessory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Las rutas de composición (materials, components) ya no son necesarias para la creación,
// pero las mantenemos por si se quieren añadir/eliminar materiales a un accesorio existente.
// Se necesitaría refactorizar para usar owner_company_id.

router.get('/:id/price', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const accessory = await Accessories.getAccessoryById(id);
        if (!accessory) {
            return res.status(404).json({ message: 'Accesorio no encontrado.' });
        }
        const priceDetails = await Accessories.updateAccessoryPrice(id, accessory.owner_id);
        res.json(priceDetails);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.get('/:id/materials', async (req, res) => {
    try {
        const materials = await AccessoryMaterials.getMaterialsForAccessory(req.params.id);
        res.json(materials);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/materials', async (req, res) => {
    try {
        const accessoryId = parseInt(req.params.id, 10);
        const ownerId = req.user.owner_company_id;

        // Verificar que el accesorio principal pertenece a la compañía
        const accessory = await Accessories.getAccessoryById(accessoryId);
        if (!accessory || accessory.owner_id !== ownerId) {
            return res.status(404).json({ message: 'Accesorio no encontrado o no pertenece a su compañía.' });
        }
        
        const materialData = { ...req.body, accessory_id: accessoryId, owner_id: ownerId };
        const newMaterialLink = await AccessoryMaterials.addMaterialToAccessory(materialData);
        
        await Accessories.updateAccessoryPrice(accessoryId, ownerId);
        
        res.status(201).json(newMaterialLink);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:accessoryId/materials/:accessoryMaterialId', async (req, res) => {
    try {
        await AccessoryMaterials.removeMaterialFromAccessory(req.params.accessoryMaterialId);
        
        // Recalcular el precio total del accesorio
        const accessory = await Accessories.getAccessoryById(req.params.accessoryId);
        if (accessory) {
            await Accessories.updateAccessoryPrice(accessory.id, accessory.owner_id);
        }
        
        res.status(200).json({ message: 'Material del accesorio eliminado correctamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


router.get('/:id/components', async (req, res) => {
    try {
        const components = await AccessoryComponents.getComponentsForAccessory(req.params.id);
        res.json(components);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/components', async (req, res) => {
    try {
        const accessoryId = parseInt(req.params.id, 10);
        const accessory = await Accessories.getAccessoryById(accessoryId);
        if (!accessory) {
            return res.status(404).json({ message: 'Accesorio no encontrado.' });
        }

        const componentData = { ...req.body, parent_accessory_id: accessoryId, owner_id: accessory.owner_id };
        const newComponentLink = await AccessoryComponents.addComponentToAccessory(componentData);
        
        // Recalcular el precio total del accesorio
        await Accessories.updateAccessoryPrice(accessoryId, accessory.owner_id);

        res.status(201).json(newComponentLink);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:accessoryId/components/:accessoryComponentId', async (req, res) => {
    try {
        await AccessoryComponents.removeComponentFromAccessory(req.params.accessoryComponentId);

        // Recalcular el precio total del accesorio
        const accessory = await Accessories.getAccessoryById(req.params.accessoryId);
        if (accessory) {
            await Accessories.updateAccessoryPrice(accessory.id, accessory.owner_id);
        }
        
        res.status(200).json({ message: 'Componente del accesorio eliminado correctamente.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
