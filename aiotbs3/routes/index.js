var express = require('express');
var router = express.Router();
var request = require('request');
var sleep = require('sleep');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var moment = require('moment');


var products = require('../data_models/products');
var inventory = require('../data_models/inventory');
var inventory_product = require('../data_models/inventory_product.js');
var in_events = require('../data_models/in_events.js');
var out_events = require('../data_models/out_events');

var user = require('../data_models/user.js')
var tescoData = require("./tescoApi.js");


//***************************************** connecting passport ***********************************************************************
router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));

router.use(passport.initialize());
router.use(passport.session());

// Configure the local strategy for use by Passport.
passport.use(new LocalStrategy(
    function(username, password, done) {
        user.login(username, password, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            return done(null, user);
        });
    }
));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

//************************************************ GET home page *************************************************************
router.get('/', function(req, res, next){
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('index',{ user: req.user});
});


// *********************************************** scan in logic v2.0 *************************************************

//start with checkbarcode view

//get barcode/ean
//get userId
//if products.getProductByEan(ean,done) -- error  -->  the barcode isn't in the product table/the product does not exist at all)
    //go to tesco api function
    //if the barcode isn't in tesco api
        //render to checkBarcode view
        //ask user for basic data loading item_data view
        //go to add product process --> add inventory --> add in_event

    //else the barcode is in tesco api
        //get data from tesco api to create new product
        //use products.createNew to add the product to the global database
        //if products.createNew -- error
            //do something
        //else products.createNew -- success
            //get productId
            //create new inventory entry
            //if inventory.createNew -- error
                //do something
            //else inventory.createNew -- success
                //get inventory_id from successfully inventory added
                //add new in_event
                //if add in_events.add_event -- error
                    //do something
                //else add in_events.add_event -- success
                    // var userInventory = ** get description of last 5 products added ***
                    // render to insertProduct view (sending description of last products added)

    //else the barcode isn't in tesco api
        //render to checkBarcode view
        //ask user for basic data loading item_data view
        //go to add product process --> add inventory --> add in_event


//else products.getProductByEan(ean,done) -- success means the barcode is in the product table
    //using var productId = data.id
    //use inventory.getInventoryByUserProduct(UserId, productId,done) to check if there is an inventory entry "user-product"
    //if inventory.getInventoryByUserProduct(UserId, productId,done) --error means a new inventory entry "user-product" needs to be created
        //create new inventory entry
        //inventory.createNew(user_id, product_id, stock_level, predicted_need_date, stock_delta_day, need_trigger_stock_level, done)
        //if inventory.createNew -- error
            //do something
        //else inventory.createNew -- success
            //get inventory_id from successfully inventory added
            //add new in_event
            //in_events.add_event(inventory_id, user_id, old_stock, new_stock, timestamp, done)
            //if add in_events.add_event -- error
                //do something
            //else add in_events.add_event -- success
                // var userInventory = ** get description of last 5 products added ***
                // render to insertProduct view (sending description of last products added)

    //else if inventory.getInventoryByUserProduct(UserId, productId,done) -- success
        //get inventory_id
        //var old_stock_level = get stock_level
        //var new_stock_level =  old_stock_level+1

        //inventory.updateInventoryListingStock(inventory_id, new_stock_level, done)
        //if inventory.updateInventoryListingStock -- error
            //do something
        //else inventory.updateInventoryListingStock -- success
            // in_events.add_event(inventory_id, user_id, old_stock, new_stock, timestamp, done)
            //if add in_events.add_event -- error
                //do something
            //else add in_events.add_event -- success
                // var userInventory = ** get description of last 5 products added ***
                // render to insertProduct view (sending description of last products added)


//**********************************************************************************************************************


router.post('/checkBarcode', function (req,res, next) {
    var userId=req.user[0].id;
    var username = req.user[0].username;
    //console.log("sdsdsds"+req.user[0].id);
    var ean = req.body.codeProduct; //barcode from client side
    //sleep.msleep(1000);

    products.getProductByEan(ean, function(err, data){

        if(err){ //the barcode isn't in the product table/the product does not exist at all
            console.log(err);
            tescoData.get_tesco_data(ean,function (data, err) { //go to tesco api function
                if (data.status == 'fail'){

                    //the barcode isn't in tesco api
                    //render to checkBarcode view
                    console.log('the barcode is not in tesco api');
                    console.log(err);
                    res.render('checkBarcode',{messageItem : 2, eancode: ean, userInventory: 'xx', user: req.user[0]});

                    //ask user for basic data loading item_data view
                    //go to add product process --> add inventory --> add in_event
                    //res.send(err);

                }

                else {
                    //if the barcode is in tesco api
                    //get data from tesco api to create new product
                    //metadata = {'tin size': '400g', "ingredients": ['tomatoes', 'water', 'salt']}; //change from data of tesco api
                    products.createNew(ean,data.brand_name,data.description,0,1, data.quantity, data.quanitiy_unit, data.metadata, function(err, data){
                        if(err){
                            console.log(err);
                            res.send("there was an error getting data from tesco api, see the console");
                        }
                        else {

                            var productId = data.insertId;
                            var stock_level = 1;
                            //create new inventory entry
                            //inventory.createNew(user_id, product_id, stock_level, predicted_need_date, stock_delta_day, need_trigger_stock_level, done)
                            var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                            inventory.createNew(userId,productId,stock_level,mysqlTimestamp,1,1, function(err, data){
                                if(err){
                                    //do something
                                    console.log(err);
                                    res.send("there was an error see the console");
                                }
                                else {
                                    //get inventoryId from successfully inventory added
                                    var inventoryId = data.insertId;
                                    var old_stock = 0;
                                    var new_stock = old_stock + 1;
                                    var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

                                    //add new in_event
                                    //exports.add_event = function (inventory_id, user_id, old_stock, new_stock, timestamp, done) {
                                    in_events.add_event(inventoryId,userId,old_stock,new_stock,mysqlTimestamp, function(err, data){
                                        if(err){
                                            //do something
                                            console.log(err);
                                            res.send("there was an error see the console");
                                        }
                                        else {
                                            //add in_events.add_event -- success
                                            //var userInventory = ** get description of last 5 products added ***
                                            //render to insertProduct view (sending description of last products added)
                                            //var description = tescoApiData.data.description.substring(0,25);
                                            //exports.get_most_recent_for_user = function (user_id, number_of_products, done)
                                            var inEventsId = data.insertId;
                                            in_events.get_most_recent_for_user_Description(userId,5, function(err, data){

                                                if(err){
                                                    console.log(err);
                                                    res.send("there was an error see the console");
                                                }
                                                else {

                                                    console.log(data)
                                                    res.render('insertProduct',{messageItem : 3, description: data[0].description, userInventory: data, user: req.user[0]});

                                                }
                                            });

                                        }
                                    });



                                }
                            });


                        }
                    });

                }





            });

        }
        else {
            //the barcode is in the product table
            var productId = data[0].id;
            //use inventory.getInventoryByUserProduct(UserId, productId,done) to check if there is an inventory entry "user-product"
            inventory.getInventoryByUserProduct(userId,productId, function(err, data){

                if(err){
                    // a new inventory entry "user-product" needs to be created
                    //create new inventory entry
                    console.log(err);
                    console.log("a new inventory entry 'user-product' needs to be created");
                    var stock_level = 1;
                    var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

                    inventory.createNew(userId,productId,stock_level,mysqlTimestamp,1,1, function(err, data){
                        if(err){
                            //do something
                            console.log(err);
                            res.send("there was an error see the console");
                        }
                        else {
                            //get inventoryId from successfully inventory added
                            var inventoryId = data.insertId;
                            var old_stock = 0;
                            var new_stock = old_stock + 1;
                            var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

                            //add new in_event
                            //exports.add_event = function (inventory_id, user_id, old_stock, new_stock, timestamp, done) {
                            in_events.add_event(inventoryId,userId,old_stock,new_stock,mysqlTimestamp, function(err, data){
                                if(err){
                                    //do something
                                    console.log(err);
                                    res.send("there was an error see the console");
                                }
                                else {
                                    //add in_events.add_event -- success
                                    //var userInventory = ** get description of last 5 products added ***
                                    //render to insertProduct view (sending description of last products added)
                                    //var description = tescoApiData.data.description.substring(0,25);
                                    //exports.get_most_recent_for_user = function (user_id, number_of_products, done)
                                    var inEventsId = data.insertId;
                                    in_events.get_most_recent_for_user_Description(userId,5, function(err, data){

                                        if(err){
                                            console.log(err);
                                            res.send("there was an error see the console");
                                        }
                                        else {

                                            console.log(data)
                                            res.render('insertProduct',{messageItem : 3, description: data[0].description, userInventory: data, user: req.user[0]});

                                        }
                                    });

                                }
                            });



                        }
                    });




                }
                else {
                    // there is an inventory entry "user-product" available
                    // get inventoryId from inventory entry available to update stock and then add_event
                    var inventoryId = data[0].id;
                    var old_stock_level = data[0].stock_level;
                    var new_stock_level = old_stock_level + 1;
                    var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    //inventory.updateInventoryListingStock(inventory_id, new_stock_level, done)
                    inventory.updateInventoryListingStock(inventoryId,new_stock_level, function(err, data){
                        if(err){
                            //do something
                            console.log(err);
                            res.send("error to update inventory, see the console");
                        }
                        else {
                            //update inventory success
                            in_events.add_event(inventoryId,userId,old_stock_level,new_stock_level,mysqlTimestamp, function(err, data){
                                if(err){
                                    //do something
                                    console.log(err);
                                    res.send("error in add_event, see the console");
                                }
                                else {
                                    //add in_events.add_event -- success
                                    // var userInventory = ** get description of last 5 products added ***
                                    var inEventsId = data.insertId;
                                    in_events.get_most_recent_for_user_Description(userId,5, function(err, data){

                                        if(err){
                                            console.log(err);
                                            res.send("there was an error see the console");
                                        }
                                        else {
                                            //render view to inserted products
                                            console.log(data);
                                            //res.send(data);
                                            res.render('insertProduct',{messageItem : 3, description: data[0].description, userInventory: data, user: req.user[0]});

                                        }
                                    });
                                }
                            });

                        }
                    });

                }
            });


        }



    });


});


//insert in the inventory and render to item added view (this request came from add new item view)
router.post('/insertProduct', function (req,res,next) {
    var userId=req.user[0].id;
    var username = req.user[0].username;

    //Post item details to global product database
    var ean = req.body.productEan; // scanned barcode
    var description = (req.body.productDescription).substring(0,49);
    var brand_name = req.body.productBrand;
    var multipack = req.body.multipack;
    var multipack_amount = req.body.multipackAmount;
    var quantity = req.body.quantity;
    var quantity_units = req.body.quantityUnit;
    var metadata = {'add more data': 'xxx'}; //change from data of tesco api

    products.createNew(ean,brand_name,description,multipack,multipack_amount, quantity, quantity_units, metadata, function(err, data){
        if(err){
            console.log(err);
            res.send("there was an error creating a new product, see the console");
        }
        else {

            var productId = data.insertId;
            var stock_level = 1;
            //create new inventory entry
            var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            inventory.createNew(userId,productId,stock_level,mysqlTimestamp,1,1, function(err, data){
                if(err){
                    //do something
                    console.log(err);
                    res.send("there was an error see the console");
                }
                else {
                    //get inventoryId from successfully inventory added
                    var inventoryId = data.insertId;
                    var old_stock = 0;
                    var new_stock = old_stock + 1;
                    var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

                    //add new in_event
                    //exports.add_event = function (inventory_id, user_id, old_stock, new_stock, timestamp, done) {
                    in_events.add_event(inventoryId,userId,old_stock,new_stock,mysqlTimestamp, function(err, data){
                        if(err){
                            //do something
                            console.log(err);
                            res.send("there was an error see the console");
                        }
                        else {
                            //add in_events.add_event -- success
                            // var userInventory = ** get description of last 5 products added ***
                            // render to insertProduct view (sending description of last products added)
                            //var description = tescoApiData.data.description.substring(0,25);
                            //exports.get_most_recent_for_user = function (user_id, number_of_products, done)
                            var inEventsId = data.insertId;
                            in_events.get_most_recent_for_user_Description(userId,5, function(err, data){

                                if(err){
                                    console.log(err);
                                    res.send("there was an error see the console");
                                }
                                else {

                                    console.log(data)
                                    res.render('insertProduct',{messageItem : 3, description: data[0].description, userInventory: data, user: req.user[0]});

                                }
                            });

                        }
                    });



                }
            });


        }
    });


});


//**************************************** scan out logic v1.0 *********************************************************

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


//scan out logic v1.1
//if barcode is on user inventory and have description
    //get stock level and products details from user inventory
    //ask about stock level to confirm
    //Ask user if item was “used up or wasted” - where store in the model?
    //Confirm item details and new inventory stock level
    // (inventory means the households local listing of items)
    //update stock_level (-1)
    //then render scannedOutProduct view
// else if barcode is on user inventory but it doesn't have description
    // get barcode
    // prompt user to “add product details now”
    ///Ask user if item was “used up or wasted” - where store in the model?
    //Confirm item details and new inventory stock level
    // (inventory means the households local listing of items)
    //update stock_level (-1)
    //then render scannedOutProduct view
//else if barcode isn't on user inventory
    //get barcode
    //prompt user to add as "scanned in product"
    //back end: add this product as scanned in
    //Prompt user to “use up/wasted” product
    //Go back to “ready to scan out” view with table of scanned out products
    //render to scannedOutProduct with message 1


//**************************************** scan out logic v2.0 *********************************************************
//Work in progress

//get userId
//get barcode/ean
//get wasted = req.body.wastedProductOut;
//if products.getProductByEan(ean,done) -- error  -->  the barcode isn't in the product table/the product does not exist at all
    //the user is trying to scan out a product outside the db
    	//send a message and do something

//else products.getProductByEan(ean,done) -- success means the barcode is in the product table
    //using var productId = data.id
    //use inventory.getInventoryByUserProduct(UserId, productId,done) to check if there is an inventory entry "user-product"
    //if inventory.getInventoryByUserProduct(UserId, productId,done) --error means a new inventory entry "user-product" needs to be created
        //create new inventory entry
        //inventory.createNew(user_id, product_id, stock_level, predicted_need_date, stock_delta_day, need_trigger_stock_level, done)
        //if inventory.createNew -- error
            //do something
        //else inventory.createNew -- success
            //get inventory_id from successfully inventory added
            //add new in_event
            //in_events.add_event(inventory_id, user_id, old_stock, new_stock, timestamp, done)
            //if add in_events.add_event -- error
                //do something
            //else add in_events.add_event -- success
                // var userInventory = ** get description of last 5 products added ***
                // render to insertProduct view (sending description of last products added)

    //else if inventory.getInventoryByUserProduct(UserId, productId,done) -- success
        //get inventory_id
        //var old_stock_level = get stock_level
        //var new_stock_level =  old_stock_level-1
        //inventory.updateInventoryListingStock(inventory_id, new_stock_level, done)
        //if inventory.updateInventoryListingStock -- error
            //do something
        //else inventory.updateInventoryListingStock -- success
        	//out_events.add_event(inventory_id, user_id, old_stock, new_stock, wasted, timestamp, done)
            //if add out_events.add_event -- error
                //do something
            //else out out_events.add_event -- success
                // var userInventory = ** get description of last 5 products added ***
                // render to scanOut view (sending description of last products scanned out)




//**********************************************************************************************************************

router.post('/scanOutProduct', function (req,res, next) {
    console.log(req.body);
    var userId=req.user[0].id;
    var username = req.user[0].username;
    var wasted = req.body.wastedProductOut;
    var ean = req.body.codeProductOut; //barcode from client side

    products.getProductByEan(ean, function(err, data){

        if(err){ //the barcode isn't in the product table/the product does not exist at all
            //the user is trying to scan out a product outside the db

            console.log(err);
            //res.send('sorry, this product needs to be scanned-in first');
            res.render('scannedOutProduct',{messageScanOut:2,message:'This product needs to be scanned-in first',descriptionOut:'Not available', lastUserInventoryOut:'Not Available', user: req.user[0]});

        }


        else {
            //the barcode is in the product table
            console.log('the barcode is in the product table');
            var productId = data[0].id;
            //use inventory.getInventoryByUserProduct(UserId, productId,done) to check if there is an inventory entry "user-product"
            inventory.getInventoryByUserProduct(userId,productId, function(err, data){

                if(err){
                    // a new inventory entry "user-product" needs to be created
                    //create new inventory entry
                    console.log(err);
                    //res.send("sorry, this product needs to be scanned-in first");
                    console.log("a new inventory entry 'user-product' needs to be created");
                    res.render('scannedOutProduct',{messageScanOut:2,message:'This product needs to be scanned-in first',descriptionOut:'Not available', lastUserInventoryOut:'Not Available', user: req.user[0]});

                }
                else {
                    // there is an inventory entry "user-product" available
                    console.log('there is an inventory entry user-product available');
                    // get inventoryId from inventory entry available to update stock and then out_add_event
                    var inventoryId = data[0].id;
                    var old_stock_level = data[0].stock_level; //check negative inventory
                    var new_stock_level = old_stock_level - 1;
                    var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

                    if (old_stock_level>0){
                        //allow scan out just when stock level is > 0
                        //inventory.updateInventoryListingStock(inventory_id, new_stock_level, done)
                        inventory.updateInventoryListingStock(inventoryId,new_stock_level, function(err, data){
                            if(err){
                                //do something
                                console.log(err);
                                res.send("error to update inventory, see the console");
                            }
                            else {
                                //update inventory success
                                out_events.add_event(inventoryId,userId,old_stock_level,new_stock_level,wasted,mysqlTimestamp, function(err, data){
                                    if(err){
                                        //do something
                                        console.log(err);
                                        res.send("error in out_event, see the console");
                                    }
                                    else {
                                        //add out_events.add_event -- success
                                        // var userInventory = ** get description of last 5 products added ***
                                        var outEventsId = data.insertId;
                                        out_events.get_most_recent_for_user_Description(userId,5, function(err, data){

                                            if(err){
                                                console.log(err);
                                                res.send("there was an error see the console");
                                            }
                                            else {
                                                //render view to inserted products
                                                console.log(data);
                                                //res.send(data);
                                                //res.render('insertProduct',{messageItem : 3, description: outEventsId, userInventory: data, user: username /*req.user*/});
                                                res.render('scannedOutProduct',{messageScanOut:0,descriptionOut:data[0].description, lastUserInventoryOut:data, user: req.user[0]});



                                            }
                                        });
                                    }
                                });

                            }
                        });
                    }
                    else{
                        //the stock level of that product is 0, then redirect to scan out wrong
                        res.render('scannedOutProduct',{messageScanOut:2,message:'This product does not have stock level, please scanned-in first',descriptionOut:'Not available', lastUserInventoryOut:'Not Available', user: req.user[0]});

                    }
                 }
            });


        }



    });


});




router.post('/scanOutProductManual', function (req,res, next) {
    console.log(req.body);
    var userId=req.body.userId;
    var username = req.user[0].username;
    var wasted = req.body.wastedProductOut;
    var ean = req.body.codeProductOut; //barcode from client side
    var inventoryId = req.body.inventoryId;
    var outDate1 = (req.body.dateScanOutManual);
    var outDate = moment(outDate1).format('YYYY-MM-DD HH:mm:ss');
    console.log('***date selected***'+outDate);

    if(!outDate1){
        res.send("Choose a date after scan-in time");
    }
    else{
        //at the manual scan out process the product always is on the "product" database
        console.log('the barcode is in the product table');
        var productId = req.body.productId;

        inventory.getInventoryById(inventoryId, function(err, data){

            if(err){
                console.log(err);
                console.log("a new inventory entry 'user-product' needs to be created");

            }
            else {
                // there is an inventory entry available

                var old_stock_level = data[0].stock_level; //check negative inventory
                var new_stock_level = old_stock_level - 1;
                var mysqlTimestamp = outDate;

                if (old_stock_level){
                    console.log('allow scan out just when stock level is > 0');
                    //inventory.updateInventoryListingStock(inventory_id, new_stock_level, done)
                    inventory.updateInventoryListingStock(inventoryId,new_stock_level, function(err, data){
                        if(err){
                            //do something
                            console.log(err);
                            res.send("error to update inventory, see the console");
                        }
                        else {
                            //update inventory success
                            out_events.add_event(inventoryId,userId,old_stock_level,new_stock_level,wasted,mysqlTimestamp, function(err1, data1){
                                if(err1){
                                    //do something
                                    console.log(err1);
                                    res.send("error in out_event, see the console");
                                }
                                else {
                                    console.log(data1);
                                    //res.render('scannedOutProduct',{messageScanOut:0,descriptionOut:data[0].description, lastUserInventoryOut:data, user: req.user[0]});
                                    //res.render('index',{ user: req.user});
                                    res.redirect('/');

                                }
                            });

                        }
                    });
                }
                else{
                    //the stock level of that product is 0, then redirect to scan out wrong
                    console.log("the stock level of that product is 0, then redirect to scan out wrong");
                    res.send("error");
                    //res.render('scannedOutProduct',{messageScanOut:2,message:'This product does not have stock level, please scanned-in first',descriptionOut:'Not available', lastUserInventoryOut:'Not Available', user: req.user[0]});

                }
            }
        });

    }







});


//**********************************************************************************************************************



//***************************************** ajax request **************************************************************



router.post('/scanInAgain', function (req,res,next) {
    var userId=req.user[0].id;
    //this is just for render again scan in process
    console.log('ready to scan in again');
    console.log('get data from user and send it back')
    //GET LAST 5 ITEMS AND SEND BACK TO INSERTPRODUCT VIEW
    in_events.get_most_recent_for_user_Description(userId,5, function(err, data){

        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {
            //render view to inserted products
            console.log(data);
            res.send({messageItem:4, userInventory:data});

        }
    });

});


router.post('/scanOutAgain', function(req,res,next){
    var userId=req.user[0].id;
    console.log('ready to scan out again');
    //GET LAST 5 ITEMS AND SEND BACK TO ****** VIEW

    out_events.get_most_recent_for_user_Description(userId,5,function (err, data) {
       if(err){
           console.log(err);
           res.send("there was an error see the console");
       }
       else{
           //render view to inserted products
           console.log(data);
           res.send({messageItem:5, userInventoryOut:data});
       }
    });

});


router.post('/scanOutWrong',function(req,res,next){
    console.log('scan out wrong');
    var data={success:true};
    res.json(data);
    //return res.redirect('/');
});

router.post('/getInventoryData',function (req,res,next) {
    var userId=req.body.userId;
    inventory_product.getInStock(userId,function(err,data){
        if(err){
            console.log(err);
            //res.send("there was an error");
            var data= {"data":{}};
            res.json(data);

        }
        else{
            var data= {"data":data};
            res.json(data);
        }
    });


});


router.post('/getInventoryDataOut',function (req,res,next) {
    var userId = req.body.userId;
    inventory_product.getOutStock(userId,function(err,data){
        if(err){
            console.log(err);
            //res.send("there was an error");
            var data= {"data":{}};
            res.json(data);

        }
        else{
            var data= {"data":data};
            res.json(data);
        }
    });

});


router.post('/getInEvents',function (req,res,next) {
    var inventoryId= req.body.inventoryId;
    in_events.get_most_recent_for_inventory(inventoryId,5000,function(err, data){

        if(err){
            console.log(err);
            var data= {"data":{}};
            res.json(data);
        }
        else {

            //var data= {"data":data};
            //res.json(data);
            var data1=[];
            console.log(data.length);
            for (var i = 0; i < data.length; i++){
                data1.push({"timestamp": moment(data[i].timestamp).format('YYYY-MM-DD, HH:mm:ss')});
            }
            var data= {"data":data1};
            res.send(data);
        }


    });

});


router.post('/getOutEvents',function (req,res,next) {
    var inventoryId= req.body.inventoryId;
    out_events.get_most_recent_for_inventory(inventoryId,5000,function(err, data){

        if(err){
            console.log(err);
            var data= {"data":{}};
            res.json(data);
        }
        else {

            //var data= {"data":data};
            //res.json(data);
            var data1=[];
            console.log(data.length);
            for (var i = 0; i < data.length; i++){
                data1.push({"timestamp": moment(data[i].timestamp).format('YYYY-MM-DD, HH:mm:ss')});
            }
            var data= {"data":data1};
            res.send(data);

        }


    });

});


router.post('/getInOutEvents',function (req,res,next) {
    var userId = req.body.userId;
    var inventoryId = req.body.inventoryId;
    inventory_product.getInOutEvents(userId,inventoryId,function (err,data) {

        if(err){
            console.log(err);
            //res.send("there was an error see the console");
            var data= {"data":{}};
            res.json(data);
        }
        else {

            //console.log(data);
            //res.send(data);
            var data1=[];
            console.log(data.length);
            moment.updateLocale(moment.locale(), { invalidDate: "Not available" })
            for (var i = 0; i < data.length; i++){
                data1.push({"id":data[i].id,"inventory_id":data[i].inventory_id,"added": moment(data[i].added).format('DD-MM-YYYY, HH:mm:ss'),"used_up": moment(data[i].used_up).format('DD-MM-YYYY, HH:mm:ss')});
            }
            var data= {"data":data1};
            res.send(data);



        }
    });

});




router.post('/getFirstAdded',function (req,res,next) {
    var userId = req.body.userId;
    var inventoryId= req.body.inventoryId;

    inventory_product.getFirstIn(userId,inventoryId,function(err, data){

            if(err){
                console.log(err);
                console.log("there was an error see the console");
                var data= {"data":{}};
                res.json(data);
            }
            else {

                //console.log(data);
                //res.send(data);
                var data1=[];
                for (var i = 0; i < data.length; i++){
                    data1.push({"timestamp": moment(data[i].timestamp).format('MM/DD/YYYY HH:mm:ss')});
                }
                var data= {"data":data1};
                res.send(data);
            }
        });


});




router.post('/getLastUsedUp', function(req, res, next) {
    var userId = req.body.userId;
    var inventoryId= req.body.inventoryId;
    var wastedId = req.body.wastedId;

    console.log('get last ***');
    console.log(req.body);

    inventory_product.getLastUsed(userId,inventoryId,wastedId,function(err, data){

        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {

            //console.log(data);
            //res.send(data);
            var data1=[];
            for (var i = 0; i < data.length; i++){
                data1.push({"timestamp": moment(data[i].timestamp).format('DD-MM-YYYY')});
            }
            var data= {"data":data1};
            res.send(data);

        }
    });
});


router.post('/editProduct',function(req,res,next){

    var inventoryId = req.body.inventoryId;

    var newStockLevel = req.body.newStockLevel;

    //var inventoryUpdate =  Inventory.updateInventoryListingStock(inventoryId,newStockLevel);

    //if (inventoryUpdate.status == 'success'){
    //    console.log('inventoryID:'+inventoryId);
    //    console.log(newStockLevel);
    //    var data = {data:newStockLevel, msg:inventoryUpdate.status}
    //    res.json(data);
    //}
    //else{
    //    console.log('inventoryID:'+inventoryId);
    //    var data = {data:newStockLevel, msg:inventoryUpdate.error_message}
    //    res.json(data);

    //}

});


router.post('/stopTrack',function(req,res,next){
    var inventoryId = req.body.inventoryId;

    //var stopTrack = Inventory.stopTracking(inventoryId);
    //if (stopTrack.status =='success'){
    //    var data = {msg:stopTrack.status}
    //    res.json(data);
    //}
    //else{
    //    var data = {msg:stopTrack.error_message}
    //    res.json(data);
    //
    //}

});

router.post('/outByUser',function(req,res,next){
    var data = req.body;
    console.log(data);
    res.json(data);

});




//************************************ functions *************************************************


//function to connect and consume TESCO API moved to tescoApi.js


//*************************************** LOGIN AND REGISTER  **********************************************************
//this needs to be moved to user.js


router.get('/login',
    function(req, res){
        res.render('login');
    });

//router.post('/login',
//    passport.authenticate('local', { failureRedirect: '/login' }),
//    function(req, res) {
//        console.log('Im here login');
//        console.log(req.body);
//        res.redirect('/');
//        //res.render('index',{ user: req.user });
//
//    });





router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        console.log('Im here login');
        res.redirect('/');
    });



router.get('/logout',
    function(req, res){
        req.logout();
        res.redirect('/login');
    });


router.get('/profile',
    require('connect-ensure-login').ensureLoggedIn(),
    function(req, res){
        res.render('profile', { user: req.user });
    });



router.get('/register', function(req, res,next){
    res.render('register');
});

// Register User
router.post('/register', function(req, res, next) {

    var username = req.body.username;
    var password = req.body.password;

    console.log('event: try to register');

    req.check('username', 'Username is required').notEmpty();
    req.check('password', 'Password is invalid').isLength({min: 4}).equals(req.body.password2);

    user.createNew(username, password, function(err, data){
        if(err){
            console.log(err);
            //res.send("there was an error see the console");
            res.render('register',{err:err});
        }
        else {
            console.log(data);
            //res.send(data)
            res.render('login',{username:username,password:password});
        }
    });


});


//*********************************************************************************************************************





module.exports = router;
