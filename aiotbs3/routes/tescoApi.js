var request = require('request');


exports.get_tesco_data = function (ean,callback) {

    eanSelected = '0'+ ean;
    var options = {
        method: 'GET',
        hostname: 'dev.tescolabs.com',
        //url: 'https://dev.tescolabs.com/product/?gtin=04548736003446', //05022996000135',
        url: 'https://dev.tescolabs.com/product/?gtin='+eanSelected, //05022996000135',
        headers: {
            'Ocp-Apim-Subscription-Key': 'd00f3cbe704e4aec8aa8fb91b94d43f0'
        },
        rejectUnauthorized: false
    };

    request(options, function (err, response, body) {

    if (err){
        console.log('error:', err);
        console.log('statusCode:', response && response.statusCode);
        var returnData= {"status": 'api fail', "msg":err};
        return callback(returnData);
    }
    else {
        console.log('*statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //var productsTesco = JSON.parse(body);
        var productsTesco = body;
        //console.log('** product details:**'+productsTesco);

        if (Object.keys(productsTesco).length == 22) { // if I don't get information from tesco API

            var returnData = {"status": 'fail', "msg": 'no data'};
            return callback(returnData);

        } else {

            //console.log(body);
            var returnData = JSON.parse(body);

            var quantity= 0;
            var quanitiy_unit=0;
            var netContent=0;

            if ("qtyContents" in returnData["products"][0]) {
                quantity= returnData["products"][0]["qtyContents"].quantity;
                quanitiy_unit=returnData["products"][0]["qtyContents"].quantityUom;
                netContent=returnData["products"][0]["qtyContents"].netContents;

            }

            else{
                quantity= 0;
                quanitiy_unit=0;
                netContent=0;
            }

            var dataCollection = {
                    ean: eanSelected,
                    tpnb: returnData["products"][0]["tpnb"],
                    tpnc: returnData["products"][0]["tpnc"],
                    brand_name: returnData["products"][0]["brand"],
                    description: (returnData["products"][0]["description"]).substring(0,49),
                    quantity: quantity,
                    quanitiy_unit: quanitiy_unit,
                    netContent: netContent,
                    //metadata:{'productCharacteristics':returnData["products"][0]["productCharacteristics"],
                    //'ingredients':returnData["products"][0]["ingredients"],
                    //'storage':returnData["products"][0]["storage"],
                    //'mkt':returnData["products"][0]["marketingText"],
                    //'pkgDimensions':returnData["products"][0]["pkgDimensions"]
                    //}
                    metadata:{'allData':returnData["products"][0]}



            };

            return callback(dataCollection);


        }
    }




    });

}