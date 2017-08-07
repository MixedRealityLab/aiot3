var express = require('express');
var router = express.Router();
var passport = require('passport');



var User = require('../data_models/user');

// Register
router.get('/register', function(req, res,next){
    res.render('register',{ success: req.session.success, errors: req.session.errors });
    req.session.errors = null;
});

// Login
router.get('/login', function(req, res){
    res.render('login',{success: req.session.success, errors: req.session.errors });
    req.session.errors = null;
});



// Register User
router.post('/register', function(req, res, next){

    var username = req.body.username;
    var password = req.body.password;

    console.log('event: try to register');

    req.check('username','Username is required').notEmpty();
    req.check('password','Password is invalid').isLength({min: 4}).equals(req.body.password2);

    var errors = req.validationErrors();
    if (errors){
        req.session.errors = errors;
        req.session.success = false;
    }else{
        var registerEvent = User.createNew(username,password);
        //check with db
        if (registerEvent.status == 'success'){
            //req.session.success = true;

            res.render('login');
        }
        else{
            console.log('fail:'+registerEvent.error);
            res.render('register');
        }

    }

    res.redirect('register');
});

//Login user
router.post('/login',function (req,res,next) {
    console.log('4u4urhr');

    var username = req.body.username;
    var password = req.body.password;
    req.check('username','Username is required').notEmpty();
    req.check('password','Password is invalid').notEmpty();

    var errors = req.validationErrors();
    if (errors){
        req.session.errors = errors;
        req.session.success = false;
    }else{
        var loginEvent = User.login(username,password);
        console.log('msg:'+ loginEvent.status);
        //req.session.success = true;

        if (loginEvent.status == 'success'){
            req.session.success = true;
            //res.render('index',{username: username});
            res.render('index', { username: req.body.username, success: req.session.success, errors: req.session.errors });

            //res.redirect('/');
        }else{
            req.session.success = false;
            console.log('msg:'+ loginEvent.errors);
            res.redirect('login');
        }
    }

    res.redirect('login');

});

router.get('/logout', function(req, res){

    req.logout();
    req.session.success = false;
    //req.session = null;
    res.redirect('login');
});



module.exports = router;