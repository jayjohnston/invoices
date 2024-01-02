const router = require('express').Router();

const { invoice_data } = require('./model/db');

router.get('/invoices', async function(req, res) {
  const title = 'Invoice: List History';
  const style_files = ['/style.css'];

  const list = await get_invoice_history(res);

  const view_config = { list, style_files, title };

  res.render('list', view_config);
});

async function get_invoice_history(res) {
  const out = await invoice_data.findAll({
    where: { user_id: res.locals.user.id },
    order: [ [ 'id', 'DESC' ] ]
  });
  let data = [];
  out.map(row => {
    const id = row.dataValues.id;
    let invoice_number = row.dataValues.invoice_number;
    if (invoice_number === null || invoice_number === '') {
      invoice_number = id;
    }
    data.push({ id, invoice_number });
  });
  return data;
}

module.exports = router;
