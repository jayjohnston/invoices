const router = require('express').Router();

const { Sequelize } = require('sequelize');
const field_data = require('./model/field_data');
const invoice_data = require('./model/invoice_data');

const { munge } = require('./model/munge');
const { fields, functions } = require('./fields');
const { td, dd, vali_date, diff_dates } = require('./dates.js');

router.post('/invoice', async function(req, res) {
  const title = 'Invoice: View/Print';
  const style_files = ['/invoice.css', '/style.css'];

  if (req.body.invoice_number == '') {
    const invoice_count = await get_invoice_count(res);
    req.body.invoice_number = 100 + parseInt(invoice_count);
  }

  const id = req.body.id || null;
  await update_invoice_storage(id, res, req.body);

  let data = {};
  let items = [];
  let total = parseFloat(0);
  fields.map(fld => {
    if (!!req.body[fld.name]) {
      if (fld.multi == 'items') {
        req.body[fld.name].map((item, i) => {
          switch (fld.name) {
            case 'item':
              const obj = {'item': item};
              items.push(obj);
            default:
              items[i][fld.name] = item;
          }
        });
      } else {
        data[fld.name] = req.body[fld.name]
      }
    }
  });

  await update_field_storage('check_to', res, data.check_to);
  await update_field_storage('venmo_to', res, data.venmo_to);
  await update_field_storage('paypal_to', res, data.paypal_to);
  await update_field_storage('zelle_to', res, data.zelle_to);

  // calculate the due date difference
  const date = vali_date(data.date, td);
  const due_date = vali_date(data.due_date, dd);
  const diff = diff_dates(date, due_date);
  await update_field_storage('due_date_diff', res, diff);

  items.map((item, i) => {
    const rate = item.rate || 0;
    const quantity = item.quantity || 0;
    const amount = parseFloat(quantity) * parseFloat(rate);
    items[i]['quantity'] = parseFloat(quantity).toFixed(2);
    items[i]['amount'] = parseFloat(amount).toFixed(2);
    items[i]['rate'] = parseFloat(rate).toFixed(2);
    total = total + amount;
    total = total.toFixed(2);
  });

  data.items = items;
  data.total = total;

  const view_config = { data, ...functions, style_files, title };

  res.render('invoice', view_config);
});

async function get_invoice_count(res) {
  const data = await invoice_data.findOne({
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

async function update_invoice_storage(id, res, value) {
  await invoice_data.upsert({
    id,
    user_id: res.locals.user.id,
    value: munge(value, true),
  });
}

async function update_field_storage(fld, res, value) {
  // store user id, field, and value
  // TODO: optimize update on change
  await field_data.upsert({
    user_id: res.locals.user.id,
    fld: fld,
    value: munge(value, true),
  });
}

module.exports = router;
