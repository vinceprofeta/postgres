'use strict';

var express = require('express');
var router = express.Router();

// Utils
var hasRole = require('../../utils/roleMiddleware');

// Models
var Listings// = require('../../models/listings');

// Controllers
var ResourcesController = require('../../controllers/resources');
var ServicesController = require('../../controllers/services');
var CalendarsController = require('../../controllers/calendars');

router.route('/')
  .post(function(req, res) {
    
  })
  .get(function(req, res) {
    ResourcesController.getResources(req.query)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });

router.route('/popular')
  .get(function(req, res) {
    ResourcesController.getPopularResources(req.query)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });

router.route('/:id')
  .get(function(req, res) {
    ResourcesController.getById(req.params.id)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .put(function(req, res) {
    ResourcesController.updateById(req.params.id, req.body)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json({error: err});
    })
  });


router.route('/:id/services')
  .get(function(req, res) {
    ServicesController.getServices({
      resource: req.params.id
     })
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .post(function(req, res) {
    ServicesController.add({
      resource: req.params.id,
      params: req.body
    })
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })

router.route('/:id/services/:serviceId')
  .get(function(req, res) {
    ServicesController.getById(req.params.serviceId)
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .put(function(req, res) {
    ServicesController.updateById(req.params.serviceId, req.body)
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })


router.route('/:id/services/:serviceId/availability')
  .get(function(req, res) {
    // TODO
    // ServicesController.getById(req.params.serviceId)
    // .then(function(services) {
    //   res.json(services);
    // })
    // .catch(function(err) {
    //   res.status(422).json(err);
    // })
  })


router.route('/:id/services/:serviceId/calendars')
  .get(function(req, res) {
    CalendarsController.getCalendars(req.params.serviceId)
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .post(function(req, res) {
    CalendarsController.add({
      resource: req.params.id,
      service: req.params.serviceId,
      agent: req.body.agent,
      params: req.body
    })
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  });


router.route('/:id/services/:serviceId/calendars/:calendarId')
  .get(function(req, res) {
    CalendarsController.getById(req.params.serviceId)
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .put(function(req, res) {
    CalendarsController.updateById(req.params.serviceId, req.body)
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })




  router.route('/:id/agents')
  .get(function(req, res) {
    ResourcesController.getAgents(req.params.id, req.query, 'agent')
    .then(function(services) {
      res.json(services);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
 

module.exports = router;
