const { sequelize, DataTypes } = require('./index');

const field_data = sequelize.define(
  'field_data', {
    user_id: DataTypes.STRING,
    fld: DataTypes.STRING,
    value: DataTypes.TEXT,
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'fld']
      }
    ]
  }
);

(async ()=>{
  await field_data.sync();
});

module.exports = field_data
