var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;



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



// Register User using passport
/*
router.post('/register', function(req, res){
    //var name = req.body.name;
    //var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    //req.checkBody('name', 'Name is required').notEmpty();
    //req.checkBody('email', 'Email is required').notEmpty();
    //req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        res.render('register',{
            errors:errors
        });
    } else {
        var newUser = new User({
            //name: name,
            //email:email,
            username: username,
            password: password
        });

        User.createNew(newUser, function(err, user){
            if(err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user){
            if(err) throw err;
            if(!user){
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function(err, isMatch){
                if(err) throw err;
                if(isMatch){
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Invalid password'});
                }
            });
        });
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});
*/
//router.post('/login',
//    passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
//    function(req, res) {
//        res.redirect('/');
//    });


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
    // req.flash('success_msg', 'You are logged out');
    req.session.success = false;
    //req.session = null;
    res.redirect('login');
});



module.exports = router;