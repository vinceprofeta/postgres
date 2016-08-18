'use strict';

var express = require('express');
var router = express.Router();

var knex = require('../../../db/knex');
var st = require('knex-postgis')(knex);

// Utils
var hasRole = require('../../utils/roleMiddleware');

// Controllers
var CalendarsController = require('../../controllers/calendars');

router.route('/')
  .post(function(req, res) {
    
  })
  .get(function(req, res) {
    CalendarsController.getCalendars(req.query)
    .then(function(calendars) {
      res.json(calendars);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });

router.route('/popular')
  .get(function(req, res) {
    CalendarsController.getPopularCalendars(req.query)
    .then(function(calendars) {
      res.json(calendars);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });

router.route('/:id')
  .get(function(req, res) {
    CalendarsController.getById(req.params.id)
    .then(function(calendars) {
      console.log(calendars.toJSON())
      res.json(calendars);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .put(function(req, res) {
    CalendarsController.updateById(req.params.id, req.body)
    .then(function(calendars) {
      res.json(calendars);
    })
    .catch(function(err) {
      res.status(422).json({error: err});
    })
  });



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
