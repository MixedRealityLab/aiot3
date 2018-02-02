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
var initial_prediction = require("./initialPrediction.js");
var inbox = require("./inbox.js");
var prediction = require("../data_models/prediction.js");
var user_log =  require("../data_models/user_event_log.js");




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
    //console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('index',{ user: req.user});
});
//*****************************************************************************************************************************



router.post('/checkBarcode', function (req,res, next) {
    var userId=req.user[0].id;
    var username = req.user[0].username;
    var ean = req.body.codeProduct; //barcode from client side

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
                            //var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                            var predicted_need_date = null;
                            inventory.createNew(userId,productId,stock_level,predicted_need_date,0,1, function(err, data){
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

                                                    //console.log(data)
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
                    //var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    var predicted_need_date = null;
                    inventory.createNew(userId,productId,stock_level,predicted_need_date,0,1, function(err, data){
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

                                            //console.log(data)
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

                            //update prediction and save that information in table prediction
                            initial_prediction.getInitialPrediction(userId,inventoryId,function (dataPrediction,err) {
                                if (err){
                                    console.log(err);
                                    //res.send("there was an error see the console");
                                }
                                else {
                                    //console.log(dataPrediction);
                                    //res.send(dataPrediction);
                                    console.log("new prediction added");
                                }
                            });


                            //add in event
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
                                            //console.log(data);
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


//insert in the inventory and render to item added view (this request came from adding new item view)
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
            //var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
            //var mysqlTimestamp = moment("2000-01-01").format('YYYY-MM-DD HH:mm:ss');
            var predicted_need_date = null;
            inventory.createNew(userId,productId,stock_level,predicted_need_date,0,1, function(err, data){
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

                                    //console.log(data)
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



router.post('/scanOutProduct', function (req,res, next) {
    //console.log(req.body);
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

                                //update prediction and save that information in table prediction
                                initial_prediction.getInitialPrediction(userId,inventoryId,function (dataPrediction,err) {
                                    if (err){
                                        console.log(err);
                                        //res.send("there was an error see the console");
                                    }
                                    else {
                                        //console.log(dataPrediction);
                                        //res.send(dataPrediction);
                                        console.log("new prediction added");
                                    }
                                });

                                //add out event
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
                                                //console.log(data);
                                                //res.send(data);
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
    var userId=req.body.userId;
    var username = req.user[0].username;
    var wasted = req.body.wastedProductOut;
    var ean = req.body.codeProductOut; //barcode from client side
    var inventoryId = req.body.inventoryId;
    var outDate1 = (req.body.dateScanOutManual);
    var outDate = moment(outDate1).format('YYYY-MM-DD HH:mm:ss');

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

                            //update prediction and save that information in table prediction
                            initial_prediction.getInitialPrediction(userId,inventoryId,function (dataPrediction,err) {
                                if (err){
                                    console.log(err);
                                    //res.send("there was an error see the console");
                                }
                                else {
                                    //console.log(dataPrediction);
                                    //res.send(dataPrediction);
                                    console.log("new prediction added");
                                }
                            });

                            //add out event
                            out_events.add_event(inventoryId,userId,old_stock_level,new_stock_level,wasted,mysqlTimestamp, function(err1, data1){
                                if(err1){
                                    //do something
                                    console.log(err1);
                                    res.send("error in out_event, see the console");
                                }
                                else {
                                    //
                                    // console.log(data1);
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


router.post('/feedbackPrediction', function (req,res, next) {
    console.log("from inbox");
    var feedback_status = req.body.feedback_status;
    var feedback = req.body.feedback_text;
    var feedback_timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var feedback_after_before = req.body.feedback_after_before;
    var predictionId = req.body.prediction_id;
    var inventoryId =  req.body.inventory_id;

    //prediction.updatePredictionFeedback(1,,,,)
    prediction.updatePredictionFeedback(predictionId,feedback_status,feedback,feedback_timestamp,feedback_after_before,function(err, data){
        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {

            console.log(data);
            //res.send(data);
            //res.render('inbox',{ user: req.user});
            res.redirect('/');

        }
    });

});


router.post('/feedbackPredictionAjax', function (req,res, next) {
    console.log("from inbox ajax");
    var feedback_status = req.body.feedback_status;
    var feedback = req.body.feedback_text;
    var feedback_timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    var feedback_after_before = req.body.feedback_after_before;
    var predictionId = req.body.prediction_id;
    var inventoryId =  req.body.inventory_id;

    //prediction.updatePredictionFeedback(1,,,,)
    prediction.updatePredictionFeedback(predictionId,feedback_status,feedback,feedback_timestamp,feedback_after_before,function(err, data){
        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {

            console.log(data);
            res.send({messageItem:4, data:data});


        }
    });

});
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
            //console.log(data);
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
           //console.log(data);
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

/*
//get inventory data without prediction
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
*/


/*
//get inventory data including prediction
router.post('/getInventoryData',function (req,res,next) {
    var userId=req.body.userId;
    var inventoryPrediction = [];
    inventory_product.getInStock(userId,function(err,data){
        if(err){
            console.log(err);
            //res.send("there was an error");
            var data= {"data":{}};
            res.json(data);

        }
        else{
            //upgrade all predictions from this user
            //calling initialPrediction to upgrade all inventory from this specific user
            for(var j=0; j<data.length; j++){
                var inventoryId=data[j].inventory_id;
                prediction.getInitialPrediction(userId,inventoryId,function (dataPrediction,err) {
                    if (err){
                        console.log(err);
                        //res.send("there was an error see the console");

                    }
                    else {
                        console.log(dataPrediction);
                        //res.send(dataPrediction);
                    }


                });

            }



            for (var i=0; i<data.length; i++){
                if(data[i].stock_delta_day == 1 ){
                    data[i].predicted_need_date = 'Not available yet';
                }
                else{
                    data[i].predicted_need_date = moment(data[i].predicted_need_date).format('DD-MM-YYYY');
                }

            }


            var data= {"data":data};
            res.json(data);
        }
    });


});*/



//get inventory data with getting prediction field (not upgrading prediction each time that this procedure is called)
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

            for (var i=0; i<data.length; i++){
                if(data[i].stock_delta_day == 1 || data[i].stock_delta_day == 0){
                    data[i].predicted_need_date = 'Not available yet';
                }
                else{
                    data[i].predicted_need_date = moment(data[i].predicted_need_date).format('DD-MM-YYYY');
                }

            }

            var data= {"data":data};
            res.json(data);
        }
    });


});



router.post('/getInventoryDataPrediction',function (req,res,next) {
    var userId=req.body.userId;
    inventory.getInventoryForUserPrediction(userId, function (err, data) {

        if (err) {
            console.log(err);
            res.send("there was an error see the console");
        }
        else {

             res.json(data);
        }
    });
});


router.post('/getScannedOutBeforePrediction',function (req,res,next) {
    var userId=req.body.userId;
    //inbox.getScannedOutPrediction(userId,function (data,err) {
    inbox.getPredictionsFeedback(userId,function (data,err) {

            if (err){
                console.log(err);
                //res.send("there was an error see the console");

            }
            else {
                console.log("data prediction update on inventory");
                var data = {"data":data.dataBefore};
                res.json(data);
            }

        });

});

router.post('/getScannedOutAfterPrediction',function (req,res,next) {
    var userId=req.body.userId;
    //inbox.getScannedOutPrediction(userId,function (data,err) {
    inbox.getPredictionsFeedback(userId,function (data,err) {
        if (err){
            console.log(err);
            //res.send("there was an error see the console");

        }
        else {
            console.log("data prediction update on inventory");
            var data = {"data":data.dataAfter};
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




/*
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
            moment.updateLocale(moment.locale(), { invalidDate: "Not available" })
            for (var i = 0; i < data.length; i++){
                data1.push({"id":data[i].id,"inventory_id":data[i].inventory_id,"added": moment(data[i].added).format('DD-MM-YYYY, HH:mm:ss'),"used_up": moment(data[i].used_up).format('DD-MM-YYYY, HH:mm:ss')});
            }
            var data= {"data":data1};
            res.send(data);



        }
    });

});
 */




//associate the minimal scanned in date with the minimal scanned out date
router.post('/getInOutEvents2',function (req,res,next) {
    var userId = req.body.userId;
    var inventoryId = req.body.inventoryId;

    in_events.get_allIn_by_user_and_inventory(userId, inventoryId, function (errIn, dataIn) {

        if (errIn) {
            console.log(errIn);
            res.send("there was an error see the console");
        }
        else {

            //console.log(dataIn);
            //res.send(dataIn);

            out_events.get_allOut_by_user_and_inventory(userId, inventoryId, function (errOut, dataOut) {
                var allDates = [];

                if (errOut) {
                    console.log(errOut);
                    if (errOut = 'Inventory id has no events') {

                        for (var i = 0; i < dataIn.length; i++) {
                            allDates.push({
                                "id": dataIn[i].id,
                                "inventory_id": dataIn[i].inventory_id,
                                "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                "used_up": null,
                                "daysUse": null

                            });
                        }
                        var data = {"data": allDates};
                        res.send(data);


                    }
                    else {
                        res.send("there was an error see the console");
                    }
                }
                else {

                    var jmin = 0;
                    var jmax = dataOut.length;
                    for (var i = 0; i < dataIn.length; i++) {

                        if (jmin < jmax) {
                            if (dataIn[i].timestamp < dataOut[jmin].timestamp) {

                                var startTime = moment(dataIn[i].timestamp);
                                var endTime = moment(dataOut[jmin].timestamp);
                                var diff = endTime.diff(startTime);
                                var duration = moment.duration(diff);
                                var daysUse = duration.asDays();

                                allDates.push({
                                    "id": dataIn[i].id,
                                    "inventory_id": dataIn[i].inventory_id,
                                    "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                    "used_up": moment(dataOut[jmin].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                    "daysUse": daysUse
                                })
                            }
                            else {

                                allDates.push({
                                    "id": dataIn[i].id,
                                    "inventory_id": dataIn[i].inventory_id,
                                    "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                    "used_up": null,
                                    "daysUse": null
                                });

                            }

                            jmin++;

                        }
                        else {
                            allDates.push({
                                "id": dataIn[i].id,
                                "inventory_id": dataIn[i].inventory_id,
                                "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                "used_up": null,
                                "daysUse": null

                            });
                        }

                    }

                    //get average and add prediction
                    var sum=0;
                    var count=0;
                    for (var i=0; i< allDates.length; i++){
                        if(allDates[i].daysUse) {
                            sum += parseFloat(allDates[i].daysUse);
                            count ++;
                        }
                    }
                    console.log('average:'+ (sum/count).toFixed() + ' days');

                    //take the last scanned-in date and add the average days to generate a predicted date
                    var averageDays = (sum/count).toFixed();
                    var lastScanIn = moment(allDates[allDates.length-1].added, "DD-MM-YYYY");
                    var predictedRunOut = moment(lastScanIn.add(averageDays,'days')).format('DD-MM-YYYY');
                    console.log(predictedRunOut);


                    var data = {"data": allDates,"predictedRunOut":predictedRunOut,"averageDays":averageDays};
                    //console.log(data);
                    res.send(data);

                }

            });


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


router.post('/getTotal_in_out',function(req,res,next){
    var userId = req.body.userId;
    console.log('get total in-out');

    var totalIn = 0;
    var totalOut = 0;
    in_events.getTotal_in(userId,function(err, dataIn){
        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {
            totalIn = dataIn[0].total_in;
            out_events.getTotal_out(userId,function(err, dataOut){
                if(err){
                    console.log(err);
                    res.send("there was an error see the console");
                }
                else {
                    totalOut =  dataOut[0].total_out;
                    var totalInOut = totalIn + totalOut ;
                    var reward = (totalInOut * 0.1).toFixed(2);
                    console.log("total:"+reward);
                    var data = {success:true, "totalInOut":totalInOut, "reward":reward};
                    //console.log(data);
                    //res.send(data);
                    res.json(data);

                }
            });

        }
    });

});


router.post('/userLog',function(req,res,next){

    var userId = req.body.userId;
    var timestamp = req.body.timestamp;
    var category =  req.body.category;
    var metadata = req.body.metadata;

    user_log.createNewUserLog(userId,category,timestamp,metadata,function(err, data){
        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {

            console.log(data);
            res.send(data);

        }
    });
});



//router.post('/editProduct',function(req,res,next){
//    var inventoryId = req.body.inventoryId;
//    var newStockLevel = req.body.newStockLevel;
//});


router.post('/stopTrack',function(req,res,next){
    var inventoryId = req.body.inventoryId;

});

//router.post('/outByUser',function(req,res,next){
//    var data = req.body;
//    //console.log(data);
//    res.json(data);
//
//});




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



router.get('/logout', function(req, res){
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
            //console.log(data);
            //res.send(data)
            res.render('login',{username:username,password:password});
        }
    });


});

//**
//*********************************************************************************************************************





module.exports = router;
