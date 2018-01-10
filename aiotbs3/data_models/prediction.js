var db = require("../db/mysql.js");


exports.createNew = function (timestamp, inventory_id,user_id, days, lastScanIn, lastScanOut,predicted_need_date, stock_level,metadata, feedback_status,feedback, feedback_timestamp, feedback_after_before, done) {
    metaJson = JSON.stringify(metadata);


    db.get().query("INSERT INTO prediction SET ?",
        {
            "timestamp": timestamp,
            "inventory_id": inventory_id,
            "user_id": user_id,
            "days_average": days,
            "last_scanIn": lastScanIn,
            "last_scanOut": lastScanOut,
            "predicted_need_date": predicted_need_date,
            "stock_level": stock_level,
            "metadata": metaJson,
            "feedback_status": feedback_status,
            "feedback": feedback,
            "feedback_timestamp": feedback_timestamp,
            "feedback_after_before":feedback_after_before

        }, function(err, rows) {
            if (err)
                return done(err);
            else
                return done(null,rows)
        }
    );
}