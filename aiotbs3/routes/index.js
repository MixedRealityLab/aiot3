var express = require('express');
var router = express.Router();
var request = require('request');


var Product = require('../data_models/products');


/* GET home page. */
//router.get('/',ensureAuthenticated, function(req, res, next){ // this authentication fail :(
router.get('/' ,function(req, res, next) {
    //res.render('index', { username: req.body.username, success: req.session.success, errors: req.session.errors });
    res.render('index', { username: req.body.username, success: 'success', errors: req.session.errors, messageItem : 0 });

    //if (!req.session.success)
    //res.redirect('login');
    //res.redirect('/users/login');
    //req.session.success = false;
    req.session.errors = null;
    //res.redirect('login');


});


/*  PRODUCTS  */
//check if the basic data of a product is on db
router.post('/checkBarcode', function (req,res, next) {
    var codeProduct = req.body.codeProduct;
    console.log('Im here with code:'+ codeProduct );
    var eanCode = Product.getProductByEan(codeProduct);


    console.log(eanCode.status);

    if(eanCode.status == 'success'){
        //if the code is in the db, add new code to db and return to 'added item' view without require data from user
        //send description to render view
        var description = eanCode.data.description;
        console.log(codeProduct);
        var addNewProduct = Product.addNewProduct(codeProduct,eanCode.data);
        console.log('status:' + addNewProduct.status + ' message:'+ addNewProduct.error_message);
        res.render('checkBarcode',{messageItem : 1});
    }
    else {
        // if the code isn't in the db, load tesco api to get data
        //var data = connectTesco(eanSelected); // to connect tesco api and get data
        res.render('checkBarcode',{messageItem : 2});
    }

    //res.render('index', {username: req.body.username, success: req.session.success, errors: req.session.errors });
    //res.redirect('/#scanIn'); //http://localhost:3000/#scanIn

});





router.post('/insertProduct', function (req,res,next) {

});

router.post('/deleteProduct', function (req,res,next) {

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
    //res.redirect('wizard#step-6');
    res.redirect('/#scanIn');
});

/* GET New wizard page. */
router.get('/wizard', function(req, res,next) {
    res.render('wizard');
});

router.get('/barcodeScanner', function(req, res) {
    res.render('barcodeScanner');
});

router.get('/webScanner', function(req, res) {
    res.render('webScanner');
});


//******************** functions **************************

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        res.render('index', { username: req.session.username, success: req.session.success, errors: req.session.errors });
        //res.redirect('/users/login');
        return next();
    } else {
        //req.flash('error_msg','You are not logged in');
        res.redirect('/users/login');
    }
}

/* function to connect and consume TESCO API. */


function connectTesco(eanSelected){

    eanSelected1 = '0'+ eanSelected;
    var options = {
        method: 'GET',
        hostname: 'dev.tescolabs.com',
        //url: 'https://dev.tescolabs.com/product/?gtin=04548736003446', //05022996000135',
        url: 'https://dev.tescolabs.com/product/?gtin='+eanSelected1, //05022996000135',
        headers: {
            'Ocp-Apim-Subscription-Key': 'd00f3cbe704e4aec8aa8fb91b94d43f0'
        },
        rejectUnauthorized: false
    };

    request(options, function (error, response, body) {
        if (!error) {
            console.log('*statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //var productsTesco = JSON.parse(body);
            var productsTesco = body;
            console.log('** product details:**'+productsTesco);
            if (Object.keys(productsTesco).length==22) {
                //console.log('valor nulo');
                var jsonObj = { 'products': [ { 'description': 'N/A', 'brand': 'N/A' } ] };
                var jsonObj = JSON.stringify(jsonObj);
                console.log(jsonObj);
                //storeData2(eanSelected,jsonObj,req,res);
                storeData(eanSelected,jsonObj); // this store data needs to connect with db

            }else{
                //storeData2(eanSelected,body,req,res);
                storeData(eanSelected,body);
            }
            //console.log('valor:'+Object.keys(productsTesco).length);


        }else{
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            var jsonObj = { 'products': [ { 'description': 'N/IC', 'brand': 'N/A' } ] };
            var jsonObj = JSON.stringify(jsonObj);
            storeData(eanSelected,jsonObj); /* store data when internet connection is not available*/
            console.log('body:', body);
            return false;

        }

    });
}


/* function to store data into mysql collection .*/
function storeData(eancode,jsonBody) {
    //connect this with mysql data_models

    /*var eanCode = eancode;
    var eanCollection = db.get('eanCollection');
    var collectionDocument = JSON.parse(jsonBody);
    console.log('**collection body' + collectionDocument);
    var dataCollection = {
        "codenumber": eanCode,
        "codetype": 'EAN-13',
        "timestamp": [new Date()], // original
        //"timestamp": [new ISODate()],
        "products": collectionDocument.products[0]
    };*/
}

module.exports = router;
