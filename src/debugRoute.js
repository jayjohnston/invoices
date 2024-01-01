const router = require('express').Router();
const { field_data, invoice_data } = require('./model/db');

router.get('/debug', async function(req, res) {
  const data = await field_data.findAll({
    where: { user_id: res.locals.user.id }
  });
  res.send(data);
});

router.get('/debug/invoices', async function(req, res) {
  const data = await invoice_data.findAll({
    where: { user_id: res.locals.user.id }
  });
  res.send(data);
});

module.exports = router;
