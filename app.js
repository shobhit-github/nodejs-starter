
// intializations
require('./config/config');


var express = require('express')
  , path = require('path')
  , favicon = require('serve-favicon');

var logger = require('morgan')
  , cors = require('cors')
  , mongoose = require('mongoose');
  
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Database Connectivity
var port = process.env.PORT || 3000;
mongoose.Promise = require('bluebird'); // implement if mongoose mpromise will deprecate
mongoose.connect(MONGO_CONNECT);

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(favicon(path.join(__dirname, 'assets', 'images/favicon.ico')));
app.use(express.static(path.join(__dirname + '/assets')));
app.use('/views', express.static(path.join(__dirname + '/views')));


// Starting index.html file 
app.get('*', function(req, res) {
  res.status(200).sendFile('./index.html');
});


// Cross-Origin-Resource-Sharing headers configurations and api-routes
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.header('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,PATCH,DELETE');

    // Request headers you wish to allow
    res.header('Access-Control-Allow-Headers', 'Accept,Origin,X-Requested-With,Content-Type,Authorization,Language');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.header('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
}); 
app.use('/api',  require(CONF_ROOT+'routes'));



// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
