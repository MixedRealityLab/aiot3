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
    var dataBefore = [];
    var dataAfter = [];
    inventory_product.getScannedOut_prediction(userId,function(err, data){
        if(err){
            console.log(err);
            return done("there was an error see the console");
        }
        else {
            //scanned out before predicted date
            for (var i=0; i < data.length; i++) {
                if (data[i].last_scanned_out < data[i].predicted_need_date) {
                    dataBefore.push({
                        "product_id": data[i].product_id,
                        "inventory_id": data[i].inventory_id,
                        "description": data[i].description,
                        "user_id": data[i].user_id,
                        "stock_level": data[i].stock_level,
                        "predicted_need_date": data[i].predicted_need_date,
                        "stock_delta_day": data[i].stock_delta_day,
                        "need_trigger_stock_level": data[i].need_trigger_stock_level,
                        "last_scanned_out": data[i].last_scanned_out

                    });
                } else {
                    //scanned out after predicted date
                    if (data[i].last_scanned_out > data[i].predicted_need_date) {
                        dataAfter.push({
                            "product_id": data[i].product_id,
                            "inventory_id": data[i].inventory_id,
                            "description": data[i].description,
                            "user_id": data[i].user_id,
                            "stock_level": data[i].stock_level,
                            "predicted_need_date": data[i].predicted_need_date,
                            "stock_delta_day": data[i].stock_delta_day,
                            "need_trigger_stock_level": data[i].need_trigger_stock_level,
                            "last_scanned_out": data[i].last_scanned_out

                        });
                    }
                }

            }
            var data= {"dataBefore":dataBefore,"dataAfter":dataAfter};
            console.log("****8");
            console.log(data);
            return done(data);
        }
    });
}

