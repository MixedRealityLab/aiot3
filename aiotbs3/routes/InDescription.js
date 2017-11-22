var request = require('request');

var products = require('../data_models/products');
var inventory = require('../data_models/inventory');
var in_events = require('../data_models/in_events.js');






exports.get_most_recent_for_user_Description2 = function (user_id, number_of_products, done) {
    console.log("testing description 2");
    var userId = user_id;
    var qty= number_of_products;

    in_events.get_most_recent_for_user(userId,qty, function(err, data) {

        if(err){
            console.log(err);
            return done(err);

        }
        else{

            for (var i = 0; i < data.length; i++) {
                //var id = data[i].id;
                var inventoryId = data[i].inventory_id;

                inventory.getInventoryById(inventoryId, function(err, dataInventory){
                    if(err){
                        console.log(err);
                        //res.send("there was an error see the console");
                        return done(err);

                    }else{

                        for (var i = 0; i < data.length; i++) {
                            var id = data[i].inventory_id;
                            for (var j = 0; j < dataInventory.length; j++) {
                                if (dataInventory[j].id = id) {
                                    for (var key in dataInventory[j]) {
                                        data[i][key] = dataInventory[j][key];
                                    }
                                    break;
                                }
                            }
                        }
                        console.log('***');
                        console.log(data);


                    }
                });


            }

            return done(data);
        }

    });





    }



/*exports.get_most_recent_for_user_Description2 = function (user_id, number_of_products, done) {

    console.log("testing description 2");
    var userId = user_id;
    var qty= number_of_products;
    var allData = [];
    var count = 0;
    var count2 = 0;

    in_events.get_most_recent_for_user(userId,qty, function(err, data){

        if(err){
            console.log(err);
            return done(err);
        }
        else {

            var maxData = data.length;
            console.log('max data:'+ maxData);
            allData.push(data);
            //for (var i = 0; i < data.length; i++){

            for(i in data){

                var inventoryId = data[i].inventory_id;

                inventory.getInventoryById(inventoryId, function(err, dataInventory){
                    if(err){
                        console.log(err);
                        //res.send("there was an error see the console");
                        //return done(err);

                    }else{
                        console.log('#:'+count2);
                        console.log('inEventId:'+ data[count2].id);
                        console.log('inEventInventory:'+ data[count2].inventory_id);
                        console.log('InventoryId: ' + dataInventory[0].id);
                        console.log('productId: ' + dataInventory[0].product_id);


                        (for j in dataInventory){
                            if
                        }




                        count2 ++;

                        //console.log('id' + data[i].id);
                        //console.log('inventoryId: ' + data[i].inventory_id);
                        //console.log('productId' + dataInventory[0].product_id);



                    }

                });


            }




            /*while(i < maxData){
                var inventoryId = data[i].inventory_id;
                var inEvent = data[i].id;

                inventory.getInventoryById(inventoryId, function(err, dataInventory){

                    if(err){
                        console.log(err);
                        //res.send("there was an error see the console");
                        return done(err);
                    }
                    else {
                        var inventoryId = dataInventory[0].id;
                        var productId = dataInventory[0].product_id;
                        console.log('#:'+i);
                        console.log('inEvent id:'+inEvent);
                        console.log('inventory id:'+inventoryId);
                        console.log('product id:'+ productId);

                        //var stock= dataInventory[0].stock_level;
                        //var predicted= dataInventory[0].predicted_need_date;
                        //var stock_delta=dataInventory[0].stock_delta_day;
                        //var need_trigger = dataInventory[0].need_trigger_stock_level;




                        products.getProductById(productId, function(err, dataProduct){

                            if(err){
                                console.log(err);
                                //res.send("there was an error see the console");
                                return done(err);
                            }
                            else {
                                var productId = dataProduct[0].id;
                                allData.push({
                                    "idInEvent":data[count].id,
                                    "user_id":userId,
                                    "inventory_id":data[count].inventory_id,
                                    "old_stock":data[count].old_stock,
                                    "new_stock":data[count].new_stock,
                                    "timestamp":data[count].timestamp,
                                    "inventory_id2": inventoryId,
                                    "product_id":productId,
                                    //"stock_level":stock,
                                    //"predicted_need_date":predicted,
                                    //"stock_delta_day":stock_delta,
                                    //"need_trigger_stock_level":need_trigger,
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
                            if (maxData == count){
                                //res.send(allData);
                                return done(allData);

                            }

                        });

                    }
                });
                i++;

            }*/

      //  }
        //return done(data);
    //});

//}
