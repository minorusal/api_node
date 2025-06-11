const db = require('../db');

const createClient = (contactName, companyName, address, requiresInvoice, billingInfo) => {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO clients (contact_name, company_name, address, requires_invoice, billing_info) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [contactName, companyName, address, requiresInvoice, billingInfo], (err, result) => {
      if (err) return reject(err);
      resolve({
        id: result.insertId,
        contact_name: contactName,
        company_name: companyName,
        address,
        requires_invoice: requiresInvoice,
        billing_info: billingInfo
      });
    });
  });
};

const findById = (id) => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM clients WHERE id = ?', [id], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
};

const findAll = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM clients', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
};

const updateClient = (id, contactName, companyName, address, requiresInvoice, billingInfo) => {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE clients SET contact_name = ?, company_name = ?, address = ?, requires_invoice = ?, billing_info = ? WHERE id = ?`;
    db.query(sql, [contactName, companyName, address, requiresInvoice, billingInfo, id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const deleteClient = (id) => {
  return new Promise((resolve, reject) => {
    db.query('DELETE FROM clients WHERE id = ?', [id], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  createClient,
  findById,
  findAll,
  updateClient,
  deleteClient
};
