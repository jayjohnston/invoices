const router = require('express').Router();
const { field_data, invoice_data } = require('./model/db');
const { demunge } = require('./model/munge');
let { fields } = require('./fields');
const { td, format_date } = require('./dates.js');

router.get('/', async function(req, res) {
  let fields_final = [];
  let fields_copy = fields;

  // each user should have a set of "send payment" values
  // that are copied in for them on each new invoice load
  const custom_fields = ['check_to', 'venmo_to', 'paypal_to', 'zelle_to', 'due_date_diff'];
  const all = custom_fields.map(fld => {
    return field_data.get_local_storage(res, fld);
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
  build_invoice(req, res, fields_final);
});

router.get('/build/:id', async function(req, res) {
  let fields_final = [];
  let fields_copy = fields;

  const invoice = await invoice_data.get_invoice(res, req.params.id);
  if (invoice === null) {
    res.redirect('/build');
  } else {
    const data = demunge(invoice.value, true);
    const invoice_id = data.id;

    // TODOoooooooo!!!
    // fix this case-and-paste nightmare
    const grpflds = ['item', 'description', 'quantity', 'rate'];
    fields_copy.map((fld, x) => {

      if (fld.name == 'check_to' && data.check_to.length > 0) {

	data.check_to.map((val, i) => {
	  const newfld = update_fld(fld, val, i);
	  fields_final.push(newfld);
	});
      } else if (fld.name == 'bill_to' && data.bill_to.length > 0) {

	data.bill_to.map((val, i) => {
	  const newfld = update_fld(fld, val, i);
	  fields_final.push(newfld);
	});
      } else if (fld.name == 'item' && data.item.length > 0) {

        // invoice line item grps
	data.item.map((val, i) => {
	  grpflds.map((grpfld, j) => {
            const grpval = data[grpfld][i];
	    const newfld = update_fld(fields[x + j], grpval, i);
	    fields_final.push(newfld);
          });
	});
      } else if (fld.name == 'date' && data.date.length > 0) {

	const newfld = update_fld(fld, data.date[0], 0);
	fields_final.push(newfld);
      } else if (fld.name == 'due_date') {

	const newfld = update_fld(fld, data.due_date[0], 0);
	fields_final.push(newfld);
      } else if (fld.name == 'venmo_to') {

	const newfld = update_fld(fld, data.venmo_to[0], 0);
	fields_final.push(newfld);
      } else if (fld.name == 'paypal_to') {

	const newfld = update_fld(fld, data.paypal_to[0], 0);
	fields_final.push(newfld);
      } else if (fld.name == 'zelle_to') {

	const newfld = update_fld(fld, data.zelle_to[0], 0);
	fields_final.push(newfld);
      } else if (fld.name == 'invoice_number') {

	const newfld = update_fld(fld, data.invoice_number, 0);
	fields_final.push(newfld);
      } else if (fld.name == 'po_number') {

	const newfld = update_fld(fld, data.po_number, 0);
	fields_final.push(newfld);
      } else {

	// all other fields need to be added unless in line item billing
        if (grpflds.indexOf(fld.name) === -1) {
	  fields_final.push(fld);
        }
      }
    });

    build_invoice(req, res, fields_final, invoice_id);
  }
});

const build_invoice = async (req, res, fields, invoice_id) => {
  const title = 'Invoice: Data Entry';
  const style_files = ['/build.css', '/style.css'];
  const js_files = ['/build.js'];

  res.render('build', { fields, style_files, js_files, title, invoice_id });
}

function update_fld(fld, val, i) {
  // prevent reference obj updates with a new obj
  const newfld = Object.create(fld);

  // sending clone stops jQuery from cloning this
  // when clicking a group's "add new row" button
  if (i !== 0) newfld.clone = 'clone';

  newfld.value = val;
  return newfld;
}

module.exports = router;
