'use strict';

var express = require('express');
var router = express.Router();

// Utils
var hasRole = require('../../utils/roleMiddleware');

// Models
var Listings// = require('../../models/listings');

// Controllers
var SessionsController //= require('../../controllers/sessions');
var ResourcesController = require('../../controllers/resources');

router.route('/')
  .post(function(req, res) {
    
  })
  .get(function(req, res) {
    ResourcesController.getResources(req.query)
    .then(function(resources) {
      res.json(resources);
    })
  });

router.route('/popular')
  .get(function(req, res) {
    ResourcesController.getResources(req.query)
    .then(function(resources) {
      res.json(resources);
    })
  });

router.route('/:id')
  .get(function(req, res) {
    if (req.params.id === 'popular') {

    }
    ResourcesController.getResources(req.query)
    .then(function(resources) {
      res.json(resources);
    })
  })
  .put(function(req, res) {
    ResourcesController.updateById(req.params.id)
    .then(function(resources) {
      res.json(resources);
    })
  });


router.route('/:id/services')
  .get(function(req, res) {
    SessionsController.getSessionsForListing(req.params.id)
    .then(function(services) {
      res.json(services);
    })
  })

router.route('/:id/services/availability')
  .get(function(req, res) {
    var query = req.query || {};
    query.listingId = req.params.id;
    SessionsController.getAvailability(query).then(function(response) {
      res.json(response);
    })
  });


module.exports = router;
