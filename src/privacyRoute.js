const router = require('express').Router();

router.get('/privacy-policy', async function(req, res) {
  const title = 'Invoice: Privacy Policy';
  const style_files = ['/style.css'];
  res.render('privacy', { title, style_files });
});

module.exports = router;
