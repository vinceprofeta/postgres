var _ = require('lodash');
var moment = require('moment-timezone');

var timezone = {
  utc: function(server) {
    moment().tz("America/Los_Angeles").format();
  },

  joinRoom: function(server) {
   
  }
}


module.exports = timezone;


