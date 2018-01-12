var request = require('request');
var express = require('express');

var router = express.Router();
var predictions_usage = require('../data_models/predictions_usage');
var prediction =  require('../data_models/prediction');
var moment = require('moment');


exports.getScannedOutPrediction = function (userId,done) {
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
            console.log("****8");
            console.log(data);
            return done(data);
        }
    });
}


/*"timestamp":data[i].timestamp,
"inventory_id": data[i].inventory_id,
    "user_id": data[i].user_id,
    "days_average": data[i].days_average,
    "last_scanIn":data[i].last_scanIn,
    "last_scanOut":data[i].last_scanOut,
    "predicted_need_date": data[i].predicted_need_date,
    "stock_level": data[i].stock_level,
    "metadata": data[i].need_trigger_stock_level,
    "feedback_status":,
"feedback":,
"feedback_timestamp":,
"feedback_after_before"
*/


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
