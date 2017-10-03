var db = require("../db/mysql.js");


exports.createNew = function (username, password, done) {
    if(username.length == 0)
        return done(new Error("username cannot be empty"));
    if(password.length == 0)
        return done(new Error("password cannot be empty"));

    db.get().query("INSERT INTO user SET ?", 
    {
        "username": username,
        "password": password

    }, function(err, rows) {
        if (err)
            return done(err);
        else
            return done(null,rows)
    }
    );

}

exports.login = function (username, password, done) {
    if(username.length == 0)
        return done(new Error("username cannot be empty"));
    if(password.length == 0)
        return done(new Error("password cannot be empty"));
    
    var params = [username, password];
    db.get().query("SELECT id, username FROM user where username = ? and password = ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("username or password is incorrect"));
        }

        if(rows.length == 1){
            console.log(rows[0]);
            return done(null, rows);
        }
        
        return(null,null);
    }); 
}


