'use strict';

var _ = require('lodash');
var stripe = require('stripe')(process.env.STRIPE_SECRET);
var BluebirdPromise = require('bluebird');

// Models
var bookshelf = require('../../db/bookshelf');
var PaymentMethods = bookshelf.model('paymentMethods');
var Users; //= require('../models/users');

var stripeActions = {};

stripeActions.addCustomer = function (user, token) {
  return new BluebirdPromise(function (resolve, reject) {
    stripe.tokens.retrieve(token, function (err, card) {
      if (err) {
        reject(err);
      }
      stripe.customers.create({
        description: user.first_name + ' ' + user.last_name + ' -' + user.id,
        source: card.id // obtained with Stripe.js
      }, function (err, customer) {
        if (err) {
          reject(err);
        } else {
          var paymentMethod = {
            user_id: user.id,
            customer: customer.id,
            card: card,
            processor_id: card.id,
            processor: 'stripe'
          };

          paymentMethod = new PaymentMethods(paymentMethod).save().then(function (method) {
            resolve(_.get(method, 'attributes'));
          }).catch(function (method) {
            reject();
          });
        }
      });
    });
  });
};

stripeActions.addCard = function (token, customerId, user) {
  return new BluebirdPromise(function (resolve, reject) {
    stripe.tokens.retrieve(token, function (err, card) {
      if (err) {
        reject(err);
      } else {
        stripe.customers.update(customerId, { source: card.id }, function (err, customer) {
          var paymentMethod = {
            user_id: user.id,
            customer: customerId,
            card: card,
            processor_id: card.id,
            processor: 'stripe'
          };

          paymentMethod = new PaymentMethods(paymentMethod).save().then(function (method) {
            resolve(_.get(method, 'attributes'));
          }).catch(function (method) {
            reject(err);
          });
        });
      }
    });
  });
};

stripeActions.refundTransaction = function (chargeId, amount, session, userId) {
  return new BluebirdPromise(function (resolve, reject) {
    var refundObj = {
      charge: chargeId,
      metadata: {
        session: session._id ? session._id.toString() : session.toString(),
        gym: session.location._id ? session.location._id.toString() : session.location.toString(),
        user: userId.toString(),
        type: 'refund'
      }
    };
    if (amount) {
      refundObj.amount = amount;
    }
    stripe.refunds.create(refundObj, function (err, refund) {
      if (err) {
        reject(err);
      } else {
        resolve(refund);
      }
    });
  });
};

stripeActions.chargeCard = function (customer, amount, description, session, type, userId) {
  return new BluebirdPromise(function (resolve, reject) {
    if (amount > 0) {
      stripe.charges.create({
        amount: amount,
        currency: "usd",
        customer: customer,
        description: description,
        metadata: {
          session: session._id ? session._id.toString() : session.toString(),
          gym: session.location._id ? session.location._id.toString() : session.location.toString(),
          user: userId.toString(),
          type: type || 'charge'
        }
      }, function (err, charge) {
        if (err) {
          reject(err);
        } else {
          resolve(charge);
        }
      });
    } else {
      resolve({
        amount: 0,
        freeSession: true
      });
    }
  });
};

module.exports = stripeActions;