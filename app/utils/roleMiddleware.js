'use strict';

var express = require('express');
var router = express.Router();
var _ = require('lodash');

// -- How to use
// var hasRole = require('roleMiddleare');
// router.use('/mytestroute', hasRole('admin'), mytestroute);

function hasRole(role, roleTwo) {
  return function(req, res, next) {
    var failed = true;
    var userMemberships = _.get(req.decoded, 'memberships', []);

    var roleIndex = _.findIndex(userMemberships, {role: {name: role}});
    var roleName = _.find(userMemberships, {role: {name: role}});

    if (roleIndex < 0) {
      roleIndex = _.findIndex(userMemberships, {role: {name: roleTwo}});
      roleName = _.find(userMemberships, {role: {name: roleTwo}});
    }
    
    var isAppOwner = _.get(roleName, 'role.name', '') === 'app-owner';

    if (req.params.GymId) {
      // Find the Gym and check the role
      var gymIndex = _.findIndex(userMemberships, function(gym) {
        return gym.gym.toString() === req.params.GymId;
      });

      var matchesRoleOne = _.get(userMemberships[gymIndex], 'role.name') === role;
      var matchesRoleTwo = _.get(userMemberships[gymIndex], 'role.name') === roleTwo;

      if ((gymIndex !== -1 && (matchesRoleOne || matchesRoleTwo)) || isAppOwner) {
        failed = false;
        next();
      }
    } else if (roleIndex !== -1) {
      failed = false;
      next();
    }

    if (failed) {
      res.status(403).send({ 
        success: false, 
        message: 'User does not have permission.' 
      });
    };

  };
}

module.exports = hasRole;
