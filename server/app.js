require("babel-core/register");
require("babel-polyfill");
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var worker = require('./app/contextManagers/workerContext');

var routes = require('./app/routes/v1');
require('dotenv').config();

var app = express();
// Token Variable
app.set('superSecret', process.env.TOKEN_VARIABLE); // secret variable // Make env later

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/v1', routes);


// catch 404 and forward to error handler
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

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});





// var elastic = require('./app/elasticSearchIndexes/services-index.js');
// var client = require('./elasticsearch.js');
// client.search({  
//   index: 'services_index',
//   type: 'service',
//   body: {
//     query: {
//       match: { "serviceDescription": "service description" }
//     },
//   }
// },function (error, response,status) {
//     if (error){
//       console.log("search error: "+error)
//     }
//     else {
//       console.log("--- Response ---");
//       console.log(response);
//       console.log("--- Hits ---");
//       response.hits.hits.forEach(function(hit){
//         console.log(hit);
//       })
//     }
// });

// elastic.indexExists('services_index').then(function (exists) {
//   if (!exists) {
//     return elastic.initIndex('services_index').then(elastic.initServiceMapping)
//   }
// })


module.exports = app;
