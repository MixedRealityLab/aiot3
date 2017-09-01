var db = require("../db/mysql.js");

exports.getProductByEan = function (ean, done) {
	if(ean.length == 0)
        return done(new Error("ean cannot be empty"));

    var params = [ean];
    db.get().query("SELECT * FROM product where ean = ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("EAN does not exist"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }
        
    }); 
}

exports.getProductById = function (id, done) {
	if(ean.length == 0)
        return done(new Error("ean cannot be empty"));

    var params = [id];
    db.get().query("SELECT * FROM product where id = ?", params, function (err, rows) {
        
        console.log(rows);     
        if(err)
            return done(err);

        if(rows.length == 0){
            return done(new Error("EAN does not exist"));
        }

        if(rows.length > 0){
            console.log(rows);
            return done(null, rows);
        }

    }); 
}

exports.createNew = function (ean, brand_name, description, multipack, multipack_amount, quanitity, quantity_units, metadata, done) {
	
	//TODO: check type and presence for all 
	metaJson = JSON.stringify(metadata);
    
	db.get().query("INSERT INTO product SET ?", 
    {
        "ean": ean,
        "brand_name": brand_name,
        "description": description,
        "multipack": multipack,
        "multipack_amount": multipack_amount,
        "quantity": quanitity,
        "quantity_units": quantity_units,
        "metadata": metaJson

    }, function(err, rows) {
        if (err)
            return done(err);
        else
            return done(null,rows)
    }
    );
}


