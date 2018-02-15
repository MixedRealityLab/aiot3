var db = require("../db/mysql.js");

//*** NOT USED 15-02-18***
//create a new inbox register
/*
exports.createNew = function (timestamp, product_id, inventory_id, description, user_id, stock_level, predicted_need_date, stock_delta_day, need_trigger_stock_level,last_scanned_out, after_before, status, feedback, done) {

    db.get().query("INSERT INTO inbox SET ?",
        {

            "timestamp" : timestamp,
            "product_id" : product_id,
            "inventory_id" : inventory_id ,
            "description" : description,
            "user_id" : user_id ,
            "stock_level" : stock_level,
            "predicted_need_date" :predicted_need_date ,
            "stock_delta_day" : stock_delta_day,
            "need_trigger_stock_level" :need_trigger_stock_level ,
            "last_scanned_out" :last_scanned_out ,
            "after_before": after_before ,
            "status" : status ,
            "feedback": feedback

        }, function(err, rows) {
            if (err)
                return done(err);
            else
                return done(null,rows)
        }
    );
}




//get before/after register

exports.getInboxStatus = function (user_id,status,after_before, done) {
    var params = [user_id,status,after_before];
    db.get().query("SELECT * FROM inbox where user_id = ? and status = ? and after_before = ?", params, function (err, rows) {

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


//update inbox message
*/