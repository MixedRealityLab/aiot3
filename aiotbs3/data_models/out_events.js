var db = require("../db/mysql.js");

exports.add_event = function (inventory_id, user_id, old_stock, new_stock, wasted, timestamp, done) {
	

	db.get().query("INSERT INTO out_event SET ?", 
    {
        "inventory_id": inventory_id,
        "user_id": user_id,
        "old_stock": old_stock,
        "new_stock": new_stock,
        "wasted": wasted,
        "timestamp": timestamp

    }, function(err, rows) {
        if (err)
            return done(err);
        else
            return done(null,rows);
    }
    );

}

exports.get_most_recent_for_user = function (user_id, number_of_products, done) {
	
	var params = [user_id, number_of_products];
    db.get().query("SELECT * FROM out_event where user_id = ? order by timestamp desc limit ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("User id has no events"));
            //return done("error");
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
            //return done("error");

        }
        
    }); 

}



exports.get_most_recent_for_user_Description = function (user_id, number_of_products, done) {

    var params = [user_id, number_of_products];
    db.get().query("select * FROM out_event,inventory,product where out_event.user_id = ? and out_event.inventory_id=inventory.id and inventory.product_id=product.id order by out_event.timestamp desc limit ?", params, function (err, rows) {

        console.log(rows);
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("User id has no events"));
            //return done("error");
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
            //return done("error");

        }

    });

}




exports.get_most_recent_for_inventory = function (inventory_id, number_of_products, done) {

    var params = [inventory_id, number_of_products];
    db.get().query("SELECT * FROM out_event where inventory_id = ? limit ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("Inventory id has no events"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }
        
    }); 
    
}



exports.get_allOut_by_user_and_inventory = function (user_id,inventory_id, done) {

    var params = [user_id,inventory_id];
    db.get().query("select * from out_event where user_id=? and inventory_id=? order by timestamp asc", params, function (err, rows) {

        console.log(rows);
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("Inventory id has no events"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    });

}


exports.getTotal_out = function (user_id, done) {

    var params = [user_id];
    db.get().query("select count(out_event.id) as 'total_out' from out_event where out_event.user_id = ?", params, function (err, rows) {

        console.log(rows);
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("user_id  has no out_events"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    });

}

exports.get_allOut_by_user_and_category = function (user_id,category_id,done) {

    var params = [category_id,user_id];
    db.get().query("SELECT * from out_event where inventory_id IN(select categorised_inventory.inventory_id\n" +
        "from categorised_inventory, categories\n" +
        "where categorised_inventory.category_id = categories.id\n" +
        "and categorised_inventory.category_id= ?\n" +
        "and user_id= ?) order by timestamp asc ", params, function (err, rows) {

        console.log(rows);
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("Inventory id has no events"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    });

}
