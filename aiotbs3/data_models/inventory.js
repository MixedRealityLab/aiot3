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


exports.getInventoryForUserPrediction = function (user_id, done) {
    var params = [user_id];
    db.get().query("SELECT * FROM inventory,product where inventory.user_id = ? and inventory.product_id=product.id and inventory.stock_delta_day > 1", params, function (err, rows) {

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

exports.getInventoryForUserPrediction2 = function (user_id, done) {
    var params = [user_id,user_id];
    db.get().query("SELECT \"list\" as 'inventory_id',inventory.user_id,inventory.predicted_need_date,categorised_inventory.category_id, categories.CAT2 AS description, categorised_inventory.approved, \"unknow\" as \"stock_level\"\n" +
        "FROM inventory,product,categorised_inventory,categories\n" +
        "where inventory.user_id = ?\n" +
        "and inventory.id = categorised_inventory.inventory_id\n" +
        "and inventory.product_id=product.id and inventory.stock_delta_day > 0\n" +
        "and categorised_inventory.approved=1\n" +
        "and categorised_inventory.category_id= categories.id\n" +
        "group by inventory.user_id,inventory.predicted_need_date,categorised_inventory.category_id,categories.CAT1,categories.CAT2,categorised_inventory.approved\n" +
        "UNION DISTINCT\n" +
        "SELECT inventory.id as 'inventory_id',inventory.user_id,inventory.predicted_need_date,categorised_inventory.category_id,product.description,categorised_inventory.approved, inventory.stock_level\n" +
        "FROM inventory,product,categorised_inventory\n" +
        "where inventory.user_id = ?\n" +
        "and inventory.product_id=product.id\n" +
        "and inventory.stock_delta_day > 0\n" +
        "and inventory.id = categorised_inventory.inventory_id\n" +
        "and category_id is null", params, function (err, rows) {

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







exports.deleteInventory = function (user_id, inventory_id, done) {

    var params = [inventory_id, user_id];
    db.get().query("delete from inventory where id=? and user_id= ?", params, function (err, rows) {

        console.log(rows);
        if (err)
            return done(err);
        else
            return done(null,rows)
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



