const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');
const { munge } = require('./munge');

const modelName = 'invoice_data';

class invoiceData extends Model {}

invoiceData.init(
  {
    invoice_number: DataTypes.STRING,
    user_id: DataTypes.STRING,
    value: DataTypes.TEXT,
  }, {
    sequelize,
    modelName
  }
);

invoiceData.get_invoice = async (res, id) => {
  const data = await invoiceData.findOne({
    where: { id, user_id: res.locals.user.id }
  });
  return data?.dataValues || null;
}

invoiceData.get_invoice_count = async (res) => {
  const data = await invoiceData.findOne({
    attributes: [
      [Sequelize.fn('count', Sequelize.col('id')), 'count'],
      'user_id'
    ],
    group: ['user_id'],
    where: { user_id: res.locals.user.id }
  });
  const ret = data?.dataValues?.count || 0;
  return ret;
}

invoiceData.update_invoice_storage = async (id, res, value) => {
  const out = await invoiceData.upsert({
    id,
    user_id: res.locals.user.id,
    value: munge(value, true),
  });
  return out[0].dataValues.id;
}

invoiceData.update_field_storage = async (fld, res, value) => {
  // TODO: optimize update on change
  await field_data.upsert({
    user_id: res.locals.user.id,
    fld: fld,
    value: munge(value, true),
  });
}

module.exports = invoiceData
