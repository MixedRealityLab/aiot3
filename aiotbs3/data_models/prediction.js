var db = require("../db/mysql.js");


exports.createNew = function (timestamp, inventory_id,user_id, days, lastScanIn, lastScanOut,predicted_need_date, stock_level,metadata, feedback_status,feedback, feedback_timestamp, feedback_after_before,category_id, done) {
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
            "feedback_after_before":feedback_after_before,
            "category_id":category_id

        }, function(err, rows) {
            if (err)
                return done(err);
            else
                return done(null,rows)
        }
    );
}

//get prediction for inbox feedback.
//0 = scanned out early than prediction
//1 = scanned out later than  prediction

exports.getPredictionsForUser = function (user_id, done) {
    var params = [user_id];
    db.get().query("select product.id as 'product_id',product.description, a.*, if( a.last_scanOut < a.predicted_need_date ,0,1) as 'early_late'\n" +
        "from prediction a,product,inventory\n" +
        "where (\n" +
        "  select count(*)\n" +
        "  from prediction b\n" +
        "  where a.inventory_id = b.inventory_id\n" +
        "  and  case \n" +
        "       when a.`timestamp` = b.`timestamp`\n" +
        "       then a.id < b.id\n" +
        "       else a.`timestamp` < b.`timestamp`\n" +
        "       end\n" +
        ") + 1 = 1\n" +
        //"and a.stock_level = 0\n" +
        "and a.user_id = ?\n" +
        "and a.feedback_status = 0\n" +
        "and product.id = inventory.product_id\n" +
        "and inventory.id = a.inventory_id", params, function (err, rows) {

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



exports.getPredictionsForUser2 = function (user_id, done) {
    var params = [user_id,user_id];
    db.get().query("select product.id as 'product_id',product.description, a.*, if( a.last_scanOut < a.predicted_need_date ,0,1) as 'early_late', categories.CAT2\n" +
        "        from prediction a,product,inventory,categories\n" +
        "        where (\n" +
        "          select count(*)\n" +
        "          from prediction b\n" +
        "          where a.inventory_id = b.inventory_id\n" +
        "          and  case \n" +
        "               when a.`timestamp` = b.`timestamp`\n" +
        "               then a.id < b.id\n" +
        "               else a.`timestamp` < b.`timestamp`\n" +
        "               end\n" +
        "        ) + 1 = 1\n" +
        "        and a.user_id = ?\n" +
        "        and a.feedback_status = 0\n" +
        "        and product.id = inventory.product_id\n" +
        "        and inventory.id = a.inventory_id\n" +
        "        and a.category_id= categories.id\n" +
        "        and DATE_FORMAT(a.last_scanOut,GET_FORMAT(DATE,'EUR')) != DATE_FORMAT(a.predicted_need_date,GET_FORMAT(DATE,'EUR')) " +
        "\n" +
        "union all\n" +
        "\n" +
        " select product.id as 'product_id',product.description, a.*, if( a.last_scanOut < a.predicted_need_date ,0,1) as 'early_late', \"NA\" as CAT2\n" +
        "        from prediction a,product,inventory\n" +
        "        where (\n" +
        "          select count(*)\n" +
        "          from prediction b\n" +
        "          where a.inventory_id = b.inventory_id\n" +
        "          and  case \n" +
        "               when a.`timestamp` = b.`timestamp`\n" +
        "               then a.id < b.id\n" +
        "               else a.`timestamp` < b.`timestamp`\n" +
        "               end\n" +
        "        ) + 1 = 1\n" +
        "        and a.user_id = ?\n" +
        "        and a.feedback_status = 0\n" +
        "        and product.id = inventory.product_id\n" +
        "        and inventory.id = a.inventory_id\n" +
        "        and a.category_id is null\n" +
        "        and DATE_FORMAT(a.last_scanOut,GET_FORMAT(DATE,'EUR')) != DATE_FORMAT(a.predicted_need_date,GET_FORMAT(DATE,'EUR')) ", params, function (err, rows) {

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







//update feedback status, feedback details, feedback timestamp.
//feedback_status = 0 (there is not feedback available)
//feedback_status = 1 (there is feedback available)
exports.updatePredictionFeedback = function (prediction_id, feedback_status, feedback, feedback_timestamp, feedback_after_before, done) {

    var params = [feedback_status, feedback, feedback_timestamp, feedback_after_before,prediction_id];
    db.get().query("UPDATE prediction SET feedback_status = ?, feedback = ?, feedback_timestamp = ?, feedback_after_before = ? where id = ?", params, function (err, rows) {

        if(err)
            return done(err);
        else
            console.log(rows);
        return done(null, rows);


    });

}


exports.deletePrediction = function (user_id, inventory_id, done) {

    var params = [inventory_id, user_id];
    db.get().query("delete from prediction where inventory_id=? and user_id= ?", params, function (err, rows) {

        console.log(rows);
        if (err)
            return done(err);
        else
            return done(null,rows)
    });


}
