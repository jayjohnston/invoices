const { DataTypes, Model } = require('sequelize');
const sequelize = require('./sequelize');
const { munge } = require('./munge');

const modelName = 'field_data';

class fieldData extends Model {}

fieldData.init(
  {
    user_id: DataTypes.STRING,
    fld: DataTypes.STRING,
    value: DataTypes.TEXT,
  }, {
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'fld']
      }
    ],
    sequelize,
    modelName
  }
);

fieldData.get_local_storage = async (res, fld) => {
  const data = await fieldData.findOne({
    where: { user_id: res.locals.user.id, fld }
  });
  return data?.dataValues?.value || '[]';
}

fieldData.update_field_storage = async (res, fld, value) => {
  // TODO: optimize update on change
  await fieldData.upsert({
    user_id: res.locals.user.id,
    fld: fld,
    value: munge(value, true),
  });
}

module.exports = fieldData
