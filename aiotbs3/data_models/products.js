var db = require("../db/db.js");
var schemas = require("./schemas.js");
var _ = require("lodash");

var Product = function (data) {
    this.data = this.sanitize(data);
}

Product.getProductByEan = function (ean) {
	if(ean == '1234567890') {
		return({"status": "success", "data": {
			EAN: '1234567890',
	    	brand_name: 'Heinz',
	    	description: 'Baked Beans',
	    	multipack: true,
	    	multipack_amount: 4,
	    	quantity: 1,
	    	quanitiy_unit: 'tin(s)',
	    	metadata: {'tin size': '400g', "ingredients": ['tomatoes', 'water', 'salt']}}});
	}
	else {
		return ({"status": "fail", "error code": 101, "error message": "product does not exist"});	
	}
}

Product.addNewProduct = function (ean, productData) {
	if(ean == '1234567890') {
		return ({"status": "fail", "error code": 102, "error_message": "product EAN already in the system"});
	}
	else {
		return ({"status": "success", "message": "product with EAN " + ean +" has been added to the system"});
	}
}


module.exports = Product;