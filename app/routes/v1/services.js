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

router.route('/')
  .post(function(req, res) {
    
  })
  .get(function(req, res) {
    ServicesController.getServices(req.query)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });

router.route('/calendars')
  .get(function(req, res) {
    CalendarsController.getCalendarsBySkill(req.query)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });

router.route('/popular')
  .get(function(req, res) {
    ServicesController.getPopularServices(req.query)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });

router.route('/:id')
  .get(function(req, res) {
    ServicesController.getById(req.params.id)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .put(function(req, res) {
    ServicesController.updateById(req.params.id, req.body)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json({error: err});
    })
  });


router.route('/:id/services')
  .get(function(req, res) {
    SessionsController.getSessionsForListing(req.params.id)
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })

router.route('/:id/services/availability')
  .get(function(req, res) {
    var query = req.query || {};
    query.listingId = req.params.id;
    SessionsController.getAvailability(query).then(function(response) {
      res.json(response);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });



router.route('/enroll')
  .post(function(req, res) {
    
    ResourcesController.addWithServiceMembershipCalendar(1, resource, service).then(function(response) {
      res.json(response);
    })
    .catch(function(err) {
      console.log(err)
      res.status(422).json(err);
    })
  });

  var resource = {
  resourceName: 'd4ddad HIPs S23d4POT',
  appFeePercentageTake:  0,
  appFeeFlatFeeTake: 0,
  bookingPercentTake: 0,
  bookingFlatFeeTake: 0,
  description: 'This is a sample',
  point: st.geomFromText('Point(-86.3332343 41.32333324)', 4326),
  cancellationPolicyPercentTake: 0,
  cancellationPolicyFlatFeeTake: 0,
  cancellationPolicyWindow: 24,
  streetAddress: 'ee222323332333e2333wr red river',
  city: 'Cleveland',
  state: 'OH',
  zipcode: 44094,
  phone: '440-444-4444',
  email: 'vprofeta12@gmail.com',
  website: 'www.google.com',
}

var service = {
  serviceDescription: 'serv4dice description',
  // service_resource_id: resource,
  serviceType: 'private',
  serviceName: 'Privates',
  active: true,
  image: 'test',
  serviceCapacity: 3,
  serviceDuration: 30,
  servicePrice: 60,
  service_skill_id: 1
}


module.exports = router;
