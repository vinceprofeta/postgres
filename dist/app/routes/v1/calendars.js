'use strict';

var express = require('express');
var router = express.Router();

var knex = require('../../../db/knex');
var st = require('knex-postgis')(knex);
var _ = require('lodash');

// Utils
var hasRole = require('../../utils/roleMiddleware');

// Controllers
var CalendarsController = require('../../controllers/calendars');
var AvailabilityController = require('../../controllers/availability');

router.route('/').post(function (req, res) {}).get(function (req, res) {
  CalendarsController.getCalendars(req.query).then(function (calendars) {
    res.json(calendars);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/popular').get(function (req, res) {
  CalendarsController.getPopularCalendars(req.query).then(function (calendars) {
    res.json(calendars);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/:id').get(function (req, res) {
  CalendarsController.getById(req.params.id).then(function (calendars) {
    res.json(calendars);
  }).catch(function (err) {
    console.log(err);
    res.status(422).json(err);
  });
}).put(function (req, res) {
  CalendarsController.updateById(req.params.id, req.body).then(function (calendars) {
    res.json(calendars);
  }).catch(function (err) {
    res.status(422).json({ error: err });
  });
});

router.route('/:id/availability').get(function (req, res) {
  CalendarsController.getById(req.params.id).then(function (calendars) {
    var serviceId = calendars.attributes.calendar_service_id;
    var agentId = calendars.attributes.calendar_agent_id;
    var query = _.merge(req.query, { serviceId: serviceId, agentId: agentId });
    return AvailabilityController.getAll(query);
  }).then(function (a) {
    console.log(a);
    res.json(a);
  }).catch(function (err) {
    console.log(err);
    res.status(422).json(err);
  });
}).put(function (req, res) {});

// router.route('/skills')
//   .get(function(req, res) {
//     CalendarsController.getCalendarsBySkill(req.query)
//     .then(function(calendars) {
//       console.log(calendars)
//       res.json(calendars);
//     })
//     .catch(function(err) {
//       res.status(422).json(err);
//     })
//   });


module.exports = router;