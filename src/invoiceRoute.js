const router = require('express').Router();
const wkhtmltopdf = require('wkhtmltopdf');

const { field_data, invoice_data } = require('./model/db');

const { demunge } = require('./model/munge');
const { fields, functions } = require('./fields');
const { td, dd, vali_date, diff_dates } = require('./dates.js');

router.post('/invoice', async function(req, res) {
  show_invoice(req, res);
});

router.get('/invoice/:id', async function(req, res) {
  const invoice = await invoice_data.get_invoice(res, req.params.id);
  if (invoice === null) {
    res.redirect('/invoices');
  } else {
    req.body = demunge(invoice.value, true);
    req.body.id = req.params.id;
    show_invoice(req, res, null);
  }
});

router.get('/invoice/print/:id', async function(req, res) {
  const invoice = await invoice_data.get_invoice(res, req.params.id);
  if (invoice === null) {
    res.redirect('/invoices');
  } else {
    req.body = demunge(invoice.value, true);
    req.body.id = req.params.id;
    show_invoice(req, res, async (err, html) => {
      if (err) {
        console.error('Error printing invoice '+req.params.id, err);
        res.send('error?! have website admin check the logs...');
        return;
      }

      wkhtmltopdf(html).pipe(res);
    });
  }
});

const show_invoice = async (req, res, cb) => {
  const title = 'Invoice: View/Print';
  const style_files = ['/invoice.css', '/style.css'];

  if (req.body.invoice_number == '') {
    const invoice_count = await invoice_data.get_invoice_count(res);
    req.body.invoice_number = 100 + parseInt(invoice_count);
  }

  const id = req.body.id || null;
  const invoice_id = await invoice_data.update_invoice_storage(id, res, req.body);

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

  await field_data.update_field_storage(res, 'check_to', data.check_to);
  await field_data.update_field_storage(res, 'venmo_to', data.venmo_to);
  await field_data.update_field_storage(res, 'paypal_to', data.paypal_to);
  await field_data.update_field_storage(res, 'zelle_to', data.zelle_to);

  // calculate the due date difference
  const date = vali_date(data.date, td);
  const due_date = vali_date(data.due_date, dd);
  const diff = diff_dates(date, due_date);
  await field_data.update_field_storage(res, 'due_date_diff', diff);

  items.map((item, i) => {
    const rate = item.rate || 0;
    const quantity = item.quantity || 0;
    const amount = parseFloat(quantity) * parseFloat(rate);
    items[i]['quantity'] = parseFloat(quantity).toFixed(2);
    items[i]['amount'] = parseFloat(amount).toFixed(2);
    items[i]['rate'] = parseFloat(rate).toFixed(2);
    total = parseFloat(total) + parseFloat(amount);
    total = parseFloat(total).toFixed(2);
  });

  data.items = items;
  data.total = total;

  const view_config = { data, ...functions, style_files, title, invoice_id };

  res.render('invoice', view_config, cb);
}

module.exports = router;
