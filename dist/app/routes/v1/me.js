'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var express = require('express');
var _ = require('lodash');
var router = express.Router();

// Utils
var cloudinary = require('../../utils/cloudinary');
var bookshelf = require('../../../db/bookshelf');

// Models
var Roles; // = require('../../models/roles');

//Controllers
var Users = require('../../controllers/users');
var Conversations = require('../../controllers/conversations');
var Services = require('../../controllers/services');
var Calendars = require('../../controllers/calendars');
var Bookings = require('../../controllers/bookings');
var Transactions = require('../../controllers/transactions');
var Favorites = require('../../controllers/favorites');
var Memberships = require('../../controllers/memberships');
var Availability = require('../../controllers/availability');
var StripeActions = require('../../controllers/stripeActions');

var ResourcesController = require('../../controllers/resources');

router.route('/').get(function (req, res) {

  Users.getById(req.decoded._id) // when getting me we want to populate everything
  .then(function (user) {
    if (!user) {
      res.status(404).json({ error: 'no user found' });
    }
    res.json(user);
  }).catch(function (err) {
    res.status(422).json(err);
  });
}).put(function (req, res) {
  Users.updateById(req.decoded._id, req.body).then(function (user) {
    res.json(user);
  }).catch(function (err) {
    res.status(422).json(err);
  });
}).delete(function (req, res) {
  Users.deleteAccount(req.decoded).then(function (user) {
    res.json(user);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/conversations').get(function (req, res) {
  Conversations.getConversationsForUser(req.decoded._id).then(function (conversations) {
    if (!_.get(conversations, 'length')) {
      res.status(404).json({ error: 'no conversations found' });
      return;
    }
    res.json(conversations);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/bookings').get(function (req, res) {
  var query = req.query || {};
  query.user = req.decoded._id;
  if (req.query.role === 'agent') {
    query.agent = req.decoded._id;
    Bookings.getBookings(query).then(function (bookings) {
      res.json(bookings);
    }).catch(function (err) {
      console.log(err);
      res.status(422).json(err);
    });
  } else {
    Bookings.getUsersBookings(query).then(function (bookings) {
      res.json(bookings);
    });
  }
}).post(function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(req, res) {
    var calendars, booking;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            calendars = req.body.calendars || [];

            calendars = JSON.parse(calendars);
            _context.prev = 2;
            _context.next = 5;
            return Bookings.add({ user: req.decoded._id, calendar: calendars[0] });

          case 5:
            booking = _context.sent;

            res.json(booking);
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](2);

            res.status(422).json(_context.t0);

          case 12:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 9]]);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

router.route('/bookings/needs-complete').get(function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(req, res) {
    var bookings;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return Bookings.getBookingsThatNeedCompletion({ date: req.query.date, agent: req.decoded._id });

          case 3:
            bookings = _context2.sent;

            console.log(bookings);
            res.json(bookings);
            _context2.next = 12;
            break;

          case 8:
            _context2.prev = 8;
            _context2.t0 = _context2['catch'](0);

            console.log(_context2.t0);
            res.status(422).json(_context2.t0);

          case 12:
            ;

          case 13:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 8]]);
  }));

  return function (_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}());

router.route('/bookings/needs-review').get(function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(req, res) {
    var bookings;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return Bookings.getBookingsForReview({ date: req.query.date, agent: req.decoded._id });

          case 3:
            bookings = _context3.sent;

            console.log(bookings);
            res.json(bookings);
            _context3.next = 12;
            break;

          case 8:
            _context3.prev = 8;
            _context3.t0 = _context3['catch'](0);

            console.log(_context3.t0);
            res.status(422).json(_context3.t0);

          case 12:
            ;

          case 13:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 8]]);
  }));

  return function (_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
}());

router.route('/bookings/:id').get(function (req, res) {
  Bookings.getById(req.params.id).then(function (booking) {
    console.log(booking);
    res.json(booking);
  }).catch(function (err) {
    console.log(err);
    res.status(422).json(err);
  });
});

router.route('/bookings/:id/drop').post(function (req, res) {
  Bookings.drop(req.params.id, req.decoded._id).then(function (drop) {
    console.log(drop);
    res.json(drop);
  }).catch(function (err) {
    console.log(err);
    res.status(422).json(err);
  });
});

router.route('/bookings/:id/cancel').post(function (req, res) {
  Bookings.cancel(req.params.id, req.decoded._id).then(function (cancel) {
    console.log(cancel);
    res.json(cancel);
  }).catch(function (err) {
    console.log(err);
    res.status(422).json(err);
  });
});

router.route('/bookings/:id/complete').post(function (req, res) {
  Bookings.complete(req.params.id, req.decoded._id).then(function (complete) {
    console.log(complete);
    res.json(complete);
  }).catch(function (err) {
    console.log(err);
    res.status(422).json(err);
  });
});

router.route('/calendars/favorites').get(function (req, res) {
  var queryObject = {
    user: req.decoded._id
  };
  Favorites.getAll(queryObject).then(function (favorites) {
    res.json(favorites);
  }).catch(function (err) {
    res.status(422).json(err);
  });
}).put(function (req, res) {
  var params = {
    user: req.decoded._id,
    calendar: req.body.calendar
  };
  Favorites.add(params).then(function (favorites) {
    res.json(favorites);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/calendars').get(function (req, res) {
  var queryObject = {
    agent: req.decoded._id
  };
  Calendars.getCalendars(queryObject).then(function (response) {
    res.json(response);
  });
});

router.route('/availability').post(function (req, res) {
  Availability.setAvailability(req.decoded._id, req.body).then(function (response) {
    res.json(response);
  });
});

// router.route('/listings/:id/sessions/batch')
// .post(function(req, res) {
//   var times;
//   try {
//     times = JSON.parse(req.body.sessions).times 
//   } catch(err) {
//     res.status(422).json(err);
//   }
//   Listings.addSessionsForListing(req.params.id, times)
//   .then(function(response) {
//     res.json(response);
//   });
// });


router.route('/services/add').post(function (req, res) {
  var data = {};
  try {
    data = JSON.parse(req.body.data);
  } catch (err) {
    console.log(err);
    res.status(422).json(err);
  }

  if (data.service) {
    bookshelf.knex('memberships').join('roles', 'roles.id', '=', 'memberships.membership_role_id').where('membership_user_id', Number(req.decoded._id)).andWhere('role_name', 'resource-admin').select('*').then(function (membership) {
      membership = _.get(membership, '[0]');
      if (!membership) {
        if (!data.resource) {
          throw new Error('resource must be included');
        };
        ResourcesController.addWithServiceMembershipCalendar(req.decoded._id, data.resource, data.service).then(function (response) {
          res.json(response);
        }).catch(function (err) {
          console.log(err);
          res.status(422).json(err);
        });
      } else {
        Services.addService(req.decoded._id, data.service, membership.membership_resource_id).then(function (response) {
          res.json(response);
        }).catch(function (err) {
          console.log(err);
          res.status(422).json(err);
        });
      }
    }).catch(function (err) {
      console.log(err);
      res.status(422).json(err);
    });
  } else {
    console.log('error missing data');
    res.status(422).json();
  }
});

router.route('/payment-methods').get(function () {
  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(req, res) {
    var paymentMethods;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.prev = 0;
            _context4.next = 3;
            return Users.getPaymentMethods(req.decoded._id);

          case 3:
            paymentMethods = _context4.sent;

            res.json(paymentMethods);
            _context4.next = 10;
            break;

          case 7:
            _context4.prev = 7;
            _context4.t0 = _context4['catch'](0);

            res.status(422).json({ error: _context4.t0 });

          case 10:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[0, 7]]);
  }));

  return function (_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
}()).post(function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee5(req, res) {
    var newCard, token, user;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.prev = 0;
            newCard = void 0;
            token = _.get(req.body, 'stripeToken');
            _context5.next = 5;
            return Users.getById(req.decoded._id);

          case 5:
            user = _context5.sent;

            if (!(user && user.attributes && !user.attributes.stripe_customer_id)) {
              _context5.next = 12;
              break;
            }

            _context5.next = 9;
            return StripeActions.addCustomer(user.attributes, token);

          case 9:
            newCard = _context5.sent;
            _context5.next = 15;
            break;

          case 12:
            _context5.next = 14;
            return StripeActions.addCard(token, user.stripe_customer_id, user);

          case 14:
            newCard = _context5.sent;

          case 15:
            _context5.next = 17;
            return Users.updateById(newCard.user_id, { stripe_customer_id: newCard.card.id });

          case 17:
            res.json(newCard.id);
            _context5.next = 23;
            break;

          case 20:
            _context5.prev = 20;
            _context5.t0 = _context5['catch'](0);

            res.status(422).json({ error: _context5.t0 });

          case 23:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this, [[0, 20]]);
  }));

  return function (_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
}()).delete(function () {
  var _ref6 = _asyncToGenerator(regeneratorRuntime.mark(function _callee6(req, res) {
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function (_x11, _x12) {
    return _ref6.apply(this, arguments);
  };
}());

module.exports = router;