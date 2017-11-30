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

exports.getInventoryForUser = function (user_id, done) {
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
	var params = [inventory_id];
    db.get().query("DELETE FROM inventory where id = ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows)
            return done(null, rows);
        else
            return done(null)

    }); 
}


exports.getInventoryByUserProduct = function (userId, product_id, done) {

    var params = [userId, product_id];
    db.get().query("SELECT * FROM inventory where user_id = ? and product_id = ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("no entries for user product combination"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    }); 
	
}



exports.getInventoryById = function (inventory_id, done) { //id from inventory, just one return
	var params = [inventory_id];
    db.get().query("SELECT * FROM inventory where id = ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("inventory_id does not exist"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    }); 
}



exports.updateInventoryListingStock = function (inventory_id, new_stock_level, done) {
    var params = [new_stock_level, inventory_id];
    db.get().query("UPDATE inventory SET stock_level = ? where id = ?", params, function (err, rows) {
  
        if(err)
            return done(err);
        else
            console.log(rows);
            return done(null, rows);
        

    }); 
	
}


exports.updatePredictedNeedDate = function (inventory_id, new_predicted_date, new_stock_delta_day, done) {
    var params = [new_predicted_date, new_stock_delta_day, inventory_id];
    db.get().query("UPDATE inventory SET predicted_need_date = ?, stock_delta_day= ? where id = ?", params, function (err, rows) {

        if(err)
            return done(err);
        else
            console.log(rows);
        return done(null, rows);


    });

}


