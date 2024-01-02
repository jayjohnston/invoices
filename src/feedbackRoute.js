const router = require('express').Router();
const liame = require('./lib/liame');
const { td, format_ymdhis } = require('./dates.js');
const { GOOGLE_RECAPTCHA_CLIENT, GOOGLE_RECAPTCHA_SECRET } = require('./.env');
const { promisify } = require('util');
const request = promisify(require('request'));

router.get('/feedback', async function(req, res) {
  const title = 'Invoice: Feedback';
  const style_files = ['/feedback.css', '/style.css'];
  const js_files = ['/feedback.js'];
  res.render('feedback', { title, style_files, js_files, GOOGLE_RECAPTCHA_CLIENT });
});

const requireRecaptcha = async (req, res, next) => {
  if (typeof req.body.msg == 'undefined' || req.body.msg == '') {
    res.redirect('/feedback');
    return;
  }
  const token = req.body.token;

  const options = {
    url: `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCHA_SECRET}&response=${token}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'json': true }
  }
  try {
    const re = await request(options);
    const success = JSON.parse(re.body)['success'];
    if (success === true) {
      next();
      return;
    }
    res.redirect('/feedback');
    return;
  } catch (e) {

    // TODO: we should provide an error
    // but for now i doubt humans could
    // could get an error while hackers
    // would benefit from that feedback
    res.redirect('/feedback');
    return;
  }
};

router.post('/feedbackp', requireRecaptcha, async function(req, res) {
  const title = 'Invoice: Feedback Received';
  const style_files = ['/feedback.css', '/style.css'];

  let message = req.body.msg;
  message = message.replace(/[\u00A0-\u9999<>\&]/g, i => '&#'+i.charCodeAt(0)+';');
  message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');
  message += '<br><hr>' + format_ymdhis(td);

  const out = await liame('Invoices Feedback Form', message);

  res.render('feedback_thankyou', { title, style_files });
});

module.exports = router;
