var request = require('request');
var express = require('express');

var router = express.Router();
var prediction =  require('../data_models/prediction');
var categories = require('../data_models/categories');
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
    var dataBefore= [];
    var dataBeforeCat = [];
    var dataAfter = [];
    var dataAfterCat = [];

    prediction.getPredictionsForUser2(userId,function(err, data){
        if(err){
            console.log(err);
            console.log("there was an error getting predictions from that specific user");
            //res.send("there was an error see the console");
        }
        else {

            for (var i=0; i < data.length; i++) {
                if (data[i].early_late ==0) {
                    if (data[i].category_id!=null){
                        dataBeforeCat.push({
                            "product_id": data[i].product_id,
                            "description_product": data[i].description,
                            "prediction_id": data[i].id,
                            "inventory_id": data[i].inventory_id,
                            "category_id": data[i].category_id,
                            "description":data[i].CAT2
                        });


                    }
                    else {
                        dataBefore.push({
                            "product_id": data[i].product_id,
                            "description": data[i].description,
                            "prediction_id": data[i].id,
                            "inventory_id": data[i].inventory_id,
                            "category_id": data[i].category_id,
                            "category_description":data[i].CAT2
                        });

                    }
                } else {
                    //scanned out after predicted date
                    if (data[i].early_late ==1) {
                        if (data[i].category_id!=null){
                            dataAfterCat.push({
                                "product_id": data[i].product_id,
                                "description_product": data[i].description,
                                "prediction_id":data[i].id,
                                "inventory_id":data[i].inventory_id,
                                "category_id":data[i].category_id,
                                "description":data[i].CAT2
                            });


                        }
                        else{
                            dataAfter.push({
                            "product_id": data[i].product_id,
                            "description": data[i].description,
                            "prediction_id":data[i].id,
                            "inventory_id":data[i].inventory_id,
                            "category_id":data[i].category_id,
                            "category_description":data[i].CAT2
                            });
                        }

                    }
                }

            }


            //grouping all
            var data= {"dataBefore":dataBefore ,"dataAfter":dataAfter,"dataBeforeCat":dataBeforeCat, "dataAfterCat":dataAfterCat };

            /*
            var dataBeforeAll = [];
            var dataAfterAll = [];

            for(var i =0; i<data.dataBeforeCat.length; i++){
                dataBeforeAll.push({
                    "product_id": data.dataBeforeCat[i].product_id,
                    "description": data.dataBeforeCat[i].description,
                    "prediction_id":data.dataBeforeCat[i].id,
                    "inventory_id":data.dataBeforeCat[i].inventory_id,
                    "category_id":data.dataBeforeCat[i].category_id,
                    "category_description":data.dataBeforeCat[i].category_description
                });

            }

            for(var i =0; i<data.dataBefore.length; i++){
                dataBeforeAll.push({
                    "product_id": data.dataBefore[i].product_id,
                    "description": data.dataBefore[i].description,
                    "prediction_id":data.dataBefore[i].id,
                    "inventory_id":data.dataBefore[i].inventory_id,
                    "category_id":data.dataBefore[i].category_id,
                    "category_description":data.dataBefore[i].category_description
                });

            }

            for(var i =0; i<data.dataAfterCat.length; i++){
                dataAfterAll.push({
                    "product_id": data.dataAfterCat[i].product_id,
                    "description": data.dataAfterCat[i].description,
                    "prediction_id":data.dataAfterCat[i].id,
                    "inventory_id":data.dataAfterCat[i].inventory_id,
                    "category_id":data.dataAfterCat[i].category_id,
                    "category_description":data.dataAfterCat[i].category_description
                });

            }

            for(var i =0; i<data.dataAfter.length; i++){
                dataAfterAll.push({
                    "product_id": data.dataAfter[i].product_id,
                    "description": data.dataAfter[i].description,
                    "prediction_id":data.dataAfter[i].id,
                    "inventory_id":data.dataAfter[i].inventory_id,
                    "category_id":data.dataAfter[i].category_id,
                    "category_description":data.dataAfter[i].category_description
                });

            }



            var data = {"dataBefore":dataBeforeAll,"dataAfter":dataAfterAll};
            */
            console.log(data);

            return done(data);
            //res.send(data);
        }
    });

}
