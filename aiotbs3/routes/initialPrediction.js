var request = require('request');

var products = require('../data_models/products');
var inventory = require('../data_models/inventory');
var in_events = require('../data_models/in_events.js');
var out_events = require('../data_models/out_events');
var moment = require('moment');
var prediction = require("../data_models/prediction.js");




exports.getInitialPrediction = function (userId, inventoryId,done) {
    var contador = 0;
    in_events.get_allIn_by_user_and_inventory(userId, inventoryId, function (errIn, dataIn) {

        if (errIn) {
            //console.log(errIn);
            //res.send("there was an error see the console");
            return done(errIn);
        }
        else {

            //console.log(dataIn);
            //res.send(dataIn);

            out_events.get_allOut_by_user_and_inventory(userId, inventoryId, function (errOut, dataOut) {
                var allDates = [];

                if (errOut) {
                    //console.log(errOut);
                    if (errOut = 'Inventory id has no events') {

                        for (var i = 0; i < dataIn.length; i++) {
                            allDates.push({
                                "id": dataIn[i].id,
                                "inventory_id": dataIn[i].inventory_id,
                                "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                "used_up": null,
                                "daysUse": null

                            });
                        }
                        var data = {"data": allDates};
                        return done(data);


                    }
                    else {

                        //res.send("there was an error see the console");
                        return done(data);
                    }
                }
                else {

                    var jmin = 0;
                    var jmax = dataOut.length;
                    for (var i = 0; i < dataIn.length; i++) {

                        if (jmin < jmax) {
                            if (dataIn[i].timestamp < dataOut[jmin].timestamp) {

                                var startTime = moment(dataIn[i].timestamp);
                                var endTime = moment(dataOut[jmin].timestamp);
                                var diff = endTime.diff(startTime);
                                var duration = moment.duration(diff);
                                var daysUse = duration.asDays();

                                allDates.push({
                                    "id": dataIn[i].id,
                                    "inventory_id": dataIn[i].inventory_id,
                                    "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                    "used_up": moment(dataOut[jmin].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                    "daysUse": daysUse
                                })
                            }
                            else {

                                allDates.push({
                                    "id": dataIn[i].id,
                                    "inventory_id": dataIn[i].inventory_id,
                                    "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                    "used_up": null,
                                    "daysUse": null
                                });

                            }

                            jmin++;

                        }
                        else {
                            allDates.push({
                                "id": dataIn[i].id,
                                "inventory_id": dataIn[i].inventory_id,
                                "added": moment(dataIn[i].timestamp).format('DD-MM-YYYY, HH:mm:ss'),
                                "used_up": null,
                                "daysUse": null

                            });
                        }

                    }

                    //get average days and add prediction
                    var sum=0;
                    var count=0;
                    for (var i=0; i< allDates.length; i++){
                        if(allDates[i].daysUse) {
                            sum += parseFloat(allDates[i].daysUse);
                            count ++;
                        }
                    }
                    console.log('average:'+ (sum/count).toFixed() + ' days');

                    //take the last scanned-in date and add the average days to generate a predicted date
                    var averageDays = (sum/count).toFixed();
                    //here add quantity, if I have two pints of milk then I have to add to the last scanned-in the average days X 2
                    var lastScanIn = moment(allDates[allDates.length-1].added, "DD-MM-YYYY");

                    //create a new prediction in table "prediction"
                    var timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    lastScanIn = moment(lastScanIn).format('YYYY-MM-DD HH:mm:ss');
                    var dateOne= moment(lastScanIn,"YYYY-MM-DD").add('days',averageDays);
                    var predictedRunOut2 = moment(dateOne).format('YYYY-MM-DD HH:mm:ss');


                    var data = {"data": allDates,"inventory_id":inventoryId,"predictedRunOut":predictedRunOut2,"averageDays":averageDays};

                    //updating inventory predicted date
                    inventory.updatePredictedNeedDate(inventoryId,predictedRunOut2,averageDays,function(err, dataInventory){

                        if(err){
                            //do something
                            console.log(err);
                            return done("error to update inventory, see the console");
                        }
                        else {
                            //get actual stock level
                            inventory.getInventoryById(inventoryId, function(err, dataInventoryId){

                                if(err){
                                    console.log(err);
                                    //res.send("there was an error see the console");
                                }
                                else {

                                    var stock_level =  dataInventoryId[0].stock_level;
                                    var metadata = allDates;
                                    prediction.createNew(timestamp,inventoryId,userId,averageDays,lastScanIn,predictedRunOut2,stock_level,metadata, function(err, data){
                                        if(err){
                                            console.log(err);
                                            return done("there was an error creating a new prediction see the console");
                                        }
                                        else {
                                            console.log(data);
                                            return done(data)
                                        }
                                    });
                                    //end create new prediction


                                }
                            });
                            //return done(data);//this return is from update inventory
                        }

                    });





                }

            });


        }
    });




}

