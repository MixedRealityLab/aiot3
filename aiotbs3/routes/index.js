var express = require('express');
var router = express.Router();
var request = require('request');
var sleep = require('sleep');

var Product = require('../data_models/products');
var Inventory = require('../data_models/inventory');


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

//after scan, check if the basic data of a product is on db
router.post('/checkBarcode', function (req,res, next) {
    sleep.msleep(5000);
    var codeProduct = req.body.codeProduct;
    var eanCode = Product.getProductByEan(codeProduct);
    var userInventory = getInventoryUser(1); //get last 5 products from user=1 and send them back to inserted products
    console.log(eanCode.status);

    if(eanCode.status == 'success'){
        //if the code is in the products, add new code to inventory
        //and render /insertProduct view without require data from user
        //send description and user inventory to render view
        var description = eanCode.data.description;
        var addNewProduct = Product.addNewProduct(codeProduct,eanCode.data); // add new product to the global db
        console.log('status:' + addNewProduct.status + ' message:'+ addNewProduct.error_message);

        res.render('insertProduct',{messageItem : 3, description: description, userInventory: userInventory});
    }
    else {
        // if the code isn't in the db, load tesco api to get data first
        // if I get data from tesco then add information to global db and inventory
            // then render /insertProduct view with messageItem : 3
        // if data is not available from tesco api
            // then go to checkBarcode with messageItem : 2
        //var data = connectTesco(eanSelected); // to connect tesco api and get data


        res.render('checkBarcode',{messageItem : 2, eancode: codeProduct, userInventory: userInventory});
    }

});



router.post('/insertProduct', function (req,res,next) {
    //Post unknown item details to global product database
    var addNewProduct = Product.addNewProduct(req.body.productEan,req.body);
    var description = req.body.productDescription;
    console.log(addNewProduct.status); //we will add into the global? inventory or both?

    //get last 5 products from user=1 and send them back to inserted products
    var userInventory = getInventoryUser(1);

    if(addNewProduct.status){
        //update stock level

        res.render('insertProduct',{messageItem : 3, description: description, userInventory: userInventory});
    }
    else{
        console.log('error'); // design a render view for this??
    }
});



router.post('/scanOutProduct',function (req,res,next) {
    sleep.msleep(4000); //this is for show the barcode scanned
    console.log(req.body);
    var eanProduct= req.body.codeProductOut;

    //var eanCode = Inventory.getProductForUser(1);
    //if(eanCode.status == 'success'){ //if barcode is on inventory

    var inventoryForUser = Inventory.getProductForUser(1,eanProduct); //if barcode is on user inventory
    if (inventoryForUser.status == 'sucess'){ //barcode on user inventory
        //get stock level and product details from user inventory
        var producDetails = Product.getProductByEan(eanProduct);
        //var stock_level = Inventory.



        //res.render('scanningOutProduct', )
    }
    //get code from scanout
    //if barcode is on inventory
        //get stock level and product details from user inventory
        //ask about stock level to confirm
        //Ask user if item was “used up or wasted” - where store in the model
        //Confirm item details and new inventory stock level
        // (inventory means the households local listing of items)
        //Update inventory (same method as scan in)
        //then render scannedOutProduct view

    //if barcode is not in the inventory
        //do something
        //render to scannedOutProduct with message 1


    console.log('scanning out code:'+ eanProduct);
    res.render('scannedOutProduct',{messageScanOut:0, eanProduct:eanProduct});

});



//******************* NOT FOR NOW **********************************************
router.post('/scanAgain', function (req,res,next) {
    //this is just for render again scan in process
    console.log('ready to scan in again');
    res.render('scanAgain',{messageItem: 3});

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

//function to retrieve product inventory listing if exists for user

function getInventoryUser(user){
    var lastInventory = Inventory.getProductsForUser(user);
    //console.log(lastInventory["data"]);
    lastInventory = lastInventory["data"];
    return lastInventory;
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
