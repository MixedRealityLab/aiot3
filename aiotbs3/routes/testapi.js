var express = require('express');
var router = express.Router();
var db = require("../db/mysql.js");
var moment = require('moment')

var in_events = require('../data_models/in_events.js')
var inventory = require('../data_models/inventory.js')
var inventory_usage_events = require('../data_models/inventory_usage_events.js')
var out_events = require('../data_models/out_events.js')
var products = require('../data_models/products.js')
var user = require('../data_models/user.js')
var user_event_log = require('../data_models/user_event_log.js')


router.get('/drop_all', function(req, res, next) {

  db.drop(["user"], function(data) {
  	res.send(200);
  });
  
});

router.get('/add_user', function(req, res, next) {
  console.log("testing database");

  user.createNew("james","test", function(err, data){
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

  user.login("foo","bar888", function(err, data){
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

router.get('/add_product', function(req, res, next) {
  console.log("testing database");
  metadata = {'tin size': '400g', "ingredients": ['tomatoes', 'water', 'salt']};
  products.createNew("12344447891","Bob","Baked Beans",1, 4, 1, "tin(s)", metadata, function(err, data){	
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


router.get('/get_product_by_ean', function(req, res, next) {
  console.log("testing database");

  products.getProductByEan("1234567891", function(err, data){
    
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

  products.getProductById(2, function(err, data){
    
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

router.get('/add_inventory', function(req, res, next) {
  console.log("testing database");
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  inventory.createNew(1,3,1,mysqlTimestamp,1,1, function(err, data){ 
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

  inventory.getInventoryByUserProduct(1,3, function(err, data){
    
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

  inventory.getInventoryById(1, function(err, data){
    
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

  inventory.updateInventoryListingStock(2,4, function(err, data){
    
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

router.get('/get_last_5_out_events', function(req, res, next) {
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

router.get('/add_in_event', function(req, res, next) {
  console.log("testing database");
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  in_events.add_event(2,1,3,2,mysqlTimestamp, function(err, data){ 
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

router.get('/get_last_5_in_events', function(req, res, next) {
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

module.exports = router;

