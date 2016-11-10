'use strict';

var express = require('express');
var _ = require('lodash');
var router = express.Router();

// Utils
var hasRole = require('../../utils/roleMiddleware');
var calendarSearch = require('../../elasticSearchIndexes/calendar-search.js')

// Models
var Sessions// = require('../../models/sessions');

router.route('/')
.get(async (req, res) => {
  try {
    const results = await calendarSearch.queryCalendars(req.query.search);
    res.json(results);
  } catch(err) {
    res.status(422).json(err);
  }
})
.post(async (req, res) => {
  try {
    const results = await calendarSearch.queryCalendars(req.body.search);
    res.json(results);
  } catch(err) {
    console.log(err)
    res.status(422).json(err);
  }
});


module.exports = router;
