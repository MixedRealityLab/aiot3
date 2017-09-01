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

  user.createNew("foo","bar", function(err, data){
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

  user.login("foo","bar", function(err, data){
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
  products.createNew("1234567891","Heinz","Baked Beans",1, 4, 1, "tin(s)", metadata, function(err, data){	
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

  products.getProductByEan("1234567890", function(err, data){
    
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

router.get('/add_inventory', function(req, res, next) {
  console.log("testing database");
  var mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
  inventory.createNew(1,5,1,mysqlTimestamp,1,1, function(err, data){ 
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

