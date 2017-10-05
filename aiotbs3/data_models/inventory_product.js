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

    db.get().query("SELECT DATE_FORMAT(MAX(out_event.timestamp),'%d-%m-%Y, %H:%i:%s') as 'used_up', out_event.inventory_id as 'out_event_inventory_id', DATE_FORMAT(MAX(in_event.timestamp),'%d-%m-%Y, %H:%i:%s') as 'last_added', inventory.id as 'inventory_id', inventory.product_id as 'inventory_product_id', inventory.user_id, inventory.stock_level,inventory.predicted_need_date as 'predicted_need_dateOriginal', product.id as 'product_id', product.ean, product.brand_name, product.multipack, product.multipack_amount, product.quantity, product.quantity_units, product.metadata,product.description,'Not available yet' as predicted_need_date  from out_event,in_event,inventory,product where out_event.inventory_id=inventory.id and in_event.inventory_id=inventory.id and inventory.user_id = ? and inventory.product_id=product.id and inventory.stock_level=0 GROUP BY out_event.inventory_id\n",params,function (err,rows) {
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

