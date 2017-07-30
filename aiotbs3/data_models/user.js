var db = require("../db/db.js");
var schemas = require("./schemas.js");
var _ = require("lodash");
var bcrypt = require('bcryptjs');


var User = function (data) {
    this.data = this.sanitize(data);
}

User.prototype.data = {} // class level data which can be used in session management

User.prototype.changeName = function (name) {
    this.data.name = name;
}

User.prototype.get = function (name) { // probs don't need
    return this.data[name];
}

User.prototype.set = function (name, value) { // probs don't need
    this.data[name] = value;
}

User.prototype.sanitize = function (data) {
    data = data || {};
    schema = schemas.user;
    return _.pick(_.defaults(data, schema), _.keys(schema)); 
}

User.prototype.save = function (callback) {
    var self = this;
    this.data = this.sanitize(this.data);
    db.get('users', {id: this.data.id}).update(JSON.stringify(this.data)).run(function (err, result) {
        if (err) return callback(err);
        callback(null, result); 
    });
}

User.findById = function (id, callback) {
    db.get('users', {id: id}).run(function (err, data) {
        if (err) return callback(err);
        callback(null, new User(data));
    });
}

User.createNew = function (username, password) {

    if(username == 'test') {
        return ({"status": "fail", "error": "username alredy exists"});
    }
    else {
        //return ({"status": "userId": 1,});
        return ({"status":"success", "userId": "1"});
    }
}

User.login = function (username, password) {
    if(username == 'test') {
        if(password == 'test') {
            return ({"status": "success", "session_id": "diofughspidfughpdaiushg2324"});
        }
        else {
            return ({"status": "fail", "error": "password incorrect"});
        }
    }
    else {
        return ({"status": "fail", "error": "user does not exist"});
    }
}


module.exports = User;