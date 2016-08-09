var knex = require('./knex')
var Bookshelf = require('bookshelf')(knex);
var fs = require('fs');

var models = fs.readdirSync('app/models')

Bookshelf.plugin('visibility');
Bookshelf.plugin('registry');

models.forEach(function(model) {
  if (model.indexOf('.js') > -1) {
    require('../app/models/' + model)(Bookshelf)
  }
})

module.exports = Bookshelf
