var db = require("../db/mysql.js");

exports.createNewUserLog = function (user_id, category,timestamp,metadata, done) {
    metaJson = JSON.stringify(metadata);

    db.get().query("INSERT INTO user_event SET ?",
        {
            "user_id": user_id,
            "category": category,
            "timestamp": timestamp,
            "metadata": metaJson

        }, function(err, rows) {
            if (err)
                return done(err);
            else
                return done(null,rows)
        }
    );

}
