const router = require('express').Router();

router.get('/login', async function(req, res) {
  const title = 'Invoice: Login';
  const style_files = ['/login.css', '/style.css'];

  res.render('login', { style_files, title });
});

module.exports = router;
