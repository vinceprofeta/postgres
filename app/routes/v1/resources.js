'use strict';

var express = require('express');
var _ = require('lodash');
var router = express.Router();

// Utils
var hasRole = require('../../utils/roleMiddleware');

// Models
var Listings// = require('../../models/listings');

// Controllers
var ResourcesController = require('../../controllers/resources');
var ServicesController = require('../../controllers/services');
var CalendarsController = require('../../controllers/calendars');
var UsersController = require('../../controllers/users');

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

router.route('/:id/app-fees')
  .put(function(req, res) {
    ResourcesController.updateAppFees(req.params.id, req.params)
    .then(function(resources) {
      res.json(resources);
    })
    .catch(function(err) {
      res.status(422).json(err);
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
    ResourcesController.getMembers(req.params.id, req.query, 'agent')
    .then(function(agents) {
      res.json(agents);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })

  router.route('/:id/agents/pending')
  .get(function(req, res) {
    var query = req.query || {}
    query.status = 'pending_approval'
    ResourcesController.getMembers(req.params.id, query, 'agent')
    .then(function(agents) {
      res.json(agents);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })

  router.route('/:id/agents/:agentId')
  .get(function(req, res) {
    UsersController.getById(req.params.agentId)
    .then(function(agents) {
      res.json(agents);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .put(function(req, res) {
    UsersController.updateMembership(_.merge(req.body, {resource: req.params.id, user: req.params.agentId}))
    .then(function(agents) {
      res.json(agents);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })


  router.route('/:id/clients')
  .get(function(req, res) {
    ResourcesController.getMembers(req.params.id, req.query, 'user')
    .then(function(clients) {
      res.json(clients);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })


  router.route('/:id/clients/:clientId')
  .get(function(req, res) {
    UsersController.getById(req.params.clientId)
    .then(function(clients) {
      res.json(clients);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
  .put(function(req, res) {
    UsersController.updateMembership(req.params.id, req.params.clientId, req.body)
    .then(function(clients) {
      res.json(clients);
    })
    .catch(function(err) {
      res.status(422).json(err);
    })
  })
 

module.exports = router;
