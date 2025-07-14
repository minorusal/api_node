const db = require('../db');

const getAllAccessoryPricings = async () => {
    const [rows] = await db.query('SELECT * FROM accessory_pricing');
    return rows;
};

const getAccessoryPricingById = async (id) => {
    const [rows] = await db.query('SELECT * FROM accessory_pricing WHERE id = ?', [id]);
    return rows[0];
};

const createAccessoryPricing = async (pricing) => {
    const { accessory_id, price, start_date, end_date } = pricing;
    const sql = 'INSERT INTO accessory_pricing (accessory_id, price, start_date, end_date) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [accessory_id, price, start_date, end_date]);
    return { id: result.insertId, ...pricing };
};

const updateAccessoryPricing = async (id, pricing) => {
    const { accessory_id, price, start_date, end_date } = pricing;
    const sql = 'UPDATE accessory_pricing SET accessory_id = ?, price = ?, start_date = ?, end_date = ? WHERE id = ?';
    const [result] = await db.query(sql, [accessory_id, price, start_date, end_date, id]);
    return result;
};

const deleteAccessoryPricing = async (id) => {
    const [result] = await db.query('DELETE FROM accessory_pricing WHERE id = ?', [id]);
    return result;
};

module.exports = {
    getAllAccessoryPricings,
    getAccessoryPricingById,
    createAccessoryPricing,
    updateAccessoryPricing,
    deleteAccessoryPricing
};
