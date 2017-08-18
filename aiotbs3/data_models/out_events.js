var db = require("./../db.js");
var schemas = require("./schemas.js");
var _ = require("lodash");

var Out_event = function (data) {
    //this.data = this.sanitize(data);
}

Out_event.add_event = function (inventory_id, old_stock_level, new_stock_level) {
	if(inventory_id == '0') {
		return({"status": "success"});
	}
	else {
		return ({"status": "fail", "error code": 101, "error message": "inventory entry does not exist"});	
	}
}

Out_event.get_most_recent_for_user = function (user_id, number_of_products) {
	if(userId == 1) {
		console.log('loading most recent scan in events from userId == 1');
		// how do I know about date/timestamp, I need the last 5 products added to the inventory.
		// TODO: Ask carolina which data she wants back here to prevent mutiple queries
		return ({
				  "data": [
				  { 	inventory_id: 0,
				  	description: "lemon tea",
				   	old_stock_level : "5",
				  	new_stock_level : "4",
				    	timestamp: "2017-04-11 08:40:05" 
				  },
				  { 
				  	inventory_id: 0,
					description: "coffee",
				  	old_stock_level : "4",
				  	new_stock_level : "3",
				    	timestamp: "2017-04-11 08:42:05" 
				  },
				  { 	inventory_id: 1,
				   	description: "lemon tea",
				  	old_stock_level : "4",
				  	new_stock_level : "3",
				    	timestamp: "2017-04-11 08:43:05" 
				  },
				  { 	inventory_id: 2,
				  	description: "lemon tea",
				   	old_stock_level : "2",
				  	new_stock_level : "1",
				    	timestamp: "2017-04-11 08:44:05" 
				  }
				  ]
				});

	}
	else {
		return ({"status": "fail", "error code": 101, "error message": "user does not exist"});
	}
}

module.exports = Out_event;
