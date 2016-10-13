'use strict';

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var BluebirdPromise = require('bluebird');
var uuid = require('node-uuid');
var _ = require('lodash');

// Models
var bookshelf = require('../../../db/bookshelf');
var Users = bookshelf.model('users');
var Memberships = bookshelf.model('memberships');
var request = require('request');

// Controllers
var UsersController = require('../../controllers/users');

router.route('/').post(function (req, res) {
  if (req.body.token) {
    facebookLogin(req, res);
  } else {
    return getUser({
      email: req.body.email
    }).fetch({}).then(function (user) {
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user && user.user) {
        user.user.verifyPassword(req.body.password, function (err, isMatch) {
          if (err || !isMatch) {
            res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
          } else {
            var token = jwt.sign({ id: user.user.attributes.id, user: user.user.attributes, memberships: user.memberships }, req.app.get('superSecret'), {
              expiresIn: 2592000 // expires in 24 hours
            });

            res.json({
              token: token
            });
          }
        });
      }
    }).catch(function (err) {
      throw err;
    });
  }
});

function facebookLogin(req, res) {
  return getUser({
    'facebook_user_id': req.body.userId
  }).then(function (user) {
    if (!user) {
      getFacebookUser(req.body.token).then(function (body) {
        body = JSON.parse(body);
        var fullName = body.name.split(' ');
        var lastName = fullName.pop();
        var cUser = {
          email: decodeURIComponent(body.email),
          first_name: fullName.join(' '),
          last_name: lastName,
          password: uuid.v4(),
          facebook_user_id: req.body.userId,
          facebook_credentials: {
            token: req.body.token,
            tokenExpirationDate: req.body.tokenExpirationDate
          }
        };
        UsersController.add(cUser).then(function (newUser) {
          var token = jwt.sign({ id: newUser.attributes.id, user: newUser.attributes, memberships: [] }, req.app.get('superSecret'), {
            expiresIn: 2592000 // expires in 24 hours
          });
          res.json({ token: token });
        }).catch(function (err) {
          console.log(err);
          res.status(401).json({ success: false, error: 'Adding User Failed.' });
        });
      });
    } else if (user) {
      getFacebookUser(req.body.token).then(function (body) {
        var token = jwt.sign({ _id: user.user.id, user: user.user, memberships: user.memberships }, req.app.get('superSecret'), {
          expiresIn: 2592000 // expires in 24 hours
        });
        res.json({ token: token });
      }).catch(function (err) {
        console.log(err);
        res.status(401).json({ success: false, error: 'Authentication failed.' });
      });
    }
  }).catch(function (err) {
    throw err;
  });
}

function getUser(query) {
  return new BluebirdPromise(function (resolve, reject) {
    Users.where(query).fetch({}).then(function (user) {
      if (user) {
        Memberships.where({
          membership_user_id: user.id
        }).fetchAll({}).then(function (md) {
          resolve({ user: user.attributes, memberships: md.toJSON() });
        }).catch(function (err) {
          reject();
        });
      } else {
        resolve(null);
      }
    }).catch(function (err) {
      reject(err);
    });
  });
}

function getFacebookUser(token) {
  return new BluebirdPromise(function (resolve, reject) {
    request('https://graph.facebook.com/me?fields=email,name&access_token=' + token, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve(body);
      } else {
        reject();
      }
    });
  });
}

module.exports = router;