const { Sequelize } = require('sequelize');
const sequelize = require('./sequelize');

const db = { sequelize, Sequelize };

const models = ['field_data', 'invoice_data'];

models.map(model => {
  db[model] = require(`./${model}`);
});

module.exports = db;
