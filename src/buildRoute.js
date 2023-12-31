const router = require('express').Router();
const field_data = require('./model/field_data');
const { demunge } = require('./model/munge');
let { fields } = require('./fields');
const { td, format_date } = require('./dates.js');

router.get('/', async function(req, res) {

  const title = 'Invoice: Data Entry';
  const style_files = ['/build.css', '/style.css'];
  const js_files = ['/build.js'];

  let fields_final = [];
  let fields_copy = fields;

  // each user should have a set of "send payment" values
  // that are copied in for them on each new invoice load
  const custom_fields = ['check_to', 'venmo_to', 'paypal_to', 'zelle_to', 'due_date_diff'];
  const all = custom_fields.map(fld => {
    return get_local_storage(res, fld);
  });
  const [
    check_to_vals,
    venmo_to_vals,
    paypal_to_vals,
    zelle_to_vals,
    due_date_diff
  ] = await Promise.all(all);

  fields_copy.map((fld, x) => {

    // TODO: devise a more elegant way to handle custom
    // data that is saved for each user (eg venmo info)
    if (fld.name == 'check_to' && check_to_vals != '[]') {

      demunge(check_to_vals, true).map((val, i) => {
        const newfld = update_fld(fld, val, i);
        fields_final.push(newfld);
      });
    } else if (fld.name == 'due_date' && due_date_diff != '[]') {

      let new_due_date = new Date();
      const diff = parseInt(demunge(due_date_diff, true));
      new_due_date.setDate(td.getDate() + diff);
      const newfld = update_fld(fld, format_date(new_due_date), 0);
      fields_final.push(newfld);
    } else if (fld.name == 'venmo_to') {

      const newfld = update_fld(fld, demunge(venmo_to_vals, true), 0);
      fields_final.push(newfld);
    } else if (fld.name == 'paypal_to') {

      const newfld = update_fld(fld, demunge(paypal_to_vals, true), 0);
      fields_final.push(newfld);
    } else if (fld.name == 'zelle_to') {

      const newfld = update_fld(fld, demunge(zelle_to_vals, true), 0);
      fields_final.push(newfld);
    } else {

      // all other fields need to be added in all cases
      fields_final.push(fld);
    }
  });
  res.render('build', { fields: fields_final, style_files, js_files, title });
});

function update_fld(fld, val, i) {
  // prevent reference obj updates with a new obj
  const newfld = Object.create(fld);

  // sending clone stops jQuery from cloning this
  // when clicking a group's "add new row" button
  if (i !== 0) newfld.clone = 'clone';

  newfld.value = val;
  return newfld;
}

async function get_local_storage(res, fld) {
  const data = await field_data.findOne({
    where: { user_id: res.locals.user.id, fld }
  });
  return data?.dataValues?.value || '[]';
}

module.exports = router;
