var db = require("../db/mysql.js");

exports.add_event = function (inventory_id, user_id, old_stock, new_stock, timestamp, done) {
	
	db.get().query("INSERT INTO in_event SET ?", 
    {
        "inventory_id": inventory_id,
        "user_id": user_id,
        "old_stock": old_stock,
        "new_stock": new_stock,
        "timestamp": timestamp

    }, function(err, rows) {
        if (err)
            return done(err);
        else
            return done(null,rows)
    }
    );

}


exports.get_most_recent_for_user = function (user_id, number_of_products, done) {

	var params = [user_id, number_of_products];
    db.get().query("SELECT * FROM in_event where user_id = ? order by timestamp desc limit ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("User id has no events"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }
        
    }); 
}



exports.get_most_recent_for_user_Description = function (user_id, number_of_products, done) {

    var params = [user_id, number_of_products];
    db.get().query("select * FROM in_event,inventory,product where in_event.user_id = ? and in_event.inventory_id=inventory.id and inventory.product_id=product.id order by in_event.timestamp desc limit ?", params, function (err, rows) {

        console.log(rows);
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("User id has no events"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    });
}








exports.get_most_recent_for_inventory = function (inventory_id, number_of_products, done) {

    var params = [inventory_id, number_of_products];
    db.get().query("SELECT * FROM in_event where inventory_id = ? limit ?", params, function (err, rows) {
        
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




exports.get_allIn_by_user_and_inventory = function (user_id,inventory_id, done) {

    var params = [user_id,inventory_id];
    db.get().query("select * from in_event where user_id=? and inventory_id=? order by timestamp asc ", params, function (err, rows) {

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