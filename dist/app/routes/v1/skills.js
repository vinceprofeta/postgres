'use strict';

var express = require('express');
var router = express.Router();

// Utils
var hasRole = require('../../utils/roleMiddleware');

// Models
var SkillsController = require('../../controllers/skills');

router.route('/').post(function (req, res) {
  SkillsController.add(req.body).then(function (skills) {
    res.json(skills);
  }).catch(function (err) {
    res.status(422).json(err);
  });
}).get(function (req, res) {
  SkillsController.getAll(req.query).then(function (skills) {
    res.json(skills);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/popular').get(function (req, res) {
  SkillsController.getPopular(req.query).then(function (skills) {
    res.json(skills);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/categories').post(function (req, res) {
  SkillsController.addCategory(req.body).then(function (skills) {
    res.json(skills);
  }).catch(function (err) {
    res.status(422).json(err);
  });
}).get(function (req, res) {
  SkillsController.getAllCategories(req.query).then(function (skills) {
    res.json(skills);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

router.route('/:id').get(function (req, res) {
  SkillsController.getById(req.params.id).then(function (skills) {
    res.json(skills);
  }).catch(function (err) {
    res.status(422).json(err);
  });
}).put(function (req, res) {
  SkillsController.updateById(req.params.id, req.body).then(function (skills) {
    res.json(skills);
  }).catch(function (err) {
    res.status(422).json(err);
  });
});

module.exports = router;