const nodemailer = require('nodemailer');
const { DOMAIN, CONTACT_FROM: from, CONTACT_TO: to } = require('../.env');

module.exports = async (subject, html) => {
  let out = '';
  if (DOMAIN.indexOf('localhost') >= 0) {
    return 'ok';
  }
  const transporter = nodemailer.createTransport({
    sendmail: true,
    newline: 'unix',
    path: '/usr/sbin/sendmail'
  });
  try {
    await transporter.sendMail(
      { from,  to, subject, html },
      (err, info) => {
        if (err) {
          out = err.toString();
        } else {
          //info has envelope and messageId
          out = 'ok';
        }
      }
    );
  } catch(e) {
    out = e.toString();
  }
  return out;
};
