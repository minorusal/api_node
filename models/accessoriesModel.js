const db = require('../db');
const ownerCompanyModel = require('./ownerCompaniesModel');
const AccessoryMaterials = require('./accessoryMaterialsModel');

/**
 * CALCULA Y GUARDA el precio total de un accesorio.
 * Suma los precios de sus materiales y los precios de sus sub-accesorios (recursivamente).
 * Luego, guarda el resultado en la tabla accessory_pricing.
 *
 * @param {number} accessoryId - El ID del accesorio a calcular.
 * @param {number} ownerId - El ID de la empresa dueña.
 * @returns {Promise<object>} El precio total desglosado.
 */
async function updateAccessoryPrice(accessoryId, ownerId) {
    // Se usa require local para evitar dependencia circular.
    const accessoryMaterialsModel = require('./accessoryMaterialsModel');

    // 1. Obtener el porcentaje de ganancia de la compañía.
    const ownerCompany = await ownerCompanyModel.getOwnerCompanyById(ownerId);
    const markupPercentage = ownerCompany ? parseFloat(ownerCompany.profit_percentage) : 0;

    // 2. Calcular costos de materiales DIRECTOS on-the-fly.
    const materialsSql = `
        SELECT
            am.quantity,
            am.attributes,
            am.owner_id,
            m.id as material_id,
            m.name,
            m.purchase_price,
            m.material_type_id
        FROM accessory_materials am
        JOIN materials m ON am.material_id = m.id
        WHERE am.accessory_id = ?
    `;
    const [directMaterials] = await db.query(materialsSql, [accessoryId]);

    let totalCost = 0;
    let totalPrice = 0;

    for (const materialLink of directMaterials) {
        const material = {
            id: materialLink.material_id,
            name: materialLink.name,
            purchase_price: materialLink.purchase_price,
            material_type_id: materialLink.material_type_id,
        };
        const attributes = typeof materialLink.attributes === 'string' ? JSON.parse(materialLink.attributes) : {};
        const usageData = {
            quantity: materialLink.quantity,
            width: attributes.width,
            length: attributes.length,
            owner_id: materialLink.owner_id,
        };

        const { proportionalCost, salePrice } = await accessoryMaterialsModel.calculateMaterialCost(material, usageData);
        
        totalCost += proportionalCost;
        totalPrice += salePrice;
    }

    // 3. Sumar costos y precios de venta de COMPONENTES (que son otros accesorios).
    const componentsSql = 'SELECT child_accessory_id, quantity FROM accessory_components WHERE parent_accessory_id = ?';
    const [components] = await db.query(componentsSql, [accessoryId]);

    for (const component of components) {
        // Asegurarse de que el precio del sub-componente esté actualizado.
        await updateAccessoryPrice(component.child_accessory_id, ownerId);

        const pricingSql = 'SELECT total_materials_price, total_price FROM accessory_pricing WHERE accessory_id = ?';
        const [pricingResult] = await db.query(pricingSql, [component.child_accessory_id]);
        
        if (pricingResult.length > 0) {
            const componentCost = parseFloat(pricingResult[0].total_materials_price || 0);
            const componentPrice = parseFloat(pricingResult[0].total_price || 0);
            totalCost += componentCost * component.quantity;
            totalPrice += componentPrice * component.quantity;
        }
    }

    // 4. Guardar los totales en la tabla accessory_pricing
    const upsertSql = `
        INSERT INTO accessory_pricing (accessory_id, owner_id, total_materials_price, markup_percentage, total_price)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        total_materials_price = VALUES(total_materials_price),
        markup_percentage = VALUES(markup_percentage),
        total_price = VALUES(total_price)
    `;
    const upsertParams = [accessoryId, ownerId, totalCost, markupPercentage, totalPrice];
    await db.query(upsertSql, upsertParams);

    return { totalCost, totalPrice };
};

/**
 * Inserts a new accessory into the database.
 * @param {object} data - The accessory data to insert.
 * @returns {Promise<object>} The newly created accessory object.
 */
const create = async (data) => {
    // Se confía en los totales calculados por el frontend. NO SE RECALCULA NADA.
    const { name, description, owner_id, materials, components, total_cost, total_price, markup_percentage } = data;

    // 1. Crear el accesorio base.
    const [newAccessoryResult] = await db.query('INSERT INTO accessories (name, description, owner_id) VALUES (?, ?, ?)', [name, description, owner_id]);
    const newAccessoryId = newAccessoryResult.insertId;

    // 2. Guardar el detalle de materiales (solo para registro, no para cálculo).
    if (materials && materials.length > 0) {
        for (const material of materials) {
            await AccessoryMaterials.addMaterialToAccessory({ ...material, accessory_id: newAccessoryId, owner_id });
        }
    }
    
    // 3. Guardar el detalle de componentes.
    if (components && components.length > 0) {
        for (const component of components) {
            await db.query('INSERT INTO accessory_components (parent_accessory_id, child_accessory_id, quantity) VALUES (?, ?, ?)', [newAccessoryId, component.child_accessory_id, component.quantity]);
        }
    }

    // 4. Guardar los totales enviados desde el frontend directamente.
    const pricingSql = `
        INSERT INTO accessory_pricing (accessory_id, owner_id, total_materials_price, markup_percentage, total_price)
        VALUES (?, ?, ?, ?, ?)
    `;
    const pricingParams = [newAccessoryId, owner_id, total_cost, markup_percentage, total_price];
    await db.query(pricingSql, pricingParams);

    // 5. Devolver los mismos datos que se recibieron, más el nuevo ID.
    return { 
        id: newAccessoryId, 
        name, 
        description, 
        owner_id,
        total_cost: total_cost,
        total_price: total_price,
        markup_percentage: markup_percentage
    }
};

const getAccessoryById = async (id) => {
    const [rows] = await db.query('SELECT * FROM accessories WHERE id = ?', [id]);
    return rows[0];
};

const getAccessoryWithPrice = async (accessoryId, ownerId) => {
    const accessoryData = await getAccessoryById(accessoryId);
    if (!accessoryData) {
        return null;
    }

    // Se cambió para que no recalcule y guarde en una petición GET.
    // Ahora solo busca el precio almacenado.
    const pricingSql = `
      SELECT total_materials_price as totalCost, total_price as totalPrice 
      FROM accessory_pricing 
      WHERE accessory_id = ? AND owner_id = ?
    `;
    const [pricingResult] = await db.query(pricingSql, [accessoryId, ownerId]);
    
    const priceData = pricingResult[0] || { totalCost: 0, totalPrice: 0 };

    // Combinar los datos del accesorio con los datos del precio almacenado.
    return { ...accessoryData, ...priceData };
}

const findByOwnerWithCostsPaginated = async (owner_id, page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    
    let query = `
        SELECT 
            a.id, 
            a.name, 
            a.description, 
            a.owner_id,
            COALESCE(ap.total_price, 0.00) as total_price,
            COALESCE(ap.total_materials_price, 0.00) as total_cost,
            COALESCE(ap.markup_percentage, 0.00) as markup_percentage
        FROM accessories a
        LEFT JOIN accessory_pricing ap ON a.id = ap.accessory_id
        WHERE a.owner_id = ?
    `;

    const params = [owner_id];

    if (search) {
        query += ` AND (a.name LIKE ? OR a.description LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows;
};

const countByOwner = async (ownerId, search) => {
    const searchQuery = search ? `%${search}%` : '%';
    const sql = `
        SELECT COUNT(*) as count
        FROM accessories a
        WHERE a.owner_id = ?
        AND (a.name LIKE ? OR a.description LIKE ?);
    `;
    const [rows] = await db.query(sql, [ownerId, searchQuery, searchQuery]);
    return rows[0].count;
};

module.exports = {
    create,
    updateAccessoryPrice,
    getAccessoryById,
    getAccessoryWithPrice,
    findByOwnerWithCostsPaginated,
    countByOwner
};
