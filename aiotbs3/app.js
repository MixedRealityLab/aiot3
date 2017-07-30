var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./db/db');
var index = require('./routes/index');
var users = require('./routes/users');
var instock = require('./routes/instock');
var addedItem= require('./routes/addedItem');
var wizard= require('./routes/wizard');


var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var expressSessions = require('express-session');

var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


//Init app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');




// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSessions({secret: 'max', saveUninitialized: false, resave: false}));



app.use('/', index);
app.use('/users', users);
app.use('/addedItem', addedItem);
app.use('/instock', instock);
app.use('/wizard', wizard);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;











