var express = require('express');
var router = express.Router();
var knex = require('../../db/knex');

var bookshelf = require('../../db/bookshelf');
var Conversations = bookshelf.model('conversations');

/* GET users listing. */
router.get('/', function(req, res, next) {
  return Conversations.fetchAll({
    withRelated: ['chats.user'],
  })
  
  // .join('resources', 'resources.id', 'services.service_resource_id')
  .then(function(w) {
    res.json(w);
  })
});

module.exports = router;
