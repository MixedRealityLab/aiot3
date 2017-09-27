var express = require('express');
var router = express.Router();
var request = require('request');
var sleep = require('sleep');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var moment = require('moment');



var Product = require('../data_models/products');
var products = require('../data_models/products');

var Inventory = require('../data_models/inventory');
var inventory = require('../data_models/inventory');

var in_events = require('../data_models/in_events.js');


//var OutEvent = require('../data_models/out_events');
var out_events = require('../data_models/out_events');

var user = require('../data_models/user.js')
var tescoData = require("./tescoApi.js");


//**********************************************************************************************************************

/*
router.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
}));*/

//router.use(passport.initialize());
//router.use(passport.session());

// Configure the local strategy for use by Passport.
//passport.use(new Strategy(
//    function(username, password, cb) {
//        User.findByUsername(username, function(err, user) {
//            if (err) { return cb(err); }
//            if (!user) { return cb(null, false); }
//            if (user.password != password) { return cb(null, false); }
//            return cb(null, user);
//        });
//    }));



// =========================================================================
// LOCAL LOGIN =============================================================
// =========================================================================
// we are using named strategies since we have one for login and one for signup
// by default, if there was no name, it would just be called 'local'
/*
passport.use(new Strategy(
    function(username, password, cb) {
        user.login(username,password, function(err, user) {

            if (err) {
                return cb(err);
            }
            if (!user) {
                return cb(null, false);
            }
            if (user[0].password != password) {
                return cb(null, false);
            }
            return cb(null, user);
        });
    }));
*/


//passport.serializeUser(function(user, cb) {
//    cb(null, user.id);
//});

//passport.deserializeUser(function(id, cb) {
//    User.findById(id, function (err, user) {
//        if (err) { return cb(err); }
//        cb(null, user);
//    });
//});

// =========================================================================
// passport session setup ==================================================
// =========================================================================
// required for persistent login sessions
// passport needs ability to serialize and unserialize users out of session

// used to serialize the user for the session
/*
passport.serializeUser(function(user, done) {
    console.log(user.id);
    done(null, user.id);
});*/

// used to deserialize the user
/*
passport.deserializeUser(function(id, done) {
    //connection.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
    //    done(err, rows[0]);
    //});
    user.login(id,password,function(err, data){
        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {
            console.log(data);
            //res.send(data[0]);
            done(err, rows[0]);
        }

    });

});*/



//**********************************************************************************************************************


/* GET home page. */
router.get('/', function(req, res, next){
//router.get('/' ,function(req, res, next) {
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('index',{ user: req.user });
    //res.render('index', { username: req.body.username, session: req.session.success, errors: req.session.errors, messageItem : 0 });
    //res.render('index', { username: req.body.username, session: 'success', errors: req.session.errors, messageItem : 0 });

    //req.session.errors = null;
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
    var userId = 1;
    var username = 'test'; //req.username
    var ean = req.body.codeProduct; //barcode from client side
    sleep.msleep(5000);

    products.getProductByEan(ean, function(err, data){

        if(err){ //the barcode isn't in the product table/the product does not exist at all
            console.log(err);
            tescoData.get_tesco_data(ean,function (data, err) { //go to tesco api function
                if (data.status == 'fail'){

                    //the barcode isn't in tesco api
                    //render to checkBarcode view
                    console.log('the barcode is not in tesco api');
                    console.log(err);
                    res.render('checkBarcode',{messageItem : 2, eancode: ean, userInventory: 'xx', user: username /*req.user*/});

                    //ask user for basic data loading item_data view
                    //go to add product process --> add inventory --> add in_event
                    //res.send(err);

                }

                else {
                    //if the barcode is in tesco api
                    //get data from tesco api to create new product
                    metadata = {'tin size': '400g', "ingredients": ['tomatoes', 'water', 'salt']}; //change from data of tesco api
                    products.createNew(ean,data.brand_name,data.description,1,1, data.quantity, data.quanitiy_unit, metadata, function(err, data){
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
                                            in_events.get_most_recent_for_user(userId,5, function(err, data){

                                                if(err){
                                                    console.log(err);
                                                    res.send("there was an error see the console");
                                                }
                                                else {

                                                    console.log(data)
                                                    res.render('insertProduct',{messageItem : 3, description: inEventsId, userInventory: data, user: username /*req.user*/});

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
                    res.send("a new inventory entry 'user-product' needs to be created");
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
                                    in_events.get_most_recent_for_user(userId,5, function(err, data){

                                        if(err){
                                            console.log(err);
                                            res.send("there was an error see the console");
                                        }
                                        else {
                                            //render view to inserted products
                                            console.log(data);
                                            //res.send(data);
                                            res.render('insertProduct',{messageItem : 3, description: inEventsId, userInventory: data, user: username /*req.user*/});

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
    //var userId = req.user.id;
    var userId = 1;
    var username = 'test';

    //Post item details to global product database
    var ean = req.body.productEan; // scanned barcode
    var description = req.body.productDescription;
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
                            in_events.get_most_recent_for_user(userId,5, function(err, data){

                                if(err){
                                    console.log(err);
                                    res.send("there was an error see the console");
                                }
                                else {

                                    console.log(data)
                                    res.render('insertProduct',{messageItem : 3, description: inEventsId, userInventory: data, user: username /*req.user*/});

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
//WIP
//WIP

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
    //console.log('user id scanout****:'+ req.user.id);

    sleep.msleep(4000); //this is for show the barcode scanned
    console.log(req.body);
    var userId = 1;
    var username = 'test'; //req.username
    var wasted = req.body.wastedProductOut;
    var ean = req.body.codeProductOut; //barcode from client side

    products.getProductByEan(ean, function(err, data){

        if(err){ //the barcode isn't in the product table/the product does not exist at all
            //the user is trying to scan out a product outside the db
            console.log(err);

            tescoData.get_tesco_data(ean,function (data, err) { //go to tesco api function
                if (data.status == 'fail'){

                    //the barcode isn't in tesco api
                    //render to checkBarcode view
                    console.log('the barcode is not in tesco api');
                    console.log(err);
                    //do something
                    res.send(err);


                }

                else {
                    //if the barcode is in tesco api
                    //get data from tesco api to create new product
                    /*
                    metadata = {'tin size': '400g', "ingredients": ['tomatoes', 'water', 'salt']}; //change from data of tesco api
                    products.createNew(ean,data.brand_name,data.description,1,1, data.quantity, data.quanitiy_unit, metadata, function(err, data){
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
                                            //after in_events add inmediatly out_vents.add_event
                                            var inEventsId = data.insertId;
                                            in_events.get_most_recent_for_user(userId,5, function(err, data){

                                                if(err){
                                                    console.log(err);
                                                    res.send("there was an error see the console");
                                                }
                                                else {

                                                    console.log(data)
                                                    res.render('insertProduct',{messageItem : 3, description: inEventsId, userInventory: data, user: username }); //req.user

                                                }
                                            });

                                        }
                                    });



                                }
                            });


                        }
                    });*/

                }

            });

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
                    res.send("a new inventory entry 'user-product' needs to be created");
                    //console.log("a new inventory entry 'user-product' needs to be created");
                    //res.render('scannedOutProduct',{messageScanOut:1,descriptionOut:userInventoryOut.msg, lastUserInventoryOut:lastUserInventoryOut, user: req.user});

                }
                else {
                    // there is an inventory entry "user-product" available
                    console.log('there is an inventory entry user-product available');
                    // get inventoryId from inventory entry available to update stock and then out_add_event
                    var inventoryId = data[0].id;
                    var old_stock_level = data[0].stock_level; //check negative inventory
                    var new_stock_level = old_stock_level - 1;
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
                                    out_events.get_most_recent_for_user(userId,5, function(err, data){

                                        if(err){
                                            console.log(err);
                                            res.send("there was an error see the console");
                                        }
                                        else {
                                            //render view to inserted products
                                            console.log(data);
                                            //res.send(data);
                                            //res.render('insertProduct',{messageItem : 3, description: outEventsId, userInventory: data, user: username /*req.user*/});
                                            res.render('scannedOutProduct',{messageScanOut:0,descriptionOut:outEventsId, lastUserInventoryOut:data, user: username});



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




//**********************************************************************************************************************



//***************************************** ajax request **************************************************************


router.post('/scanInAgain', function (req,res,next) {

    //var userId = req.body.userId;
    var userId = 1;
    //this is just for render again scan in process
    console.log('ready to scan in again');
    console.log('get data from user and send it back')
    //GET LAST 5 ITEMS AND SEND BACK TO INSERTPRODUCT VIEW
    in_events.get_most_recent_for_user(userId,5, function(err, data){

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
    //var userId =  req.body.userId;
    var userId = 1;
    console.log('ready to scan out again');
    //GET LAST 5 ITEMS AND SEND BACK TO ****** VIEW

    out_events.get_most_recent_for_user(userId,5,function (err, data) {
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




router.post('/getInventoryData',function (req,res,next) {
    console.log(req.body);
    //var userId=req.body.userId;
    var userId = 1;
    //var data = Inventory.getProductsForUser(userId);//this method doesn't exist.

    inventory.getInventoryForUser(userId, function(err, data){

        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {

            //console.log(data);
            //es.send(data);

            // HERE I NEED TO USER Inventory.getProductFromInventoryId method
            // get inventory id
            //with inventory id get ean
            //with ean get product details
            //add to data
            console.log(data);
            console.log('request from dataTable ajax');
            res.json(data);
        }
    });

});


router.post('/getInventoryDataOut',function (req,res,next) {

    //var userId = req.body.userId;
    var userId = 1;
    //var data = {description: "xxx", lastAdded: "07/07/27", usedUp: "16/08/17"};

    var data = OutEvent.get_most_recent_for_user(userId,5);
    console.log(data);
    res.json(data);

});




router.post('/editProduct',function(req,res,next){

    var inventoryId = req.body.inventoryId;

    var newStockLevel = req.body.newStockLevel;
    var inventoryUpdate =  Inventory.updateInventoryListingStock(inventoryId,newStockLevel);

    if (inventoryUpdate.status == 'success'){
        //send to front data
        console.log('inventoryID:'+inventoryId);
        console.log(newStockLevel);
        var data = {data:newStockLevel, msg:inventoryUpdate.status}
        res.json(data);
    }
    else{
        console.log('inventoryID:'+inventoryId);
        var data = {data:newStockLevel, msg:inventoryUpdate.error_message}
        res.json(data);

    }

});


router.post('/stopTrack',function(req,res,next){
    var inventoryId = req.body.inventoryId;
    var stopTrack = Inventory.stopTracking(inventoryId);

    if (stopTrack.status =='success'){
        var data = {msg:stopTrack.status}
        res.json(data);

    }
    else{
        var data = {msg:stopTrack.error_message}
        res.json(data);

    }

});

router.post('/bin',function(req,res,next){
    var data = req.body;
    console.log(data);
    res.json(data);

});




//************************************ functions *************************************************


function getOutInventoryUser(user){
    var lastInventoryOut = OutEvent.get_most_recent_for_user(user,5);
    lastInventoryOut = lastInventoryOut["data"];
    console.log('***last inventory out:'+ lastInventoryOut);
    return lastInventoryOut;
}


//function to connect and consume TESCO API moved to tescoApi.js


//*************************************** LOGIN AND REGISTER  **********************************************************
//this needs to move to user.js
/*

router.get('/login',
    function(req, res){
        res.render('login');
    });

router.post('/login',
    passport.authenticate('local', { failureRedirect: '/login' }),
    function(req, res) {
        console.log('Im here login');
        console.log(req.body);
        res.redirect('/');
        //res.render('index',{ user: req.user });

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

    var registerEvent = User.createNew(username, password);

    if (registerEvent.status == 'success') {
        //req.session.success = true;
        res.redirect('/login');
    }
    else {
        console.log('fail:' + registerEvent.error);
        res.redirect('/register');
    }

});
*/

//*********************************************************************************************************************





module.exports = router;
