var request = require('request');

var products = require('../data_models/products');
var inventory = require('../data_models/inventory');
var in_events = require('../data_models/in_events.js');




//router.get('/get_most_recent_for_user_IN_Description2', function(req, res, next) {

exports.get_most_recent_for_user_Description2 = function (user_id, number_of_products, done) {

    console.log("testing most recent");
    var userId = user_id;
    var qty= number_of_products;
    var allData = [];
    var count = 0;

    in_events.get_most_recent_for_user(userId,qty, function(err, data){

        if(err){
            console.log(err);
            return done(err);
        }
        else {

            var max = data.length;
            console.log('max data:'+ max);
            for (var i = 0; i < data.length; i++){

                var inventoryId = data[i].inventory_id;
                inventory.getInventoryById(inventoryId, function(err, dataInventory){

                    if(err){
                        console.log(err);
                        //res.send("there was an error see the console");
                        return done(err);
                    }
                    else {
                        var productId = dataInventory[0].product_id;
                        products.getProductById(productId, function(err, dataProduct){

                            if(err){
                                console.log(err);
                                //res.send("there was an error see the console");
                                return done(err);
                            }
                            else {
                                allData.push({
                                    "idInEvent":data[count].id,
                                    "user_id":userId,
                                    "inventory_id":data[count].inventory_id,
                                    "old_stock":data[count].old_stock,
                                    "new_stock":data[count].new_stock,
                                    "timestamp":data[count].timestamp,
                                    "id":dataInventory[0].id,
                                    "product_id":productId,
                                    "stock_level":dataInventory[0].stock_level,
                                    "predicted_need_date":dataInventory[0].predicted_need_date,
                                    "stock_delta_day":dataInventory[0].stock_delta_day,
                                    "need_trigger_stock_level":dataInventory[0].need_trigger_stock_level,
                                    "idProduct":dataProduct[0].id,
                                    "ean":dataProduct[0].ean,
                                    "brand_name":dataProduct[0].brand_name,
                                    "description":dataProduct[0].description,
                                    "multipack":dataProduct[0].multipack,
                                    "multipack_amount":dataProduct[0].multipack_amount,
                                    "quantity":dataProduct[0].quantity,
                                    "quantity_units":dataProduct[0].quantity_units,
                                    "metadata": dataProduct[0].metadata
                                });

                                count ++;

                            }
                            //console.log(allData);
                            if (max == count){
                                //res.send(allData);
                                return done(allData);

                            }

                        });

                    }
                });

            }

        }
    });
}
