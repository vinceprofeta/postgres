'use strict';

var express = require('express');
var router = express.Router();

var knex = require('../../../db/knex');
var st = require('knex-postgis')(knex);

// Utils
var hasRole = require('../../utils/roleMiddleware');

// Controllers
var ServicesController = require('../../controllers/services');
var ResourcesController = require('../../controllers/resources');
var CalendarsController = require('../../controllers/calendars');

router.route('/').post(function (req, res) {}).get(function (req, res) {
  ServicesController.getServices(req.query).then(function (resources) {
    res.json(resources);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/calendars').get(function (req, res) {
  CalendarsController.getCalendarsBySkill(req.query).then(function (resources) {
    res.json(resources);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/popular').get(function (req, res) {
  ServicesController.getPopularServices(req.query).then(function (resources) {
    res.json(resources.rows);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/:id').get(function (req, res) {
  ServicesController.getById(req.params.id).then(function (resources) {
    res.json(resources);
  }).catch(function (err) {
    res.status(422).json(err);
  });
}).put(function (req, res) {
  ServicesController.updateById(req.params.id, req.body).then(function (resources) {
    res.json(resources);
  }).catch(function (err) {
    res.status(422).json({ error: err });
  });
});

router.route('/:id/services').get(function (req, res) {
  SessionsController.getSessionsForListing(req.params.id).then(function (services) {
    res.json(services);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/:id/services/availability').get(function (req, res) {
  var query = req.query || {};
  query.listingId = req.params.id;
  SessionsController.getAvailability(query).then(function (response) {
    res.json(response);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

module.exports = router;