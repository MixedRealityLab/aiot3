var db = require("../db/mysql.js");
//var inventory = require('../data_models/inventory.js');


exports.getProductDescriptionbyUser = function(userId,done){

        var params = [userId];
        //db.get().query("SELECT * from inventory,product where inventory.user_id = ? and inventory.product_id=product.id", params, function (err, rows) {

        db.get().query("SELECT inventory.id as 'inventory_id', inventory.product_id as 'inventory_product_id', inventory.user_id, inventory.stock_level,inventory.predicted_need_date, product.id as 'product_id', product.ean, product.brand_name, product.multipack, product.multipack_amount, product.quantity, product.quantity_units, product.metadata,product.description  from inventory,product where inventory.user_id = ? and inventory.product_id=product.id", params, function (err, rows) {
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

