var express = require('express');
var router = express.Router();

/* GET In Stock listing. */
router.get('/', function(req, res, next) {
  //res.send('IN STOCK DATA');
  res.render('instock');
  
});

module.exports = router;
