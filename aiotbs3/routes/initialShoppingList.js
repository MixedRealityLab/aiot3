var request = require('request');

var products = require('../data_models/products');
var inventory_product = require('../data_models/inventory_product');
var moment = require('moment');


exports.getInitialShoppingList = function (userId,done) {

    inventory_product.getOutStock(userId,function(err,dataOut){
        if(err){
            console.log(err);
            //res.send("there was an error");
            //var data= {"data":{}};
            var data=[{"description":"Not available","stock":"Not available"}];
            res.json(data);

        }
        else{
            var allDataIn_Out=[];
            //var dataOut= {"data":data};

            //get in stock based on prediction
            inventory_product.getInStock_based_onPredictions(userId,function(err, dataIn){
                if(err){
                    console.log(err);
                    //var data=[{"description":"Not available","stock":"Not available"}];
                    console.log("no in_stock data available");
                    for (var i = 0; i < dataOut.length; i++) {
                        allDataIn_Out.push({
                            "inventory_id": dataOut[i].inventory_id,
                            "product_id": dataOut[i].product_id,
                            "user_id": dataOut[i].user_id,
                            "description":dataOut[i].description,
                            "ean":dataOut[i].ean,
                            "stock_level":dataOut[i].stock_level,
                            "stock": 'Out-of-Stock'
                        });
                    }

                    return done(allDataIn_Out);
                }
                else {
                    console.log(dataIn);
                    //res.json(data);

                    for (var i = 0; i < dataOut.length; i++) {
                        allDataIn_Out.push({
                            "inventory_id": dataOut[i].inventory_id,
                            "product_id": dataOut[i].product_id,
                            "user_id": dataOut[i].user_id,
                            "description":dataOut[i].description,
                            "ean":dataOut[i].ean,
                            "stock_level":dataOut[i].stock_level,
                            "stock": 'Out-of-Stock'
                        });
                    }

                    for (var i = 0; i < dataIn.length; i++) {
                        allDataIn_Out.push({
                            "inventory_id": dataIn[i].inventory_id,
                            "product_id": dataIn[i].product_id,
                            "user_id": dataIn[i].user_id,
                            "description":dataIn[i].description,
                            "ean":dataIn[i].ean,
                            "stock_level":dataIn[i].stock_level,
                            "stock": dataIn[i].stock
                        });
                    }



                    return done(allDataIn_Out);
                }
            });
            //res.json(data);
        }
    });

}