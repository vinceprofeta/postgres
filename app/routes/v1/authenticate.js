'use strict';

var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');

// Models
var bookshelf = require('../../../db/bookshelf');
var Users = bookshelf.model('users');
var request = require('request');

// facebookLogin({
//   body: {
//     userId: '10156935670120527', 
//     facebookToken: 'EAAHMhLp4MZA0BAGrmRhZBYnEOjzONMJQUuKTAJnNzI8S8SiTy5wZBZBzUhKLv579RqcsjbUhQ0EoxYRpz3ibwu0How6ViHu3JGCjStv1Yo9kOvQH0ZCCMLotfZAaRG4ZAVSmZADqheuWlofHTUrNxmTO7Xwa3r2oXdZBObogrpACff4kPLeeJO95UMlyONL2b0F4ZD'
//   }
// })

router.route('/')
  .post(function(req, res) { 
    if (req.body.facebookToken) {
      facebookLogin(req, res);
    } else {
      return Users.where({
        email: req.body.email
      }).fetch({})
      .then(function(user) {
        if (!user) {
          res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
        } else if (user) {
          user.verifyPassword(req.body.password, function(err, isMatch) {
            if(err || !isMatch) {
              res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
            }else{
              var token = jwt.sign({ _id: user._id, user: user }, req.app.get('superSecret'), {
                expiresIn: 2592000 // expires in 24 hours
              });

              res.json({
                token: token
              });
            }
          });
        }
      })
      .catch(function(err) {
        throw err
      });
    }
  });

  function facebookLogin(req, res) {
    return Users.where({
      'facebookCredentials.userId': req.body.facebookUser
    }).fetch({})
    .then(function(err, user) {
      if (!user) {
        res.status(401).json({ success: false, message: 'Authentication failed. User not found.' });
      } else if (user) {
        request('https://graph.facebook.com/me?access_token='+req.body.facebookToken, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var token = jwt.sign({ _id: user._id, user: user }, req.app.get('superSecret'), {
              expiresIn: 2592000 // expires in 24 hours
            });
            res.json({token: token});
          } else {
            res.status(401).json({ success: false, message: 'Authentication failed. Wrong password.' });
          }
        });
   
      }
    })
    .catch(function(err) {
      throw err;
    });

  }

module.exports = router;
