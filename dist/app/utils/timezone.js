'use strict';

var _ = require('lodash');
var moment = require('moment-timezone');

var timezone = {
  utc: function utc(server) {
    moment().tz("America/Los_Angeles").format();
  },

  joinRoom: function joinRoom(server) {}
};

module.exports = timezone;