'use strict';
var BluebirdPromise = require('bluebird');

module.exports = function(db) {
  var PaymentMethods = db.Model.extend({
    tableName: 'paymentMethods',
  });

  return db.model('paymentMethods', PaymentMethods)
}