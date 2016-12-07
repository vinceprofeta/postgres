'use strict';

var express = require('express');
var _ = require('lodash');
var router = express.Router();


router.route('/')
.post(async (req, res) => {
  // TODO LISTEN TO EVENTS AND DO SOMETHING
  var event_json = JSON.parse(req.body);
  stripe.events.retrieve(event_json.id, function(err, event) {
    res.send(200);
  });

});


module.exports = router;
