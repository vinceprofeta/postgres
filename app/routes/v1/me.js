'use strict';

var express = require('express');
var _ = require('lodash');
var router = express.Router();

// Utils
var cloudinary = require('../../utils/cloudinary');
var bookshelf = require('../../../db/bookshelf');

// Models
var Roles// = require('../../models/roles');

//Controllers
var Users = require('../../controllers/users');
var Conversations = require('../../controllers/conversations');
var Services = require('../../controllers/services');
var Calendars = require('../../controllers/calendars');
var Bookings = require('../../controllers/bookings');
var Transactions = require('../../controllers/transactions');
var Favorites = require('../../controllers/favorites');
var Memberships = require('../../controllers/memberships');

router.route('/')
  .get(function(req, res) {
    // console.log(req.decoded)
    Users
      .getById(req.decoded._id) // when getting me we want to populate everything
      .then(function(user) {
        if (!user) {
          res.status(404).json({error: 'no user found'});
        }
        res.json(user);
      })
      .catch(function(err) {
        res.status(422).json(err);
      });
  })
  .put(function(req, res) {
    Users
      .updateById(req.decoded._id, req.body)
      .then(function(user) {
        res.json(user);
      })
      .catch(function(err) {
        res.status(422).json(err);
      });
  })
  .delete(function(req, res) {
    Users
      .deleteAccount(req.decoded)
      .then(function(user) {
        res.json(user);
      })
      .catch(function(err) {
        res.status(422).json(err);
      });
  });


  router.route('/conversations')
  .get(function(req, res) {
    Conversations
      .getConversationsForUser(req.decoded._id)
      .then(function(conversations) {
        console.log(conversations.toJSON())
        if (!_.get(conversations, 'length')) {
          res.status(404).json({error: 'no conversations found'});
        }
        res.json(conversations);
      })
      .catch(function(err) {
        res.status(422).json(err);
      });
  });


router.route('/bookings')
  .get(function(req, res) {
    var query = req.query || {};
    query.id = req.decoded._id;
    if (true) { //req.query && req.query.role !== 'user'
      Bookings
        .getBookings(query)
        .then(function(bookings) {
          console.log(bookings);
          res.json(bookings);
        });

    } else {
      query.notComplete = true;
      Users
        .getSessions(query)
        .then(function(bookings) {
          res.json(bookings);
        });
    }

  })
  .post(function(req, res) {
    var session;
    if (req.body.session) {
      try {
        session = JSON.parse(req.body.session);
        console.log(session)
        session.instructor = req.decoded._id;
      } catch(err) {
        console.log(err)
        res.status(422).json({error: 'invalid format'});
        return;
      }
      Sessions
        .add(session)
        .then(function(response) {
          res.json(response);
        })
        .catch(function(err) {
          console.log(err)
          res.status(422).json(err);
        });
    }
  })
  

router.route('/sessions/enroll')
  .put(function(req, res) {   
    var sessions = req.body.sessions || [];
    sessions = JSON.parse(sessions);
    Transactions.getTransactions(req.decoded._id, 1, 0, null, null, null, true)
    .then(function(failedTransactions) {
      if (failedTransactions.length) {
        res.status(422).json({error: 'outstanding failed payments, please update payment method and resolve'});
      } else {
        return Users.getPaymentMethod(req.decoded._id);
      }
    })
    .then(function(user) {
      if (true) { //user.paymentMethod TODO
        if (sessions.length && sessions.length === 1) {
          return Users.addSession(user, sessions[0], res);
        } else {
          return Users.mergeSessions(user, sessions, res);
        }
      } else {
        res.status(422).json({"error": "No payment method"});
      }
    })
    .then(function(session) {
      res.json(session);
    })
    .catch(function(err) {
      res.status(422).json(err);
    });
  });



router.route('/calendars/favorites')
  .get(function(req, res) {
    var queryObject = {
      user: req.decoded._id
    }
    Favorites.getAll(queryObject)
    .then(function(favorites) {
      res.json(favorites);
    })
    .catch(function(err) {
      res.status(422).json(err);
    });
  })
  .put(function(req, res) {
    var params = {
      user: req.decoded._id,
      calendar: req.body.calendar
    }
    Favorites.add(params)
    .then(function(favorites) {
      res.json(favorites);
    })
    .catch(function(err) {
      res.status(422).json(err);
    });
  })





router.route('/calendars')
  .get(function(req, res) {
    var queryObject = {
      agent: req.decoded._id
    }
    Calendars.getCalendars(queryObject)
    .then(function(response) {
      res.json(response);
    });
  })

  router.route('/services/add')
  .post(function(req, res) {
    var service;
    if (req.body.service) {
      try {
        service = JSON.parse(req.body.service);
      } catch(err) {
        res.status(422).json({error: 'invalid format'});
        return;
      } 
      bookshelf.knex.transaction(function(trx) {     
        return bookshelf.knex('memberships').transacting(trx).where({membership_user_id: req.decoded._id, default: true})
        .then((m) => {
          m = _.get(m, '[0]');
          if (!m) { throw new Error({error: 'no membership found'}) };
          service.service_resource_id = m.membership_resource_id;
          return Services.add(service, trx)
        })
        .then(function(response) {
          return Calendars.add({
            agent: req.decoded._id,
            service: response.id
          }, trx)
        })
        .then(function(response) {
          trx.commit
          res.json({success: true});
        })
        .catch(function(err) {
          console.log(err)
          trx.rollback
          res.status(422).json(err);
        });
      });
      
    }
  });


  router.route('/listings/:id/sessions/batch')
  .post(function(req, res) {
    var times;
    try {
      times = JSON.parse(req.body.sessions).times 
    } catch(err) {
      res.status(422).json(err);
    }
    Listings.addSessionsForListing(req.params.id, times)
    .then(function(response) {
      res.json(response);
    });
  });

module.exports = router;
