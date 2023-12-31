const router = require('express').Router();

router.get('/terms-of-service', async function(req, res) {
  const title = 'Invoice: Terms of Service';
  const style_files = ['/style.css'];
  res.render('tos', { title, style_files });
});

module.exports = router;
