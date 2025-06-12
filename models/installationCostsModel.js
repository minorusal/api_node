const db = require('../db');

const createInstallationCosts = (
  projectId,
  workers,
  days,
  mealPerPerson,
  hotelPerDay,
  laborCost,
  personalTransport,
  localTransport,
  extraExpenses,
  ownerId = 1
) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO installation_costs (project_id, workers, days, meal_per_person, hotel_per_day, labor_cost, personal_transport, local_transport, extra_expenses, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [projectId, workers, days, mealPerPerson, hotelPerDay, laborCost, personalTransport, localTransport, extraExpenses, ownerId];
    db.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        project_id: projectId,
        workers,
        days,
        meal_per_person: mealPerPerson,
        hotel_per_day: hotelPerDay,
        labor_cost: laborCost,
        personal_transport: personalTransport,
        local_transport: localTransport,
        extra_expenses: extraExpenses,
        owner_id: ownerId
      });
    });
  });
};

const findByProjectId = (projectId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM installation_costs WHERE project_id = ?';
    db.query(sql, [projectId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

module.exports = {
  createInstallationCosts,
  findByProjectId
};
