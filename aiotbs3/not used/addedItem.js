var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('added item');
  //res.render('newEan', { title: 'Add New EAN' });
});

module.exports = router;