const { sequelize, DataTypes } = require('./index');

const invoice_data = sequelize.define(
  'invoice_data', {
    invoice_number: DataTypes.STRING,
    user_id: DataTypes.STRING,
    value: DataTypes.TEXT,
  },
);

(async ()=>{
  await invoice_data.sync();
});

module.exports = invoice_data
