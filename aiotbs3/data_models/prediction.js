var db = require("../db/mysql.js");


exports.createNew = function (timestamp, inventory_id,user_id, days, lastScanIn, predicted_need_date, stock_level,metadata, done) {
    metaJson = JSON.stringify(metadata);


    db.get().query("INSERT INTO prediction SET ?",
        {
            "timestamp": timestamp,
            "inventory_id": inventory_id,
            "user_id": user_id,
            "days_average": days,
            "last_scanIn": lastScanIn,
            "predicted_need_date": predicted_need_date,
            "stock_level": stock_level,
            "metadata": metaJson

        }, function(err, rows) {
            if (err)
                return done(err);
            else
                return done(null,rows)
        }
    );
}