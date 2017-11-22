var request = require('request');

var products = require('../data_models/products');
var inventory = require('../data_models/inventory');
var in_events = require('../data_models/in_events.js');
var out_events = require('../data_models/out_events');
var moment = require('moment');



var getInitialPrediction = function (userId, inventoryId) {

    in_events.get_allIn_by_user_and_inventory(userId, inventoryId, function (errIn, dataIn) {

        if (errIn) {
            //console.log(errIn);
            //res.send("there was an error see the console");
            return errIn;
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
                        //res.send(data);
                        return data;


                    }
                    else {

                        //res.send("there was an error see the console");
                        return data;
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

                    //get average and add prediction
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
                    var lastScanIn = moment(allDates[allDates.length-1].added, "DD-MM-YYYY");
                    var predictedRunOut = moment(lastScanIn.add(averageDays,'days')).format('DD-MM-YYYY');
                    //console.log(predictedRunOut);




                    var data = {"data": allDates,"predictedRunOut":predictedRunOut,"averageDays":averageDays};
                    //console.log(data);
                    //res.send(data);
                    return data;

                }

            });


        }
    });




};

module.exports = getInitialPrediction;