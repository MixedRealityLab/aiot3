var db = require("../db/mysql.js");


//get products scanned out before and after prediction
exports.getScannedOut_prediction = function (userId,done) {
    var params = [userId];
    db.get().query("select product.id as 'product_id',\n" +
        "inventory.id as 'inventory_id',\n" +
        "product.description,\n" +
        "inventory.user_id,\n" +
        "inventory.stock_level,\n" +
        "inventory.predicted_need_date,\n" +
        "inventory.stock_delta_day,\n" +
        "inventory.need_trigger_stock_level,\n" +
        "max(out_event.timestamp) as 'last_scanned_out'\n" +
        " \n" +
        "from product, inventory, out_event\n" +
        "\n" +
        "where product.id=inventory.product_id\n" +
        "and inventory.user_id = ?\n" +
        "and inventory.stock_delta_day > 1\n" +
        "and out_event.inventory_id = inventory.id\n" +
        "and out_event.user_id = inventory.user_id\n" +
        "group by product.id,\n" +
        "inventory.id,\n" +
        "product.description,\n" +
        "inventory.user_id,\n" +
        "inventory.stock_level,\n" +
        "inventory.predicted_need_date,\n" +
        "inventory.stock_delta_day,\n" +
        "inventory.need_trigger_stock_level",params, function (err, rows) {
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
