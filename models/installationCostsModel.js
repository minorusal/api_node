const db = require('../db');

const findByProjectId = async (projectId) => {
    const [rows] = await db.query('SELECT * FROM installation_costs WHERE project_id = ?', [projectId]);
    return rows[0];
};

const createInstallationCosts = async (projectId, workers, days, mealPerPerson, hotelPerDay, laborCost, personalTransport, localTransport, extraExpenses, ownerId) => {
    const sql = `
        INSERT INTO installation_costs 
        (project_id, workers, days, meal_per_person, hotel_per_day, labor_cost, personal_transport, local_transport, extra_expenses, owner_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [projectId, workers, days, mealPerPerson, hotelPerDay, laborCost, personalTransport, localTransport, extraExpenses, ownerId]);
    const [newRecord] = await db.query('SELECT * FROM installation_costs WHERE id = ?', [result.insertId]);
    return newRecord[0];
};

const updateInstallationCosts = async (projectId, workers, days, mealPerPerson, hotelPerDay, laborCost, personalTransport, localTransport, extraExpenses) => {
    const sql = `
        UPDATE installation_costs 
        SET workers = ?, days = ?, meal_per_person = ?, hotel_per_day = ?, labor_cost = ?, personal_transport = ?, local_transport = ?, extra_expenses = ?
        WHERE project_id = ?
    `;
    const [result] = await db.query(sql, [workers, days, mealPerPerson, hotelPerDay, laborCost, personalTransport, localTransport, extraExpenses, projectId]);
    if (result.affectedRows === 0) {
        return null;
    }
    return findByProjectId(projectId);
};

module.exports = {
    findByProjectId,
    createInstallationCosts,
    updateInstallationCosts,
};
