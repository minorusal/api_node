const db = require('../db');

/**
 * Añade un sub-accesorio (componente) a un accesorio padre.
 * @param {object} data - Datos de la relación.
 * @param {number} data.parent_accessory_id - ID del accesorio principal.
 * @param {number} data.child_accessory_id - ID del accesorio que se añade como componente.
 * @param {number} data.quantity - Cantidad del sub-accesorio.
 * @param {number} data.owner_id - ID de la empresa dueña.
 * @returns {object} El registro de la relación creada.
 */
const addComponentToAccessory = async (data) => {
    const { parent_accessory_id, child_accessory_id, quantity, owner_id } = data;
    const sql = 'INSERT INTO accessory_components (parent_accessory_id, child_accessory_id, quantity, owner_id) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [parent_accessory_id, child_accessory_id, quantity, owner_id]);
    const [createdRow] = await db.query('SELECT * FROM accessory_components WHERE id = ?', [result.insertId]);
    return createdRow[0];
};

/**
 * Obtiene todos los sub-accesorios (componentes) de un accesorio padre.
 * @param {number} parentAccessoryId - El ID del accesorio principal.
 * @returns {Array<object>} Una lista de los componentes, incluyendo sus detalles.
 */
const getComponentsForAccessory = async (parentAccessoryId) => {
    const sql = `
        SELECT
            ac.id,
            ac.child_accessory_id,
            ac.quantity,
            a.name AS name,
            a.description AS description
        FROM accessory_components ac
        JOIN accessories a ON ac.child_accessory_id = a.id
        WHERE ac.parent_accessory_id = ?
    `;
    const [rows] = await db.query(sql, [parentAccessoryId]);
    return rows;
};

/**
 * Elimina un componente de un accesorio.
 * @param {number} componentId - El ID del registro en la tabla accessory_components.
 * @returns {object} El resultado de la operación de borrado.
 */
const removeComponentFromAccessory = async (componentId) => {
    const [result] = await db.query('DELETE FROM accessory_components WHERE id = ?', [componentId]);
    return result;
};


module.exports = {
    addComponentToAccessory,
    getComponentsForAccessory,
    removeComponentFromAccessory,
};
