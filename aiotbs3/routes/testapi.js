var express = require('express');
var router = express.Router();
var db = require("../db/mysql.js");
var moment = require('moment');

var in_events = require('../data_models/in_events.js');
var inventory = require('../data_models/inventory.js');
var inventory_usage_events = require('../data_models/inventory_usage_events.js');
var inventory_product = require('../data_models/inventory_product.js');
var out_events = require('../data_models/out_events.js');
var products = require('../data_models/products.js');
var user = require('../data_models/user.js');
var user_event_log = require('../data_models/user_event_log.js');
var tescoData = require("./tescoApi.js");


router.get('/drop_all', function(req, res, next) {

  db.drop(["user"], function(data) {
  	res.send(200);
  });
  
});


//***************************************** user.js ********************************************************************

router.get('/add_user', function(req, res, next) {
  console.log("testing database");

  user.createNew("test1","test", function(err, data){
  	if(err){
      console.log(err);
      res.send("there was an error see the console");
    }
    else {
      console.log(data);
      res.send(data)
    }
  });
});

router.get('/login', function(req, res, next) {
  console.log("testing database");

  user.login("test1","test", function(err, data){
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

router.get('/login1', function(req, res, next) {
  console.log("testing database");

  user.login("foo1","bar1", function(err, data){
  	
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

//**********************************************************************************************************************





// ********************************************** Products *************************************************************
router.get('/add_product', function(req, res, next) {
  console.log("testing database");
  metadata = {'tin size': '400g', "ingredients": ['tomatoes', 'water', 'salt']};
  products.createNew("1234567896","Bob","Baked Beans",1, 4, 1, "tin(s)", metadata, function(err, data){
  	if(err){
  		console.log(err);
  		res.send("there was an error see the console");
  	}
  	else {
  		console.log(data);
  		console.log(data.insertId);
  		res.send(data);
  	}
  });
});


router.get('/get_product_by_ean', function(req, res, next) {
  console.log("testing database");

  products.getProductByEan("12344447893", function(err, data){
    
    if(err){
      console.log(err);
      res.send("there was an error see the console");
    }
    else {
      console.log(data[0].ean);
      console.log(data[0].id);
      res.send(data);
    }

    
    
  });
});

router.get('/get_product_by_ean_2', function(req, res, next) {
  console.log("testing database");

  products.getProductByEan("1235557890", function(err, data){
    
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

router.get('/get_product_by_id', function(req, res, next) {
  console.log("testing database");

  products.getProductById(10, function(err, data){
    
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

//**********************************************************************************************************************



// ********************************************** Inventory ************************************************************
router.get('/add_inventory', function(req, res, next) {
  console.log("testing database");
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  inventory.createNew(1,16,1,mysqlTimestamp,1,1, function(err, data){
    if(err){
      console.log(err);
      res.send("there was an error see the console");
    }
    else {
      console.log(data);
      console.log(data.insertId);
      //console.log(data[0].id);

      res.send(data);
    }
  });
});

router.get('/get_inventory_by_user', function(req, res, next) {
  console.log("testing database");

  inventory.getInventoryForUser(1, function(err, data){
    
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

router.get('/stop_tracking', function(req, res, next) {
  console.log("testing database");

  inventory.stopTracking(4, function(err, data){
    
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

router.get('/get_inventory_by_user_product', function(req, res, next) {
  console.log("testing database");

  inventory.getInventoryByUserProduct(1,1, function(err, data){
    
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

router.get('/get_inventory_by_id', function(req, res, next) {
  console.log("testing database");

  inventory.getInventoryById(3, function(err, data){
    
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



router.get('/update_inventory_listing_stock', function(req, res, next) {
  console.log("testing database");

  inventory.updateInventoryListingStock(3,4, function(err, data){
    
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





router.get('/getInventoryData',function (req, res, next) {
    inventory_product.getInStock(2,function(err,data){
        if(err){
            console.log(err);
            res.send("there was an error");

        }
        else{

            console.log('**inventory length***'+ data.length);
            res.send(data);
        }
    });
});






//**********************************************************************************************************************



// ********************************************** out_events ************************************************************


router.get('/add_out_event', function(req, res, next) {
  console.log("testing database");
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  out_events.add_event(2,1,3,2,1,mysqlTimestamp, function(err, data){ 
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


router.get('/getInventoryDataOut',function (req,res,next) {

    //var userId = req.body.userId;
    var userId = 1;
    var dataArray = [];
    //var data = {description: "xxx", lastAdded: "07/07/27", usedUp: "16/08/17"};
    out_events.get_most_recent_for_user(userId,5000, function(err, data){

        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {
            //console.log(data);
            for (i in data){
              var obj= data[i];
              var outId = data[i].id;
              var inventoryId = data[i].inventory_id;

              inventory.getInventoryById(inventoryId, function(err, dataInv){
                  if(err){
                      console.log(err);
                      res.send("there was an error see the console");
                  }
                  else {
                      //console.log(dataInv);
                      //res.send(data);
                      for (j in dataInv){
                        var productId = dataInv[j].product_id;

                        products.getProductById(productId, function(err, dataProduct){

                            if(err){
                                console.log(err);
                                res.send("there was an error see the console");
                            }
                            else {
                                for (x in dataProduct){
                                  var pdrDescription = dataProduct[x].description;

                                  item = {};
                                  item ["description"] = pdrDescription;
                                  item ["productId"] = productId;
                                  item ["inventoryId"] = inventoryId;
                                  item ["outId"] = outId;

                                  dataArray.push(item);


                                }

                                console.log(dataArray);
                            }
                        });


                      }
                  }
              });

            }
            res.send(data);
        }
    });



});




router.get('/getOutStock', function(req, res, next) {
    console.log("testing database");

    inventory_product.getOutStock(3,function(err, data){

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



router.get('/get_most_recent_for_user_OUT', function(req, res, next) {
  console.log("testing database");

  out_events.get_most_recent_for_user(1,5, function(err, data){
    
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



router.get('/get_most_recent_for_user_OUT_description', function(req, res, next) {
    console.log("testing database");

    out_events.get_most_recent_for_user_Description(1,5, function(err, data){

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


router.get('/get_most_recent_for_inventory_OUT', function(req, res, next) {
    console.log("testing database");

    out_events.get_most_recent_for_inventory(1,5, function(err, data){

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

//**********************************************************************************************************************


//*********************************************   in_events ***********************************************************

router.get('/add_in_event', function(req, res, next) {
  console.log("testing database");
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  in_events.add_event(7,1,3,2,mysqlTimestamp, function(err, data){
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

router.get('/get_most_recent_for_user_IN', function(req, res, next) {
  console.log("testing database");

  in_events.get_most_recent_for_user(1,5, function(err, data){
    
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

router.get('/get_most_recent_for_user_IN_Description', function(req, res, next) {
    console.log("testing database");

    in_events.get_most_recent_for_user_Description(1,5, function(err, data){

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



router.get('/get_most_recent_for_inventory_IN',function (req,res, next) {
    console.log("testing database");
    in_events.get_most_recent_for_inventory(22,5000,function(err, data){


        if(err){
            console.log(err);
            res.send("there was an error see the console");
        }
        else {
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
  

router.get('/tescoApitest', function (req,res,next) {
    console.log("testing tesco api response");
    tescoData.get_tesco_data("177103088",function (data, err) {
    //tescoData.get_tesco_data("070177103088",function (data, err) {
            if (data.status == 'fail'){
                console.log('ean code not found');
                console.log(err);
                res.send(data);
            }
            else{
                console.log('ean code  found');
                console.log(data);
                res.send(data);
                //console.log(data[0].brand_name);
            }


        });


});



router.get('/getin_out',function (req,res,next) {
    inventory_product.getInOutEvents(3,99,function (err,data) {

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


router.get('/getFirstIn', function(req, res, next) {
    console.log("testing database");

    inventory_product.getFirstIn(3,99,function(err, data){

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

module.exports = router;

