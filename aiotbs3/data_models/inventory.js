var db = require("../db/mysql.js");


exports.createNew = function (user_id, product_id, stock_level, predicted_need_date, stock_delta_day, need_trigger_stock_level, done) {
   
   db.get().query("INSERT INTO inventory SET ?", 
    {	
        "user_id": user_id,
        "product_id": product_id,
        "stock_level": stock_level,
        "predicted_need_date": predicted_need_date,
        "stock_delta_day": stock_delta_day,
        "need_trigger_stock_level": need_trigger_stock_level

    }, function(err, rows) {
        if (err)
            return done(err);
        else
            return done(null,rows)
    }
    );
}

exports.getInventoryForUser = function (user_id) {
    var params = [user_id];
    db.get().query("SELECT * FROM inventory where user_id = ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("no entries for user"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    }); 
}


exports.stopTracking = function(inventory_id, done) {
	
}

exports.getInventoryByUserProduct = function (userId, product_id, done) {
	
}

exports.getInventoryById = function (userId, product_id, done) {
	
}

exports.updateInventoryListingStock = function (inventory_id, new_stock_level, done) {
	
}
