var db = require("./../db.js");
var schemas = require("./schemas.js");
var _ = require("lodash");

var Invetory = function (data) {
    this.data = this.sanitize(data);
}

Inventory.getProductsForUser = function (userId) {
	if(userId == 1) {

	}
	else {
		
	}
}



module.exports = Inventory