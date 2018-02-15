var request = require('request');
var express = require('express');

var router = express.Router();
var prediction =  require('../data_models/prediction');
var moment = require('moment');


/*exports.getScannedOutPrediction = function (userId,done) {
    var dataBefore = [];
    var dataAfter = [];
    predictions_usage.getScannedOut_prediction(userId,function(err, data){
        if(err){
            console.log(err);
            return done("there was an error see the console");
        }
        else {
            //scanned out before predicted date
            for (var i=0; i < data.length; i++) {
                if (data[i].last_scanned_out < data[i].predicted_need_date && data[i].stock_level==0) {
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
                    if (data[i].last_scanned_out > data[i].predicted_need_date && data[i].stock_level==0) {
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
            console.log(data);
            return done(data);
        }
    });
}*/



//getting prediction to show as inbox notifications
exports.getPredictionsFeedback =  function (userId,done) {
    var dataBefore = [];
    var dataAfter = [];

    prediction.getPredictionsForUser(userId,function(err, data){
        if(err){
            console.log(err);
            //res.send("there was an error see the console");
        }
        else {

            for (var i=0; i < data.length; i++) {
                if (data[i].early_late ==0) {
                    dataBefore.push({
                        "product_id": data[i].product_id,
                        "description": data[i].description,
                        "prediction_id":data[i].id,
                        "inventory_id":data[i].inventory_id
                    });
                } else {
                    //scanned out after predicted date
                    if (data[i].early_late ==1) {
                        dataAfter.push({
                            "product_id": data[i].product_id,
                            "description": data[i].description,
                            "prediction_id":data[i].id,
                            "inventory_id":data[i].inventory_id

                        });
                    }
                }

            }

            console.log(data);
            //res.send(data);
            var data= {"dataBefore":dataBefore,"dataAfter":dataAfter};
            console.log(data);
            return done(data);
        }
    });

}


//getting prediction to show as inbox notifications, adding grouped categories
exports.getPredictionsFeedback2 =  function (userId,done) {
    var dataBefore = [];
    var dataAfter = [];

    prediction.getPredictionsForUser(userId,function(err, data){
        if(err){
            console.log(err);
            console.log("there was an error getting predictions from that specific user");
            //res.send("there was an error see the console");
        }
        else {

            //from data get inventory_id's
            //identify if that inventory is grouped or not
            //if isn't grouped
                //go to complete data before/after array
            //if is grouped
                //get the category
                //get all other inventory ids for that category
                    //group by that category
                    //identify if is data before or after



            for (var i=0; i < data.length; i++) {
                if (data[i].early_late ==0) {
                    dataBefore.push({
                        "product_id": data[i].product_id,
                        "description": data[i].description,
                        "prediction_id":data[i].id,
                        "inventory_id":data[i].inventory_id
                    });
                } else {
                    //scanned out after predicted date
                    if (data[i].early_late ==1) {
                        dataAfter.push({
                            "product_id": data[i].product_id,
                            "description": data[i].description,
                            "prediction_id":data[i].id,
                            "inventory_id":data[i].inventory_id

                        });
                    }
                }

            }

            console.log(data);
            //res.send(data);
            var data= {"dataBefore":dataBefore,"dataAfter":dataAfter};
            console.log(data);
            return done(data);
        }
    });

}