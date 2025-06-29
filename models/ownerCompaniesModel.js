const db = require('../db');

const createOwnerCompany = (name, address, profitPercentage = 0, logoPath = null) => {
  return new Promise((resolve, reject) => {
    const sql =
      `INSERT INTO owner_companies (name, address, profit_percentage, logo_path) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, address, profitPercentage, logoPath], (err, result) => {
      if (err) return reject(err);
      resolve({ id: result.insertId, name, address, profit_percentage: profitPercentage, logo_path: logoPath });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM owner_companies WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM owner_companies', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateOwnerCompany = (id, name, address, profitPercentage, logoPath = null) => {
  return new Promise((resolve, reject) => {
    const sql =
      `UPDATE owner_companies SET name = ?, address = ?, profit_percentage = ?, logo_path = ? WHERE id = ?`;
    db.query(sql, [name, address, profitPercentage, logoPath, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const updateLogoPath = (id, logoPath) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE owner_companies SET logo_path = ? WHERE id = ?';
    db.query(sql, [logoPath, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteOwnerCompany = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM owner_companies WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getFirst = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM owner_companies LIMIT 1', (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

module.exports = {
  createOwnerCompany,
  findById,
  findAll,
  updateOwnerCompany,
  updateLogoPath,
  deleteOwnerCompany,
  getFirst
};
