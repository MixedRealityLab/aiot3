var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* POST to adding minimum data from unknown items */
router.post('/addUnknownItem', function(req, res) {
    // Set our internal DB variable
    //var db = req.db;
    //var eanCode = req.body.eancode;
    //var collection = db.get('eanCollection');
    //var eanSelected = eanCode;//'0'+ eanCode;
    //var collectionDocument = connectTesco(eanSelected);
    console.log('added_item *** added_item');
    //res.render('wizard#step-5');
    res.redirect('wizard#step-5');
});

/* GET New wizard page. */
router.get('/wizard', function(req, res) {
    res.render('wizard');
});

module.exports = router;
