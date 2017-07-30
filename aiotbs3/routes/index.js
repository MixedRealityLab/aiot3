var express = require('express');
var router = express.Router();


/* GET home page. */
//router.get('/',ensureAuthenticated, function(req, res, next)
router.get('/',ensureAuthenticated ,function(req, res, next) {
    res.header('Cache-Control', 'no-cache');
    res.render('index', { username: req.body.username, success: req.session.success, errors: req.session.errors });
    //if (!req.session.success)
    //res.redirect('login');
    //res.redirect('/users/login');
    //req.session.success = false;
    req.session.errors = null;
    //res.redirect('login');
    var nn= req.session.success;
    console.log('***' +  nn);


});


/* GET User page */




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
    res.redirect('wizard#step-6');
});

/* GET New wizard page. */
router.get('/wizard', function(req, res,next) {
    //res.render('wizard',{success: req.session.success, errors: req.session.errors});
    //req.session.errors = null;
    res.render('wizard');
});

router.get('/barcodeScanner', function(req, res) {
    res.render('barcodeScanner');
});

router.get('/webScanner', function(req, res) {
    res.render('webScanner');
});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        //res.render('index', { username: 'logeado', success: req.session.success, errors: req.session.errors });
        //res.redirect('/users/login');
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}


module.exports = router;
