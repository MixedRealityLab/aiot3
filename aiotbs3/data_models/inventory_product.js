var db = require("../db/mysql.js");
//var inventory = require('../data_models/inventory.js');


exports.getInStock = function(userId,done){

        var params = [userId];
        //db.get().query("SELECT inventory.id as 'inventory_id', inventory.product_id as 'inventory_product_id', inventory.user_id, inventory.stock_level,inventory.predicted_need_date, product.id as 'product_id', product.ean, product.brand_name, product.multipack, product.multipack_amount, product.quantity, product.quantity_units, product.metadata,product.description  from inventory,product where inventory.user_id = ? and inventory.product_id=product.id", params, function (err, rows) {

        db.get().query("SELECT inventory.id as 'inventory_id', inventory.product_id as 'inventory_product_id', inventory.user_id, inventory.stock_level,inventory.predicted_need_date as 'predicted_need_dateOriginal', product.id as 'product_id', product.ean, product.brand_name, product.multipack, product.multipack_amount, product.quantity, product.quantity_units, product.metadata,product.description,'Not available yet' as predicted_need_date  from inventory,product where inventory.user_id = ? and inventory.stock_level >0 and inventory.product_id=product.id", params, function (err, rows) {
            if(err)
                return done(err);

            if(rows.length == 0){
                return done(new Error("Product ID does not exist"));
            }

            if(rows.length > 0){
                console.log(rows);
                return done(null, rows);
            }

        });

    }



exports.getOutStock = function(userId,done){
    var params = [userId];

    db.get().query("SELECT DATE_FORMAT(MAX(CONVERT_TZ(out_event.timestamp,'+00:00','+00:00')),'%d-%m-%Y, %H:%i:%s') as 'used_up', out_event.inventory_id as 'out_event_inventory_id', DATE_FORMAT(MAX(CONVERT_TZ(in_event.timestamp,'+00:00','+00:00')),'%d-%m-%Y, %H:%i:%s') as 'last_added', inventory.id as 'inventory_id', inventory.product_id as 'inventory_product_id', inventory.user_id, inventory.stock_level,inventory.predicted_need_date as 'predicted_need_dateOriginal', product.id as 'product_id', product.ean, product.brand_name, product.multipack, product.multipack_amount, product.quantity, product.quantity_units, product.metadata,product.description,'Not available yet' as predicted_need_date  from out_event,in_event,inventory,product where out_event.inventory_id=inventory.id and in_event.inventory_id=inventory.id and inventory.user_id = ? and inventory.product_id=product.id and inventory.stock_level=0 GROUP BY out_event.inventory_id",params,function (err,rows) {
    //db.get().query("SELECT out_event.timestamp as 'used_up', out_event.inventory_id as 'out_event_inventory_id', in_event.timestamp as 'last_added', inventory.id as 'inventory_id', inventory.product_id as 'inventory_product_id', inventory.user_id, inventory.stock_level,inventory.predicted_need_date as 'predicted_need_dateOriginal', product.id as 'product_id', product.ean, product.brand_name, product.multipack, product.multipack_amount, product.quantity, product.quantity_units, product.metadata,product.description,'Not available yet' as predicted_need_date  from out_event,in_event,inventory,product where out_event.inventory_id=inventory.id and in_event.inventory_id=inventory.id and inventory.user_id = ? and inventory.product_id=product.id and inventory.stock_level=0 GROUP BY out_event.inventory_id",params,function (err,rows) {

        if (err)
            return done(err);

        if (rows.length == 0){
            return done(new Error("Inventory ID does not exists"));
        }

        if (rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    });

}


exports.getInOutEvents = function (userId,inventoryId,done) {
    var params = [userId,inventoryId,userId,inventoryId];
    db.get().query("SELECT in_event.id,in_event.inventory_id,in_event.timestamp as 'added', (SELECT MIN(out_event.timestamp) FROM out_event where out_event.timestamp >= in_event.timestamp and out_event.user_id = ? and out_event.inventory_id = ?) as 'used_up' FROM in_event LEFT JOIN out_event ON in_event.inventory_id=out_event.inventory_id WHERE in_event.user_id = ? and in_event.inventory_id = ? GROUP BY in_event.id",params, function (err, rows) {
        if (err)
            return done(err);

        if (rows.length == 0){
            return done(new Error("Inventory ID does not exists"));
        }

        if (rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }
    });

}


//get the first date when a product was added
exports.getFirstIn = function (userId,inventoryId,done) {
    var params = [userId,inventoryId];
    db.get().query("SELECT timestamp FROM in_event where user_id = ? and inventory_id=? order by timestamp asc limit 1",params, function (err, rows) {
        if (err)
            return done(err);

        if (rows.length == 0){
            return done(new Error("Inventory ID does not exists"));
        }

        if (rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }
    });

}

//get last used_up/scanned out product
exports.getLastUsed = function (userId,inventoryId,wastedId,done) {
    var params = [userId,inventoryId,wastedId];
    db.get().query("SELECT max(out_event.timestamp) as 'last_used_up' FROM out_event where out_event.user_id = ? and out_event.inventory_id=? and out_event.wasted=?",params, function (err, rows) {
        if (err)
            return done(err);

        if (rows.length == 0){
            return done(new Error("Inventory ID does not exists"));
        }

        if (rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }
    });

}
