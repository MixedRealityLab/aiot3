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
    var userId=1;
    sleep.msleep(5000);
    var codeProduct = req.body.codeProduct; //barcode from client side
    var eanCode = Product.getProductByEan(codeProduct);
    var userInventory = getInventoryUser(userId); //get all products from user=1 and send them back to inserted products
    console.log(eanCode.status);

    if(eanCode.status == 'success'){ //if barcode is in product db
        //add product to the user inventory (where)
        //update the inventory stock(I don't need to update product data)
        var description = eanCode.data.description;
        res.render('insertProduct',{messageItem : 3, description: description, userInventory: userInventory});
    }
    else { //the barcode isn't the product database

        connectTesco(codeProduct, function(response){  //look at tesco API
            // Here you have access to your variable
            var tescoApiData =  response;
            //console.log(tescoApiData.status);
            //console.log(tescoApiData.data.description);
            console.log(tescoApiData);


            if (tescoApiData.status == 'success'){
                // add data to the product db
                var addNewProduct = Product.addNewProduct(codeProduct, tescoApiData.data);
                if(addNewProduct.status == 'success'){ // if product was succesfully added to the global db then upgrade inventory

                    // add the product to the user inventory
                    //**** USE in_events ???? *****
                    var updateInventoryUser = updateInventory(userId,codeProduct);
                    if(updateInventoryUser.status == 'success'){
                        // render to add item view
                        var description = tescoApiData.data.description.substring(0,25);
                        // then render view /insertProduct view with messageItem : 3
                        res.render('insertProduct',{messageItem : 3, description: description, userInventory: userInventory});

                    }
                    else{
                        res.render('error',{errorMessage:updateInventoryUser.msg});
                    }


                }
                else{
                    res.render('error',{errorMessage:addNewProduct.error_message});
                }

            }

            else{ //the barcode isn't in tesco api
                //ask user for basic data
                //go to item_data view
                //item_data view will submit to insert data function
                res.render('checkBarcode',{messageItem : 2, eancode: codeProduct, userInventory: userInventory});


            }
        });
    }

});


//checkbarcode logic
//get barcode
//if the barcode in the product db
    //add the product to the user inventory
    //update the inventory
    //render to add item view
//else (the barcode isn't the product database)
    //if the barcode is in tesco api?
        //get data from tesco api
        //add data to the product db
        //add the product to the user inventory
        //update the inventory
        //render to add item view
    //else (the barcode isn't in tesco api)
        //render to checkBarcode view
        //ask user for basic data
        //store data in product db
        //update user inventory
        //render added item view


//insert in the inventory and render to item added view
router.post('/insertProduct', function (req,res,next) {
    //user id
    var userId = 1;
    //Post unknown item details to global product database
    var eanCode = req.body.productEan; // scanned barcode
    var addNewProduct = Product.addNewProduct(req.body.productEan,req.body);
    var description = req.body.productDescription;
    console.log(addNewProduct.status); //we will add into the global? inventory or both?

    //get last 5 products from user=1 and send them back to render view of inserted products
    var userInventory = getInventoryUser(userId);

    if(addNewProduct.status){
        //update stock level using Inventory.updateProductForUser
        var getStockLevel =  Inventory.getProductForUser(userId,eanCode);
        var newStockLevel = getStockLevel +1 ;
        var updateInventoryUser = Inventory.updateProductForUser(userId,eanCode,newStockLevel);
        console.log('Inventory updated to:'+ updateInventoryUser);
        res.render('insertProduct',{messageItem : 3, description: description, userInventory: userInventory});
    }
    else{
        console.log('error'); // design a render view for this??
    }
});


//**** scan out logic *******
//get barcode from scanout
//if barcode is on user inventory
    //get stock level and products details from user inventory
    //ask about stock level to confirm
    //Ask user if item was “used up or wasted” - where store in the model
    //Confirm item details and new inventory stock level
    // (inventory means the households local listing of items)
    //update stock_level (-1)
    //then render scannedOutProduct view
//else if barcode isn't on user inventory
    //do something
    //render to scannedOutProduct with message 1



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



    console.log('scanning out code:'+ eanProduct);
    res.render('scannedOutProduct',{messageScanOut:0, eanProduct:eanProduct});

});



//******************************** NOT USED FOR NOW **********************************************

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
//************************************************************************************************



//************************************ functions *************************************************

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
    //this function retrieve all inventory from a specific user
    //fix to sent just the 5 most recent
    var lastInventory = Inventory.getProductsForUser(user);
    lastInventory = lastInventory["data"];
    return lastInventory;
}


function updateInventory(userId,eanCode){
    // update the inventory
    var getStockLevel =  Inventory.getProductForUser(userId,eanCode);
    var newStockLevel = getStockLevel +1 ;
    var updateInventoryUser = Inventory.updateProductForUser(userId,eanCode,newStockLevel);
    console.log('Inventory updated to:'+ updateInventoryUser);
    if (updateInventoryUser.status){

        return({"status": "success", "data":updateInventoryUser.data });

    }
    else{
        return({"status": "fail", "msg":updateInventoryUser.error_message });
    }

}



/* function to connect and consume TESCO API. */
function connectTesco(eanSelected,callback){

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
            //console.log('** product details:**'+productsTesco);

            if (Object.keys(productsTesco).length==22) { // if I don't get information from tesco API

                var returnData= {"status": 'fail', "msg":'no internet connection'};
                return callback(returnData);

            }else{

                //console.log(body);
                var returnData = JSON.parse(body);
                //console.log('just return***'+returnData);
                //console.log('just data:***'+returnData["products"][0]["description"]);
                //console.log('quantity:***'+returnData["products"][0]["qtyContents"].quantity);

                var dataCollection = {
                        "status": 'success',
                        "data": {
                            ean: eanSelected,
                            tpnb:returnData["products"][0]["tpnb"],
                            tpnc:returnData["products"][0]["tpnc"],
                            brand_name:returnData["products"][0]["brand"],
                            description:returnData["products"][0]["description"],
                            quantity: returnData["products"][0]["qtyContents"].quantity,
                            quanitiy_unit: returnData["products"][0]["qtyContents"].quantityUom,
                            netContent: returnData["products"][0]["qtyContents"].netContents
                            }


                    };

               return callback(dataCollection);


            }


        }else{
            console.log('error:', error);
            console.log('statusCode:', response && response.statusCode);
            var returnData= {"status": 'api fail', "msg":'no internet connection'};
            return callback(returnData);

        }


    });

}



module.exports = router;
