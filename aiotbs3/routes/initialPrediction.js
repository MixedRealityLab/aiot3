var request = require('request');

var products = require('../data_models/products');
var inventory = require('../data_models/inventory');
var in_events = require('../data_models/in_events.js');
var out_events = require('../data_models/out_events');
var moment = require('moment');
var prediction = require("../data_models/prediction.js");




exports.getInitialPrediction = function (userId, inventoryId,done) {
    var contador = 0;
    var categoryId = null;
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
                                //"added": moment(dataIn[i].timestamp).format('DD-MM-YYYY HH:mm:ss'),
                                "added": moment(dataIn[i].timestamp).format('YYYY-MM-DD HH:mm:ss'),
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
                                    //"added": moment(dataIn[i].timestamp).format('DD-MM-YYYY HH:mm:ss'),
                                    //"used_up": moment(dataOut[jmin].timestamp).format('DD-MM-YYYY HH:mm:ss'),
                                    "added": moment(dataIn[i].timestamp).format('YYYY-MM-DD HH:mm:ss'),
                                    "used_up": moment(dataOut[jmin].timestamp).format('YYYY-MM-DD HH:mm:ss'),
                                    "daysUse": daysUse
                                })
                            }
                            else {

                                allDates.push({
                                    "id": dataIn[i].id,
                                    "inventory_id": dataIn[i].inventory_id,
                                    //"added": moment(dataIn[i].timestamp).format('DD-MM-YYYY HH:mm:ss'),
                                    "added": moment(dataIn[i].timestamp).format('YYYY-MM-DD HH:mm:ss'),
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
                                //"added": moment(dataIn[i].timestamp).format('DD-MM-YYYY HH:mm:ss'),
                                "added": moment(dataIn[i].timestamp).format('YYYY-MM-DD HH:mm:ss'),
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


                    //get lastScanOut
                    var lastScanOut = allDates[allDates.length-1].used_up;
                    var i = allDates.length-1;
                    while(!lastScanOut && i>=0){
                        lastScanOut = allDates[i-1].used_up;
                        console.log("lasScanOut "+ i + ":"+ lastScanOut);
                        i--;

                    }

                    console.log('average:'+ (sum/count).toFixed() + ' days');

                    //take the last scanned-in date and add the average days to generate a predicted date
                    var averageDays = (sum/count).toFixed();
                    //here add quantity, if I have two pints of milk then I have to add to the last scanned-in the average days X 2
                    var lastScanIn = moment(allDates[allDates.length-1].added, "YYYY-MM-DD HH:mm:ss");

                    //create a new prediction in table "prediction"
                    var timestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                    //format lastScanIn
                    lastScanIn = moment(lastScanIn).format('YYYY-MM-DD HH:mm:ss');
                    //format lastScanOut
                    lastScanOut = moment(lastScanOut).format('YYYY-MM-DD HH:mm:ss');

                    var dateOne= moment(lastScanIn,"YYYY-MM-DD").add('days',averageDays);
                    var predictedRunOut2 = moment(dateOne).format('YYYY-MM-DD HH:mm:ss');

                    var feedback_status = 0; //0=no activity 1=activity
                    var feedback = null;
                    var feedback_timestamp = null;
                    var feedback_after_before = 0; //0=no activity, 1=after, 2= before

                    var data = {"data": allDates,"inventory_id":inventoryId,"predictedRunOut":predictedRunOut2,"averageDays":averageDays};

                    console.log("lastScanOut added:"+lastScanOut);
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
                                    prediction.createNew(timestamp,inventoryId,userId,averageDays,lastScanIn,lastScanOut,predictedRunOut2,stock_level,metadata,feedback_status,feedback, feedback_timestamp, feedback_after_before,categoryId, function(err, data){
                                        if(err){
                                            console.log("prediction probleme"+data);
                                            console.log(err);
                                            return done("there was an error creating a new prediction see the console");
                                        }
                                        else {

                                            //console.log(data);
                                            console.log("prediction added");
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

