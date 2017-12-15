var request = require('request');
var express = require('express');

var router = express.Router();

var products = require('../data_models/products');
var inventory = require('../data_models/inventory');
var inventory_product =  require('../data_models/inventory_product');
var in_events = require('../data_models/in_events.js');
var out_events = require('../data_models/out_events');
var moment = require('moment');


exports.getScannedOutPrediction = function (userId,done) {
//router.post('/getscannedout_prediction', function(req, res, next) {

    //var userId = 3;
    inventory_product.getScannedOut_prediction(userId,function(err, data){
        if(err){
            console.log(err);
            return done("there was an error see the console");
        }
        else {
            var data= {"data":data};
            return done(data);
        }
    });
}

