var express = require('express');
var router = express.Router();
var request = require('request');
var sleep = require('sleep');

var Product = require('../data_models/products');
var Inventory = require('../data_models/inventory');
var InEvent = require('../data_models/in_events');
var OutEvent = require('../data_models/out_events');



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
    var eanCodeProducts = Product.getProductByEan(codeProduct);
    var userInventory = getInventoryUser(userId); //get all products from user=1 and send them back to inserted products

    if(eanCodeProducts.status == 'success'){ //if barcode is in product db
        var eanCode = eanCodeProducts.data.EAN;

        //****** update inventory using  Inventory.updateInventoryListingStock and In_event.add_event ******************
        //update the inventory stock(I don't need to update product data)
        var userInventoryUpdated =updateInventory2(userId,eanCode);
        console.log('userInventoryUpdated:'+ userInventoryUpdated.status);
        //**************************************************************************************************************

        if (userInventoryUpdated.status == 'success') {
            var description = eanCodeProducts.data.description;
            res.render('insertProduct', {messageItem: 3, description: description, userInventory: userInventory});
        }
        else{
            res.render('insertProduct', {messageItem: 3, description: 'something wrong', userInventory: userInventory});
        }
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

                    //****** update inventory **************************************************************************
                    // add the product to the user inventory
                    var userInventoryUpdated = updateInventory2(userId,codeProduct);
                    console.log('***check***'+userInventoryUpdated.status + ':'+userInventoryUpdated.msg);
                    //**************************************************************************************************


                    if(userInventoryUpdated.status == 'success'){
                        // render to add item view
                        var description = tescoApiData.data.description.substring(0,25);
                        // then render view /insertProduct view with messageItem : 3
                        res.render('insertProduct',{messageItem : 3, description: description, userInventory: userInventory});

                    }
                    else{
                        res.render('insertProduct',{messageItem : 3, description: userInventoryUpdated.msg, userInventory: userInventory});

                    }


                }
                else{
                    res.render('insertProduct',{messageItem : 3, description: addNewProduct.error_message, userInventory: userInventory});

                    //res.render('error',{errorMessage:addNewProduct.error_message});
                }

            }

            else{ //the barcode isn't in tesco api
                //ask user for basic data using item_data view
                //item_data view will submit to /insertProduct
                res.render('checkBarcode',{messageItem : 2, eancode: codeProduct, userInventory: userInventory});


            }
        });
    }

});

//**************************************************************************************************
function updateInventory2(userId,eanCode){ //add item-using scan In
    console.log('user Id:'+ userId);
    console.log('ean:'+eanCode);

    var inventoryList = Inventory.getInventoryListing(userId,eanCode); // get inventory listing
    console.log('***inventory listing:***'+ inventoryList.status);

        if (inventoryList.status=='success') // there is an inventory listing known
        {
            var inventoryId =  inventoryList.data.inventory_id;    //get inventory id
            var getStockLevel = inventoryList.data.stock_level;    //get actual stock level
            var newStockLevel = getStockLevel + 1;                 //create new stock level
            var updateInventoryListing = Inventory.updateInventoryListingStock(inventoryId,newStockLevel); //update inventory listing
            var addToInventory = InEvent.add_event(inventoryId,getStockLevel,newStockLevel); //add to inventory
            console.log('**addToInventory**'+addToInventory.status);

            if (updateInventoryListing.status == 'success' && addToInventory.status == 'success')
            {
                return ({"status": "success"});

            }
            else
            {
                return ({"status": "fail", "msg":addToInventory.error_message});

            }

        }
        else
        {
            //else if the product exists but there is no inventory listing for it
            var newInventoryList = Inventory.addNewInventoryListing(userId,eanCode);

            if (newInventoryList.status == 'success')
            {
                var inventoryId = newInventoryList.data.inventory_id;
                var getStockLevel = 0;    //get actual stock level
                var newStockLevel = newInventoryList.data.stock_level;
                var updateInventoryListing = Inventory.updateInventoryListingStock(inventoryId,newStockLevel); //update inventory listing
                var addToInventory = InEvent.add_event(inventoryId,getStockLevel,newStockLevel); //add to inventory
                if (updateInventoryListing.status == 'success' && addToInventory.status == 'success')
                {
                    return ({"status": "success"})
                }
                else
                {
                    return ({"status": "fail", "msg":addToInventory.error_message});
                }
            }
            else
            {
                return ({"status": "fail", "msg":newInventoryList.error_message});

            }


        }
}
//**************************************************************************************************

//checkbarcode logic (just for scan in process)
//get barcode
//if the barcode is in the product/global db
    //if there is inventory listing known
        //get inventory_id from Inventory.getInventoryListing
        //get old and new stock level
        //add the product to the user inventory listing
        //use In_event.add_event to update the inventory(+1) (stock level)
        //render to add item view
    //else if the product exists but there is no inventory listing for it
        //make an inventory list Inventory.addNewInventoryListing using barcode and userId
        //get the inventory id
        //get old and new stock level
        //update the stock level using Inventory.updateInventoryListingStock
        //use In_event.add_event to update the inventory(+1) (stock level)
        //render to add item view

//else (the barcode isn't the product database/ the product does not exist at all)
    //if the barcode is in tesco api?
        //get data from tesco api
        //Use Product.addNewProduct to add the product to the global database
        //make an inventory list Inventory.addNewInventoryListing using barcode and userId
        //get the inventory id
        //get old and new stock level
        //update the stock level using Inventory.updateInventoryListingStock
        //use In_event.add_event to update the inventory(+1) (stock level)
        //render to add item view
    //else (the barcode isn't in tesco api)
        //render to checkBarcode view
        //ask user for basic data
        //Use Product.addNewProduct to add the product to the global database
        //make an inventory list Inventory.addNewInventoryListing using barcode and userId
        //get the inventory id
        //get old and new stock level
        //update the stock level using Inventory.updateInventoryListingStock
        //use In_event.add_event to update the inventory(+1) (stock level)
        //render added item view





//insert in the inventory and render to item added view
router.post('/insertProduct', function (req,res,next) {
    var userId = 1;
    //Post unknown item details to global product database
    var eanCode = req.body.productEan; // scanned barcode
    var addNewProduct = Product.addNewProduct(req.body.productEan,req.body);
    var description = req.body.productDescription;
    console.log(addNewProduct.status); //we will add into the global? inventory or both?
    console.log(addNewProduct.message);

    //get last 5 products from user=1 and send them back to render view of inserted products
    var userInventory = getInventoryUser(userId);

    if(addNewProduct.status){

        //After add new product to db, update inventory
        //****** update inventory **************************************************************************
            var userInventoryUpdated = updateInventory2(userId,eanCode);
            console.log('***check***'+userInventoryUpdated.status + ':'+userInventoryUpdated.msg);

        //**************************************************************************************************
        if(userInventoryUpdated.status == 'success'){
            res.render('insertProduct',{messageItem : 3, description: description, userInventory: userInventory});

        }
        else{
            res.render('insertProduct',{messageItem : 3, description: userInventoryUpdated.msg, userInventory: userInventory});

        }

    }
    else{
        console.log('error'); // redirecting to added item view with error message
        res.render('insertProduct',{messageItem : 3, description: addNewProduct.error_message, userInventory: userInventory});

    }
});


//**** scan out logic *******
//get barcode from scanout view
//if barcode is on user inventory
    //get stock level and products details from user inventory
    //ask about stock level to confirm
    //Ask user if item was “used up or wasted” - where store in the model?
    //Confirm item details and new inventory stock level
    // (inventory means the households local listing of items)
    //update stock_level (-1)
    //then render scannedOutProduct view
//else if barcode isn't on user inventory
    //do something
    //render to scannedOutProduct with message 1






router.post('/scanOutProduct',function (req,res,next) {
    var userId=1;
    sleep.msleep(4000); //this is for show the barcode scanned
    console.log(req.body);
    var eanProduct= req.body.codeProductOut;

    //var eanCode = Inventory.getProductForUser(1);
    //if(eanCode.status == 'success'){ //if barcode is on inventory

    var inventoryForUser = Inventory.getProductForUser(userId,eanProduct); //if barcode is on user inventory
    if (inventoryForUser.status == 'success'){ //barcode on user inventory

        //get stock level and product details from user inventory
        var producDetails = Product.getProductByEan(eanProduct);
        //var stock_level = Inventory.
        //res.render('scanningOutProduct', )
        //ask about stock level to confirm
        //Ask user if item was “used up or wasted” - where store in the model
        //Confirm item details and new inventory stock level
        // (inventory means the households local listing of items)
        //update stock_level (-1)
        //then render scannedOutProduct view with messageScanOut=0
        res.render('scannedOutProduct',{messageScanOut:0, eanProduct:eanProduct});

    }
    else{ //if barcode isn't on user inventory
        //do something
        //render to scannedOutProduct with message 1
        res.render('scannedOutProduct',{messageScanOut:1, eanProduct:eanProduct});

    }


    console.log('scanning out code:'+ eanProduct);

});



router.post('/getInventoryData',function (req,res,next) {
    console.log(req.body);
    var userId=req.body.userId;
    var data = Inventory.getProductsForUser(userId);
    console.log(data);
    console.log('request by dataTable ajax');
    res.json(data);

});

router.post('/scanInAgain', function (req,res,next) {
    var userId = 1;
    //this is just for render again scan in process
    console.log('ready to scan in again');
    console.log('get data from user and send it back')
    //GET LAST 5 ITEMS AND SEND BACK TO INSERTPRODUCT VIEW
    var userInventory = getInventoryUser(userId);

    var data = {messageItem:4};
    res.send({messageItem:4, userInventory:userInventory});
    //res.send(userInventory);

});


//******************************** NOT USED FOR NOW **********************************************


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
    //this function retrieve 5 inventory from a specific user

    var lastInventory = InEvent.get_most_recent_for_user(user,5);
    lastInventory = lastInventory["data"];
    console.log('***last inventory:'+ lastInventory);
    return lastInventory;
}


function updateInventory(userId,eanCode){
    //update the inventory
    //var getStockLevel =  Inventory.getProductForUser(userId,eanCode);
    //var getStockLevel =  Inventory.getProductForUser(userId);
    var getInventory = Inventory.getInventoryListing(userId,eanCode);
    console.log(getInventory);
    var getStockLevel = getInventory.data.stock_level;
    var newStockLevel = getStockLevel +1 ;

    var inventoryData = Inventory.getInventoryListing(userId,eanCode);
    var inventoryId = inventoryData.data.inventory_id;
    //var updateInventoryUser = Inventory.updateProductForUser(userId,eanCode,newStockLevel);
    var updateInventoryUser = Inventory.updateInventoryListingStock(inventoryId, newStockLevel)
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
