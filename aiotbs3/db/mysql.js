var mysql = require('mysql');
var connection = mysql.createConnection({
    

    host     : '127.0.0.1',
    user     : 'aiot',
    password : 'aiot',
    database : 'aiot'
});

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;