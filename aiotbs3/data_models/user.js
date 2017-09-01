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


/*
var records = [
    { id: 1, username: 'test', password: 'test', displayName: 'Test', emails: [ { value: 'Test@example.com' } ] }
    , { id: 2, username: 'jill', password: 'birthday', displayName: 'Jill', emails: [ { value: 'jill@example.com' } ] }
];
*/

/*
exports.findById = function(id, done) { // this isnt needed as the ID is returned at login
    process.nextTick(function() {
        var idx = id - 1;
        if (records[idx]) {
            done(null, records[idx]);
        } else {
            done(new Error('User ' + id + ' does not exist'));
        }
    });
}
*/


/*
exports.findByUsername = function(username, done) { // there isnt any data to find - if you want more user data then update the schema
    process.nextTick(function() {
        for (var i = 0, len = records.length; i < len; i++) {
            var record = records[i];
            if (record.username === username) {
                return done(null, record);
            }
        }
        return done(null, null);
    });
}
*/ 

