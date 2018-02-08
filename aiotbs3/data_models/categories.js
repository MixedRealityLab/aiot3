var db = require("../db/mysql.js");

exports.getCategoriesForInventory = function (inventory_id, done) {
    var params = [inventory_id];
    db.get().query("SELECT * from categorised_inventory where categorised_inventory.inventory_id = ?", params, function (err, rows) {

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


exports.getInventoryIdsForCategory = function (category_id,user_id, done) {
    var params = [category_id,user_id];
    db.get().query("select categorised_inventory.category_id,\n" +
        "categorised_inventory.inventory_id,\n" +
        "categories.CAT1,\n" +
        "categories.CAT2\n" +
        "from categorised_inventory, categories\n" +
        "where categorised_inventory.category_id = categories.id\n" +
        "and categorised_inventory.category_id= ?\n" +
        "and user_id= ?", params, function (err, rows) {

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

