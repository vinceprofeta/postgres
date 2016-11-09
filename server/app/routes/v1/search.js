'use strict';

var express = require('express');
var _ = require('lodash');
var router = express.Router();

// Utils
var hasRole = require('../../utils/roleMiddleware');
var calendarSearch = require('../../elasticSearchIndexes/calendar-search.js')

// Models
var Sessions// = require('../../models/sessions');

router.route('/').get(function(req, res) {
  calendarSearch.queryCalendars(req.body.query);   
});


module.exports = router;
